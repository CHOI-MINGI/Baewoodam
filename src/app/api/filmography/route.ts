import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1),
  mediaType: z.enum(['FILM', 'DRAMA', 'OTT', 'WEB_DRAMA', 'SHORT_FILM', 'AD', 'MUSIC_VIDEO', 'OTHER']),
  role: z.enum(['LEAD', 'SUPPORTING', 'EXTRA', 'OTHER']),
  year: z.number().int(),
  characterName: z.string().optional().nullable(),
  genre: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await db.filmography.findMany({
    where: { userId: session.user.id },
    orderBy: [{ year: 'desc' }, { sortOrder: 'asc' }],
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = createSchema.parse(await req.json());
    const item = await db.filmography.create({
      data: { ...body, userId: session.user.id },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    return NextResponse.json({ error: '오류가 발생했습니다.' }, { status: 500 });
  }
}
