import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUserId } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const type = req.nextUrl.searchParams.get('type');
  const cursor = req.nextUrl.searchParams.get('cursor');

  const notifications = await db.notification.findMany({
    where: {
      userId,
      ...(type && { type: type as any }),
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  });

  return NextResponse.json(notifications);
}
