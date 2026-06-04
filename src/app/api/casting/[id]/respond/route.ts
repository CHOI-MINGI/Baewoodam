import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUserId, handleRouteError, apiError } from '@/lib/api-helpers';

const respondSchema = z.object({
  action: z.enum(['accept', 'reject']),
  rejectReason: z.string().optional(),
});

const VALID_TRANSITIONS: Record<string, Record<string, string>> = {
  accept: { PENDING: 'ACCEPTED' },
  reject: { PENDING: 'REJECTED' },
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await params;
  const offer = await db.castingOffer.findUnique({ where: { id } });
  if (!offer) return apiError.notFound('없는 제안입니다.');
  if (offer.receiverUserId !== userId) return apiError.forbidden();

  try {
    const { action, rejectReason } = respondSchema.parse(await req.json());

    const nextStatus = VALID_TRANSITIONS[action]?.[offer.status];
    if (!nextStatus) return apiError.badRequest('잘못된 상태 전이입니다.');

    const updated = await db.castingOffer.update({
      where: { id },
      data: {
        status: nextStatus as any,
        ...(rejectReason && { rejectReason }),
      },
    });

    await db.notification.create({
      data: {
        userId: offer.senderUserId,
        type: 'CASTING',
        title: action === 'accept' ? '캐스팅 제안 수락' : '캐스팅 제안 거절',
        body:
          action === 'accept'
            ? '배우가 캐스팅 제안을 수락했습니다.'
            : '배우가 캐스팅 제안을 거절했습니다.',
        link: `/casting/${id}`,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return handleRouteError(err);
  }
}
