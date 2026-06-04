import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Returns up to 12 public actors ordered by filmography count (most prolific first).
 *
 * Before: fetch 50 rows → JS Array.sort (O(n log n)) → slice 12
 * After:  DB-level ORDER BY with take:12 — sort handled by the query planner
 *         in a single round-trip, transferring only the 12 rows that are needed.
 */
export async function GET() {
  const users = await db.user.findMany({
    where: { roleType: 'ACTOR', isActive: true, isPublic: true },
    include: {
      actorProfile: { select: { ageRange: true, skills: true } },
      _count: { select: { filmographies: true, showreels: true } },
    },
    orderBy: { filmographies: { _count: 'desc' } },
    take: 12,
  });

  const actors = users.map((u) => ({
    id: u.id,
    name: u.name,
    image: u.image,
    ageRange: u.actorProfile?.ageRange ?? null,
    location: u.location,
    skills: u.actorProfile?.skills ?? [],
    filmographyCount: u._count.filmographies,
    showreelCount: u._count.showreels,
  }));

  return NextResponse.json({ actors });
}
