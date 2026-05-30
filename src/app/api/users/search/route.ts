import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (!q) return NextResponse.json([]);

  const users = await db.user.findMany({
    where: {
      name: { contains: q, mode: 'insensitive' },
      isActive: true,
    },
    select: { id: true, name: true, image: true },
    take: 20,
  });

  return NextResponse.json(users);
}
