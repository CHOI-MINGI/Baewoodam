import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUserId, handleRouteError, apiError } from '@/lib/api-helpers';

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
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { id: projectId } = await params;
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project || project.ownerUserId !== userId) return apiError.forbidden();

  try {
    const body = createSchema.parse(await req.json());
    const character = await db.character.create({ data: { ...body, projectId } });
    return NextResponse.json(character, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
