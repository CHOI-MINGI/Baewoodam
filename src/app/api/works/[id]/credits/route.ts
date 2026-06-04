import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUserId, getOwnedWork, handleRouteError, apiError } from '@/lib/api-helpers';

const addCreditSchema = z.object({
  role: z.string().min(1),
  name: z.string().min(1),
  linkedUserId: z.string().optional().nullable(),
});

const deleteCreditSchema = z.object({
  creditId: z.string(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await params;
  const work = await getOwnedWork(id, userId);
  if (!work) return apiError.forbidden();

  try {
    const body = addCreditSchema.parse(await req.json());
    const credit = await db.workCredit.create({
      data: { workId: id, ...body },
      include: { linkedUser: { select: { id: true, name: true, image: true } } },
    });
    return NextResponse.json(credit, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await params;
  const work = await getOwnedWork(id, userId);
  if (!work) return apiError.forbidden();

  try {
    const { creditId } = deleteCreditSchema.parse(await req.json());
    await db.workCredit.delete({ where: { id: creditId, workId: id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
