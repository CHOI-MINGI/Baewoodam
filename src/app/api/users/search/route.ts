import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUserId } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (!q) return NextResponse.json([]);

  const users = await db.user.findMany({
    where: {
      name: { contains: q, mode: 'insensitive' },
      isActive: true,
      isPublic: true,
    },
    select: { id: true, name: true, image: true },
    take: 20,
  });

  return NextResponse.json(users);
}
