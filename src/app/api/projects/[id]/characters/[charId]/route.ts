import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUserId, apiError } from '@/lib/api-helpers';

async function getOwnedProject(projectId: string, userId: string) {
  const project = await db.project.findUnique({ where: { id: projectId } });
  return project?.ownerUserId === userId ? project : null;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; charId: string }> },
) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { id: projectId, charId } = await params;
  const project = await getOwnedProject(projectId, userId);
  if (!project) return apiError.forbidden();

  const body = await req.json();
  const character = await db.character.update({ where: { id: charId }, data: body });
  return NextResponse.json(character);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; charId: string }> },
) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { id: projectId, charId } = await params;
  const project = await getOwnedProject(projectId, userId);
  if (!project) return apiError.forbidden();

  await db.character.delete({ where: { id: charId } });
  return NextResponse.json({ ok: true });
}
