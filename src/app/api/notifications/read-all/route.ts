import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUserId } from '@/lib/api-helpers';

export async function PATCH() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  await db.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ ok: true });
}
