import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type ActorRow = {
  id: string;
  name: string | null;
  image: string | null;
  location: string | null;
  createdAt: Date;
  actorProfile: { ageRange: string | null; skills: string[] } | null;
  _count: { filmographies: number; showreels: number };
};

const GENDER_LABEL_MAP: Record<string, string> = { 남성: 'MALE', 여성: 'FEMALE' };
const AGE_LABEL_MAP: Record<string, string> = {
  '10대': 'TEENS', '20대': 'TWENTIES', '30대': 'THIRTIES', '40대': 'FORTIES', '50대': 'FIFTIES',
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const ageRangeLabel = searchParams.get('ageRange');
  const genderLabel = searchParams.get('gender');
  const location = searchParams.get('location');
  const minFilmo = Number(searchParams.get('minFilmo') ?? 0);
  const maxFilmo = Number(searchParams.get('maxFilmo') ?? 9999);
  const cursor = searchParams.get('cursor');
  const limit = 10;

  const ageRange = ageRangeLabel ? AGE_LABEL_MAP[ageRangeLabel] : undefined;
  const gender = genderLabel ? GENDER_LABEL_MAP[genderLabel] : undefined;

  const users = await db.user.findMany({
    where: {
      roleType: 'ACTOR',
      isActive: true,
      ...(location && { location }),
      actorProfile: {
        ...(ageRange && { ageRange: ageRange as any }),
        ...(gender && { gender: gender as any }),
      },
    },
    include: {
      actorProfile: { select: { ageRange: true, skills: true } },
      _count: {
        select: { filmographies: true, showreels: true },
      },
    },
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' },
  });

  const rows = users as ActorRow[];
  const filtered = rows.filter((u) => {
    const count = u._count.filmographies;
    return count >= minFilmo && count <= maxFilmo;
  });

  const hasMore = filtered.length > limit;
  const items = hasMore ? filtered.slice(0, limit) : filtered;

  const actors = items.map((u) => ({
    id: u.id,
    name: u.name,
    image: u.image,
    ageRange: u.actorProfile?.ageRange ?? null,
    location: u.location,
    skills: u.actorProfile?.skills ?? [],
    filmographyCount: u._count.filmographies,
    showreelCount: u._count.showreels,
  }));

  return NextResponse.json({
    actors,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  });
}
