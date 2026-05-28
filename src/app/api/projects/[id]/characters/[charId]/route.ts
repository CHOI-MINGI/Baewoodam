import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; charId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: projectId, charId } = await params;
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project || project.ownerUserId !== session.user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const body = await req.json();
  const character = await db.character.update({ where: { id: charId }, data: body });
  return NextResponse.json(character);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; charId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: projectId, charId } = await params;
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project || project.ownerUserId !== session.user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  await db.character.delete({ where: { id: charId } });
  return NextResponse.json({ ok: true });
}
