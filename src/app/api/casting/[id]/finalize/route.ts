import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  action: z.enum(['select', 'reject']),
});

const VALID_TRANSITIONS: Record<string, Record<string, string>> = {
  select: {
    AUDITION_SUBMITTED: 'SELECTED',
  },
  reject: {
    AUDITION_SUBMITTED: 'REJECTED_AFTER_AUDITION',
  },
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    );
  }

  const { id } = await params;

  const offer = await db.castingOffer.findUnique({
    where: { id },
  });

  if (!offer) {
    return NextResponse.json(
      { error: '없는 제안입니다.' },
      { status: 404 },
    );
  }

  if (offer.senderUserId !== session.user.id) {
    return NextResponse.json(
      { error: '권한이 없습니다.' },
      { status: 403 },
    );
  }

  try {
    const { action } = schema.parse(await req.json());

    const nextStatus =
      VALID_TRANSITIONS[action]?.[offer.status];

    if (!nextStatus) {
      return NextResponse.json(
        { error: '잘못된 상태 전이입니다.' },
        { status: 400 },
      );
    }

    const updated = await db.castingOffer.update({
      where: { id },
      data: {
        status: nextStatus as any,
      },
    });

    if (action === 'select') {
      await db.character.update({
        where: {
          id: offer.characterId,
        },
        data: {
          castingStatus: 'CAST',
        },
      });
    }

    await db.notification.create({
      data: {
        userId: offer.receiverUserId,
        type: 'CASTING',
        title:
          action === 'select'
            ? '최종 합격'
            : '최종 불합격',
        body:
          action === 'select'
            ? '캐스팅에 최종 선정되었습니다.'
            : '이번 캐스팅에는 선정되지 않았습니다.',
        link: `/casting/${id}`,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: '오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}