import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const notif = await db.notification.findUnique({ where: { id } });
  if (!notif || notif.userId !== session.user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  await db.notification.update({ where: { id }, data: { isRead: true } });
  return NextResponse.json({ ok: true });
}
