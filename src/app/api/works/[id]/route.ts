import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUserId, getOwnedWork, handleRouteError, apiError } from '@/lib/api-helpers';

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  genre: z.string().optional().nullable(),
  year: z.number().int().optional().nullable(),
  description: z.string().optional().nullable(),
  myRole: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  thumbnailUrl: z.string().optional().nullable(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId();
    if (userId instanceof NextResponse) return userId;

    const { id } = await params;
    const work = await db.work.findUnique({
      where: { id, userId },
      include: {
        credits: {
          include: { linkedUser: { select: { id: true, name: true, image: true } } },
        },
      },
    });
    if (!work) return apiError.notFound('없는 항목입니다.');
    return NextResponse.json(work);
  } catch (err: any) {
    console.error('[GET /api/works/[id]]', err);
    return apiError.serverError('서버 오류가 발생했습니다.');
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await params;
  const existing = await getOwnedWork(id, userId);
  if (!existing) return apiError.forbidden();

  try {
    const body = updateSchema.parse(await req.json());

    const work = await db.$transaction(async (tx) => {
      if (body.isFeatured === true) {
        await tx.work.updateMany({
          where: { userId, id: { not: id } },
          data: { isFeatured: false },
        });
      }

      const updated = await tx.work.update({ where: { id }, data: body });

      if (existing.filmographyId) {
        await tx.filmography.update({
          where: { id: existing.filmographyId },
          data: {
            ...(body.title && { title: body.title }),
            ...(body.genre !== undefined && { genre: body.genre }),
            ...(body.year !== undefined && { year: body.year ?? new Date().getFullYear() }),
            ...(body.description !== undefined && { description: body.description }),
            ...(body.thumbnailUrl !== undefined && { thumbnailUrl: body.thumbnailUrl }),
          },
        });
      }

      return updated;
    });

    return NextResponse.json(work);
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
  const existing = await getOwnedWork(id, userId);
  if (!existing) return apiError.forbidden();

  try {
    await db.$transaction(async (tx) => {
      if (existing.filmographyId) {
        await tx.filmography.delete({ where: { id: existing.filmographyId } });
      }
      await tx.work.delete({ where: { id } });
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/works/[id]]', err);
    return handleRouteError(err);
  }
}
