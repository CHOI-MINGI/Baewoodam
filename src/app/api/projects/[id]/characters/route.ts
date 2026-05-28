import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1),
  ageRange: z.enum(['TEENS', 'TWENTIES', 'THIRTIES', 'FORTIES', 'FIFTIES']).optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().nullable(),
  description: z.string().optional().nullable(),
  keywords: z.array(z.string()).default([]),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;
  const characters = await db.character.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(characters);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: projectId } = await params;

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project || project.ownerUserId !== session.user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  try {
    const body = createSchema.parse(await req.json());
    const character = await db.character.create({ data: { ...body, projectId } });
    return NextResponse.json(character, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    return NextResponse.json({ error: '오류가 발생했습니다.' }, { status: 500 });
  }
}
