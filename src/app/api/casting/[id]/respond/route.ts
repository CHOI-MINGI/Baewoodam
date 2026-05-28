import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
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
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const offer = await db.castingOffer.findUnique({ where: { id } });
  if (!offer) return NextResponse.json({ error: '없는 제안입니다.' }, { status: 404 });
  if (offer.receiverUserId !== session.user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  try {
    const { action, rejectReason } = schema.parse(await req.json());

    const nextStatus = VALID_TRANSITIONS[action]?.[offer.status];
    if (!nextStatus) {
      return NextResponse.json({ error: '잘못된 상태 전이입니다.' }, { status: 400 });
    }

    const updated = await db.castingOffer.update({
      where: { id },
      data: {
        status: nextStatus as any,
        ...(rejectReason && { rejectReason }),
      },
    });

    // 발신자 알림
    await db.notification.create({
      data: {
        userId: offer.senderUserId,
        type: 'CASTING',
        title: action === 'accept' ? '캐스팅 제안 수락' : '캐스팅 제안 거절',
        body: action === 'accept'
          ? '배우가 캐스팅 제안을 수락했습니다.'
          : '배우가 캐스팅 제안을 거절했습니다.',
        link: `/casting/${id}`,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    return NextResponse.json({ error: '오류가 발생했습니다.' }, { status: 500 });
  }
}
