import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUserId, handleRouteError, apiError } from '@/lib/api-helpers';

const finalizeSchema = z.object({
  action: z.enum(['select', 'reject']),
});

const VALID_TRANSITIONS: Record<string, Record<string, string>> = {
  select: { AUDITION_SUBMITTED: 'SELECTED' },
  reject: { AUDITION_SUBMITTED: 'REJECTED_AFTER_AUDITION' },
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
  if (offer.senderUserId !== userId) return apiError.forbidden();

  try {
    const { action } = finalizeSchema.parse(await req.json());

    const nextStatus = VALID_TRANSITIONS[action]?.[offer.status];
    if (!nextStatus) return apiError.badRequest('잘못된 상태 전이입니다.');

    const updated = await db.castingOffer.update({
      where: { id },
      data: { status: nextStatus as any },
    });

    if (action === 'select') {
      await db.character.update({
        where: { id: offer.characterId },
        data: { castingStatus: 'CAST' },
      });
    }

    await db.notification.create({
      data: {
        userId: offer.receiverUserId,
        type: 'CASTING',
        title: action === 'select' ? '최종 합격' : '최종 불합격',
        body:
          action === 'select'
            ? '캐스팅에 최종 선정되었습니다.'
            : '이번 캐스팅에는 선정되지 않았습니다.',
        link: `/casting/${id}`,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return handleRouteError(err);
  }
}
