import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id, roleType: 'ACTOR', isActive: true, isPublic: true },
    include: {
      actorProfile: true,
      filmographies: { orderBy: [{ year: 'desc' }, { sortOrder: 'asc' }] },
      showreels: { orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }] },
      works: {
        where: { isFeatured: true, isPublic: true },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { filmographies: true, showreels: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: '배우를 찾을 수 없습니다.' }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    image: user.image,
    bio: user.bio,
    location: user.location,
    contactableTime: user.contactableTime,
    ageRange: user.actorProfile?.ageRange ?? null,
    gender: user.actorProfile?.gender ?? null,
    height: user.actorProfile?.height ?? null,
    weight: user.actorProfile?.weight ?? null,
    skills: user.actorProfile?.skills ?? [],
    preferredGenres: user.actorProfile?.preferredGenres ?? [],
    publicPortfolioUrl: user.actorProfile?.publicPortfolioUrl ?? null,
    filmographyCount: user._count.filmographies,
    showreelCount: user._count.showreels,
    coverImage: user.coverImage,
    filmographies: user.filmographies,
    showreels: user.showreels,
    featuredWorks: user.works,
  });
}
