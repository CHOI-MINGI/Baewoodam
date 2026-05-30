import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createSchema = z.object({
  youtubeUrl: z.string().url(),
  videoId: z.string(),
  title: z.string().min(1),
  thumbnailUrl: z.string().optional().nullable(),
  channelTitle: z.string().optional().nullable(),
  genre: z.string().optional().nullable(),
  year: z.number().int().optional().nullable(),
  description: z.string().optional().nullable(),
  myRole: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  credits: z.array(z.object({
    role: z.string(),
    name: z.string(),
    linkedUserId: z.string().optional().nullable(),
  })).optional(),
});

function mapRoleToFilmRole(myRole?: string | null): 'LEAD' | 'SUPPORTING' | 'EXTRA' | 'OTHER' {
  if (!myRole) return 'OTHER';
  const lower = myRole.toLowerCase();
  if (lower.includes('주연') || lower.includes('lead')) return 'LEAD';
  if (lower.includes('조연') || lower.includes('supporting')) return 'SUPPORTING';
  if (lower.includes('단역') || lower.includes('extra')) return 'EXTRA';
  return 'OTHER';
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id as string;

    const works = await db.work.findMany({
      where: { userId },
      include: {
        credits: {
          include: { linkedUser: { select: { id: true, name: true, image: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(works);
  } catch (err: any) {
    console.error('[GET /api/works]', err?.message, err?.stack?.split('\n')[0]);
    return NextResponse.json({ error: err?.message ?? '서버 오류', code: err?.code }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id as string;

  try {
    const body = createSchema.parse(await req.json());
    const { credits, ...workData } = body;

    const result = await db.$transaction(async (tx) => {
      const filmography = await tx.filmography.create({
        data: {
          userId,
          title: workData.title,
          mediaType: 'OTHER',
          role: mapRoleToFilmRole(workData.myRole),
          year: workData.year ?? new Date().getFullYear(),
          genre: workData.genre ?? null,
          thumbnailUrl: workData.thumbnailUrl ?? null,
          youtubeUrl: workData.youtubeUrl,
          description: workData.description ?? null,
        },
      });

      const work = await tx.work.create({
        data: {
          userId,
          filmographyId: filmography.id,
          ...workData,
          credits: credits && credits.length > 0
            ? { create: credits }
            : undefined,
        },
        include: { credits: true },
      });

      return work;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: '오류가 발생했습니다.' }, { status: 500 });
  }
}
