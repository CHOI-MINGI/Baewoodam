import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1),
  mediaType: z.enum(['DRAMA', 'FILM', 'OTT', 'WEB_DRAMA', 'AD', 'OTHER']),
  genre: z.string().optional().nullable(),
  platform: z.string().optional().nullable(),
  logline: z.string().optional().nullable(),
  synopsis: z.string().optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const projects = await db.project.findMany({
    where: { ownerUserId: session.user.id },
    include: { characters: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = createSchema.parse(await req.json());
    const project = await db.project.create({
      data: { ...body, ownerUserId: session.user.id },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    return NextResponse.json({ error: '오류가 발생했습니다.' }, { status: 500 });
  }
}
