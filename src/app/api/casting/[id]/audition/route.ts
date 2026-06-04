import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUserId, apiError } from '@/lib/api-helpers';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { id: offerId } = await params;
  const offer = await db.castingOffer.findUnique({ where: { id: offerId } });
  if (!offer) return apiError.notFound('없는 제안입니다.');
  if (offer.receiverUserId !== userId) return apiError.forbidden();
  if (offer.status !== 'ACCEPTED') {
    return apiError.badRequest('수락된 제안만 오디션을 제출할 수 있습니다.');
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const note = formData.get('note') as string | null;

    const { uploadVideo } = await import('@/lib/storage');

    const firstFile = files[0];
    const auditionVideoUrl = firstFile
      ? await uploadVideo(userId, firstFile, 'auditions')
      : '';

    const updated = await db.castingOffer.update({
      where: { id: offerId },
      data: { status: 'AUDITION_SUBMITTED', auditionVideoUrl, auditionNote: note },
    });

    await db.notification.create({
      data: {
        userId: offer.senderUserId,
        type: 'CASTING',
        title: '오디션 영상 제출',
        body: '배우가 오디션 영상을 제출했습니다.',
        link: `/casting/${offerId}`,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? '오류가 발생했습니다.' }, { status: 500 });
  }
}
