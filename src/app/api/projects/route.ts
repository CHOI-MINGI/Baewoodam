import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUserId, handleRouteError } from '@/lib/api-helpers';

const createSchema = z.object({
  title: z.string().min(1),
  mediaType: z.enum(['DRAMA', 'FILM', 'OTT', 'WEB_DRAMA', 'AD', 'OTHER']),
  genre: z.string().optional().nullable(),
  platform: z.string().optional().nullable(),
  logline: z.string().optional().nullable(),
  synopsis: z.string().optional().nullable(),
});

export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const projects = await db.project.findMany({
    where: { ownerUserId: userId },
    include: { characters: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    const body = createSchema.parse(await req.json());
    const project = await db.project.create({
      data: { ...body, ownerUserId: userId },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
