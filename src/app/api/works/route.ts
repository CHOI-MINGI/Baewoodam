import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUserId, mapRoleToFilmRole, handleRouteError, apiError } from '@/lib/api-helpers';

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
  credits: z
    .array(
      z.object({
        role: z.string(),
        name: z.string(),
        linkedUserId: z.string().optional().nullable(),
      }),
    )
    .optional(),
});

export async function GET() {
  try {
    const userId = await requireUserId();
    if (userId instanceof NextResponse) return userId;

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
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

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
          credits: credits?.length ? { create: credits } : undefined,
        },
        include: { credits: true },
      });

      return work;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return apiError.badRequest(err.issues);
    console.error(err);
    return handleRouteError(err);
  }
}
