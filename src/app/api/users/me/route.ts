import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUserId, handleRouteError, apiError } from '@/lib/api-helpers';

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
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { actorProfile: true, agencyProfile: true },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    const data = updateSchema.parse(await req.json());

    const {
      ageRange, gender, skills, preferredGenres,
      companyName, position,
      ...userFields
    } = data;

    const user = await db.user.update({
      where: { id: userId },
      data: userFields,
    });

    // Use strict undefined checks so that passing an empty array (e.g. skills:[])
    // correctly clears all values rather than being silently skipped.
    const hasActorProfileFields =
      ageRange !== undefined ||
      gender !== undefined ||
      skills !== undefined ||
      preferredGenres !== undefined;

    if (hasActorProfileFields) {
      await db.actorProfile.upsert({
        where: { userId },
        update: {
          ...(ageRange !== undefined && { ageRange }),
          ...(gender !== undefined && { gender }),
          ...(skills !== undefined && { skills }),
          ...(preferredGenres !== undefined && { preferredGenres }),
        },
        create: {
          userId,
          ageRange,
          gender,
          skills: skills ?? [],
          preferredGenres: preferredGenres ?? [],
        },
      });
    }

    if (companyName !== undefined || position !== undefined) {
      await db.agencyProfile.upsert({
        where: { userId },
        update: {
          ...(companyName !== undefined && { companyName }),
          ...(position !== undefined && { position }),
          ...(preferredGenres !== undefined && { preferredGenres }),
        },
        create: {
          userId,
          companyName,
          position,
          preferredGenres: preferredGenres ?? [],
        },
      });
    }

    return NextResponse.json(user);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE() {
  try {
    const userId = await requireUserId();
    if (userId instanceof NextResponse) return userId;

    await db.$transaction(async (tx) => {
      // Clear linkedUser references in other users' WorkCredits before deleting this account.
      await tx.workCredit.updateMany({ where: { linkedUserId: userId }, data: { linkedUserId: null } });
      // Delete own Works (WorkCredits cascade via FK).
      await tx.work.deleteMany({ where: { userId } });
      // CastingOffers have no cascade on sender/receiver — delete explicitly.
      await tx.castingOffer.deleteMany({
        where: { OR: [{ senderUserId: userId }, { receiverUserId: userId }] },
      });
      // Finally delete the User row (Filmography, Showreel, Notification, Project cascade).
      await tx.user.delete({ where: { id: userId } });
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[DELETE /api/users/me]', err?.message);
    return apiError.serverError(err?.message ?? '계정 삭제 중 오류가 발생했습니다.');
  }
}
