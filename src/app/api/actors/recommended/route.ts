import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 추천 배우: 필모그래피 많은 순 (인기 배우)
export async function GET(_req: NextRequest) {
  const users = await db.user.findMany({
    where: { roleType: 'ACTOR', isActive: true, isPublic: true },
    include: {
      actorProfile: { select: { ageRange: true, skills: true } },
      _count: { select: { filmographies: true, showreels: true } },
    },
    take: 50,
  });

  const actors = users
    .map((u) => ({
      id: u.id,
      name: u.name,
      image: u.image,
      ageRange: u.actorProfile?.ageRange ?? null,
      location: u.location,
      skills: u.actorProfile?.skills ?? [],
      filmographyCount: u._count.filmographies,
      showreelCount: u._count.showreels,
    }))
    // 필모 많은 순 정렬
    .sort((a, b) => b.filmographyCount - a.filmographyCount)
    .slice(0, 12);

  return NextResponse.json({ actors });
}