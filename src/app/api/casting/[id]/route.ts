import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUserId, apiError } from '@/lib/api-helpers';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await params;

  const offer = await db.castingOffer.findUnique({
    where: { id },
    include: {
      project: {
        select: { id: true, title: true, mediaType: true, genre: true, logline: true, synopsis: true },
      },
      character: {
        select: { id: true, name: true, ageRange: true, gender: true, description: true, keywords: true },
      },
      sender: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
    },
  });

  if (!offer) return apiError.notFound('없는 제안입니다.');

  if (offer.senderUserId !== userId && offer.receiverUserId !== userId) {
    return apiError.forbidden();
  }

  return NextResponse.json(offer);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await params;

  const offer = await db.castingOffer.findUnique({ where: { id } });
  if (!offer) return apiError.notFound('캐스팅 제안이 없습니다.');
  if (offer.senderUserId !== userId) return apiError.forbidden();

  if (offer.status === 'SELECTED') {
    return apiError.badRequest('최종 합격된 제안은 삭제할 수 없습니다.');
  }

  await db.castingOffer.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
