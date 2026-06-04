import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUserId, handleRouteError, apiError } from '@/lib/api-helpers';

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  mediaType: z
    .enum(['FILM', 'DRAMA', 'OTT', 'WEB_DRAMA', 'SHORT_FILM', 'AD', 'MUSIC_VIDEO', 'OTHER'])
    .optional(),
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
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await params;
  const item = await db.filmography.findUnique({ where: { id, userId } });
  if (!item) return apiError.notFound();
  return NextResponse.json(item);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await params;
  const existing = await db.filmography.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) return apiError.forbidden();

  try {
    const body = updateSchema.parse(await req.json());
    const item = await db.filmography.update({ where: { id }, data: body });
    return NextResponse.json(item);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await params;
  const existing = await db.filmography.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) return apiError.forbidden();

  await db.filmography.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
