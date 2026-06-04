import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUserId } from '@/lib/api-helpers';

type ActivityItem = {
  icon: string;
  title: string;
  sub: string;
  date: Date;
};

export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const [filmographies, showreels, offers] = await Promise.all([
    db.filmography.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, title: true, mediaType: true, createdAt: true },
    }),
    db.showreel.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, title: true, createdAt: true },
    }),
    db.castingOffer.findMany({
      where: {
        receiverUserId: userId,
        status: { in: ['ACCEPTED', 'REJECTED'] },
      },
      orderBy: { updatedAt: 'desc' },
      take: 3,
      select: {
        id: true,
        status: true,
        updatedAt: true,
        project: { select: { title: true } },
      },
    }),
  ]);

  const activities: ActivityItem[] = [
    ...filmographies.map((f) => ({
      icon: '🎬',
      title: '필모그래피 등록',
      sub: f.title,
      date: f.createdAt,
    })),
    ...showreels.map((s) => ({
      icon: '🎥',
      title: '쇼릴 업로드',
      sub: s.title,
      date: s.createdAt,
    })),
    ...offers.map((o) => ({
      icon: o.status === 'ACCEPTED' ? '✅' : '❌',
      title: o.status === 'ACCEPTED' ? '캐스팅 제안 수락' : '캐스팅 제안 거절',
      // Guard against a deleted project that left a dangling FK on the offer.
      sub: o.project?.title ?? '',
      date: o.updatedAt,
    })),
  ];

  activities.sort((a, b) => b.date.getTime() - a.date.getTime());

  return NextResponse.json(
    activities.slice(0, 4).map(({ icon, title, sub, date }) => ({ icon, title, sub, date })),
  );
}
