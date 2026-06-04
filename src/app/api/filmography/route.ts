import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUserId, handleRouteError } from '@/lib/api-helpers';

const createSchema = z.object({
  title: z.string().min(1),
  mediaType: z.enum(['FILM', 'DRAMA', 'OTT', 'WEB_DRAMA', 'SHORT_FILM', 'AD', 'MUSIC_VIDEO', 'OTHER']),
  role: z.enum(['LEAD', 'SUPPORTING', 'EXTRA', 'OTHER']),
  year: z.number().int(),
  characterName: z.string().optional().nullable(),
  genre: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  youtubeUrl: z.string().optional().nullable(),
});

export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const items = await db.filmography.findMany({
    where: { userId },
    orderBy: [{ year: 'desc' }, { sortOrder: 'asc' }],
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    const body = createSchema.parse(await req.json());
    const item = await db.filmography.create({
      data: { ...body, userId },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
