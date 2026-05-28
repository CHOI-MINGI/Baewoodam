import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: offerId } = await params;
  const offer = await db.castingOffer.findUnique({ where: { id: offerId } });
  if (!offer) return NextResponse.json({ error: '없는 제안입니다.' }, { status: 404 });
  if (offer.receiverUserId !== session.user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }
  if (offer.status !== 'ACCEPTED') {
    return NextResponse.json({ error: '수락된 제안만 오디션을 제출할 수 있습니다.' }, { status: 400 });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const note = formData.get('note') as string | null;

    const { uploadVideo } = await import('@/lib/storage');

    const firstFile = files[0];
    let auditionVideoUrl = '';
    if (firstFile) {
      auditionVideoUrl = await uploadVideo(session.user.id!, firstFile, 'auditions');
    }

    const updated = await db.castingOffer.update({
      where: { id: offerId },
      data: {
        status: 'AUDITION_SUBMITTED',
        auditionVideoUrl,
        auditionNote: note,
      },
    });

    // 발신자 알림
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
