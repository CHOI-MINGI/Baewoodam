import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUserId, handleRouteError, apiError } from '@/lib/api-helpers';

const sendSchema = z.object({
  actorId: z.string(),
  projectId: z.string(),
  characterId: z.string(),
  shootingPeriod: z.string().optional().nullable(),
  shootingLocation: z.string().optional().nullable(),
  conditions: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const type = req.nextUrl.searchParams.get('type') ?? 'received';
  const status = req.nextUrl.searchParams.get('status');

  const where =
    type === 'sent'
      ? { senderUserId: userId, ...(status && { status: status as any }) }
      : { receiverUserId: userId, ...(status && { status: status as any }) };

  const offers = await db.castingOffer.findMany({
    where,
    include: {
      project: { select: { id: true, title: true, mediaType: true, genre: true, logline: true, synopsis: true } },
      character: { select: { id: true, name: true, ageRange: true, gender: true, description: true, keywords: true } },
      sender: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(offers);
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    const body = sendSchema.parse(await req.json());

    const offer = await db.castingOffer.create({
      data: {
        projectId: body.projectId,
        characterId: body.characterId,
        senderUserId: userId,
        receiverUserId: body.actorId,
        shootingPeriod: body.shootingPeriod,
        shootingLocation: body.shootingLocation,
        conditions: body.conditions,
        message: body.message,
      },
    });

    await db.notification.create({
      data: {
        userId: body.actorId,
        type: 'CASTING',
        title: '새 캐스팅 제안',
        body: '새로운 캐스팅 제안이 도착했습니다.',
        link: `/casting/${offer.id}`,
      },
    });

    return NextResponse.json(offer, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
