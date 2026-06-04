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
  const project = await db.project.findUnique({ where: { id } });
  if (!project || project.ownerUserId !== userId) return apiError.forbidden();

  // 프로젝트 삭제 시 Character, CastingOffer가 cascade 삭제됨 (스키마 설정)
  await db.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
