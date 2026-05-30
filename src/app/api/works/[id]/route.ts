import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

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
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const work = await db.work.findUnique({
      where: { id, userId: session.user.id as string },
      include: {
        credits: {
          include: { linkedUser: { select: { id: true, name: true, image: true } } },
        },
      },
    });
    if (!work) return NextResponse.json({ error: '없는 항목입니다.' }, { status: 404 });
    return NextResponse.json(work);
  } catch (err: any) {
    console.error('[GET /api/works/[id]]', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await db.work.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  try {
    const body = updateSchema.parse(await req.json());

    const work = await db.$transaction(async (tx) => {
      // 대표영상 설정 시 다른 작품 해제
      if (body.isFeatured === true) {
        await tx.work.updateMany({
          where: { userId: session.user!.id as string, id: { not: id } },
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
  const existing = await db.work.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

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
    return NextResponse.json({ error: '오류가 발생했습니다.' }, { status: 500 });
  }
}
