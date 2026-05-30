import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  mediaType: z.enum(['FILM', 'DRAMA', 'OTT', 'WEB_DRAMA', 'SHORT_FILM', 'AD', 'MUSIC_VIDEO', 'OTHER']).optional(),
  role: z.enum(['LEAD', 'SUPPORTING', 'EXTRA', 'OTHER']).optional(),
  year: z.number().int().optional(),
  characterName: z.string().optional().nullable(),
  genre: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  youtubeUrl: z.string().optional().nullable(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const item = await db.filmography.findUnique({ where: { id, userId: session.user.id } });
  if (!item) return NextResponse.json({ error: '없는 항목입니다.' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await db.filmography.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  try {
    const body = updateSchema.parse(await req.json());
    const item = await db.filmography.update({ where: { id }, data: body });
    return NextResponse.json(item);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    return NextResponse.json({ error: '오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await db.filmography.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  await db.filmography.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
