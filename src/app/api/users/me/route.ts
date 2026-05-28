import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  image: z.string().optional(),
  roleType: z.enum(['ACTOR', 'AGENCY']).optional(),
  onboardingCompleted: z.boolean().optional(),
  location: z.string().optional(),
  contactableTime: z.string().optional(),
  contactMemo: z.string().optional(),
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
