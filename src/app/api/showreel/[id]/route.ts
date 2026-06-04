import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUserId, apiError } from '@/lib/api-helpers';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await params;
  const item = await db.showreel.findUnique({ where: { id } });
  if (!item || item.userId !== userId) return apiError.forbidden();

  try {
    const { deleteFile } = await import('@/lib/storage');
    const path = item.videoUrl.split('/showreels/')[1];
    if (path) await deleteFile('showreels', path);
  } catch {}

  await db.showreel.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await params;
  const item = await db.showreel.findUnique({ where: { id } });
  if (!item || item.userId !== userId) return apiError.forbidden();

  const body = await req.json();

  // When promoting a showreel to featured, first clear all others for this user
  // (excluding the target itself to avoid the unnecessary clear + re-set cycle).
  if (body.isFeatured === true) {
    await db.showreel.updateMany({
      where: { userId, id: { not: id } },
      data: { isFeatured: false },
    });
  }

  const updated = await db.showreel.update({
    where: { id },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.tags && { tags: body.tags }),
      ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
    },
  });
  return NextResponse.json(updated);
}
