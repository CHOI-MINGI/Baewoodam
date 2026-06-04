import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUserId, apiError } from '@/lib/api-helpers';

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await params;
  const notif = await db.notification.findUnique({ where: { id } });
  if (!notif || notif.userId !== userId) return apiError.forbidden();

  await db.notification.update({ where: { id }, data: { isRead: true } });
  return NextResponse.json({ ok: true });
}
