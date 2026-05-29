import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  _req: NextRequest,
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
    include: {
      project: {
        select: {
          id: true,
          title: true,
          mediaType: true,
          genre: true,
          logline: true,
          synopsis: true,
        },
      },
      character: {
        select: {
          id: true,
          name: true,
          ageRange: true,
          gender: true,
          description: true,
          keywords: true,
        },
      },
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!offer) {
    return NextResponse.json(
      { error: '없는 제안입니다.' },
      { status: 404 },
    );
  }

  if (
    offer.senderUserId !== session.user.id &&
    offer.receiverUserId !== session.user.id
  ) {
    return NextResponse.json(
      { error: '권한이 없습니다.' },
      { status: 403 },
    );
  }

  return NextResponse.json(offer);
}

export async function DELETE(
  _req: NextRequest,
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
      { error: '캐스팅 제안이 없습니다.' },
      { status: 404 },
    );
  }

  if (offer.senderUserId !== session.user.id) {
    return NextResponse.json(
      { error: '권한이 없습니다.' },
      { status: 403 },
    );
  }

  if (offer.status === 'SELECTED') {
    return NextResponse.json(
      {
        error: '최종 합격된 제안은 삭제할 수 없습니다.',
      },
      { status: 400 },
    );
  }

  await db.castingOffer.delete({
    where: { id },
  });

  return NextResponse.json({
    success: true,
  });
}