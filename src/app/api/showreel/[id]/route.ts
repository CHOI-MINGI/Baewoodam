import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const item = await db.showreel.findUnique({ where: { id } });
  if (!item || item.userId !== session.user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  // Supabase Storage에서도 삭제
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
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const item = await db.showreel.findUnique({ where: { id } });
  if (!item || item.userId !== session.user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const body = await req.json();
  const updated = await db.showreel.update({
    where: { id },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.tags && { tags: body.tags }),
    },
  });
  return NextResponse.json(updated);
}
