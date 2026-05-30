import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  image: z.string().optional(),
  coverImage: z.string().optional(),
  roleType: z.enum(['ACTOR', 'AGENCY']).optional(),
  onboardingCompleted: z.boolean().optional(),
  location: z.string().optional(),
  contactableTime: z.string().optional(),
  contactMemo: z.string().optional(),
  isPublic: z.boolean().optional(),
  ageRange: z.enum(['TEENS', 'TWENTIES', 'THIRTIES', 'FORTIES', 'FIFTIES']).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  skills: z.array(z.string()).optional(),
  preferredGenres: z.array(z.string()).optional(),
  companyName: z.string().optional(),
  position: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { actorProfile: true, agencyProfile: true },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const {
      ageRange, gender, skills, preferredGenres,
      companyName, position,
      ...userFields
    } = data;

    const user = await db.user.update({
      where: { id: session.user.id },
      data: userFields,
    });

    if (ageRange || gender || skills || preferredGenres) {
      await db.actorProfile.upsert({
        where: { userId: session.user.id },
        update: { ageRange, gender, ...(skills && { skills }), ...(preferredGenres && { preferredGenres }) },
        create: { userId: session.user.id, ageRange, gender, skills: skills ?? [], preferredGenres: preferredGenres ?? [] },
      });
    }

    if (companyName || position) {
      await db.agencyProfile.upsert({
        where: { userId: session.user.id },
        update: { companyName, position, ...(preferredGenres && { preferredGenres }) },
        create: { userId: session.user.id, companyName, position, preferredGenres: preferredGenres ?? [] },
      });
    }

    return NextResponse.json(user);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id as string;

    await db.$transaction(async (tx) => {
      // 1. 다른 유저 WorkCredit에서 linkedUser 참조 null 처리
      await tx.workCredit.updateMany({ where: { linkedUserId: userId }, data: { linkedUserId: null } });
      // 2. 내 Work 삭제 (WorkCredit cascade)
      await tx.work.deleteMany({ where: { userId } });
      // 3. CastingOffer (sender/receiver에 cascade 없어서 직접 삭제)
      await tx.castingOffer.deleteMany({
        where: { OR: [{ senderUserId: userId }, { receiverUserId: userId }] },
      });
      // 4. User 삭제 (Filmography, Showreel, Notification, Project 등 cascade)
      await tx.user.delete({ where: { id: userId } });
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[DELETE /api/users/me]', err?.message);
    return NextResponse.json({ error: err?.message ?? '계정 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
