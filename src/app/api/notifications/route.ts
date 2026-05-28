import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const type = req.nextUrl.searchParams.get('type');
  const cursor = req.nextUrl.searchParams.get('cursor');

  const notifications = await db.notification.findMany({
    where: {
      userId: session.user.id,
      ...(type && { type: type as any }),
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  });

  return NextResponse.json(notifications);
}
