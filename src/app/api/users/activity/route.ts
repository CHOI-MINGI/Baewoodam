import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id as string;

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

  type ActivityItem = {
    icon: string;
    title: string;
    sub: string;
    date: Date;
  };

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
      sub: o.project.title,
      date: o.updatedAt,
    })),
  ];

  activities.sort((a, b) => b.date.getTime() - a.date.getTime());
  const top4 = activities.slice(0, 4);

  return NextResponse.json(
    top4.map((a) => ({ icon: a.icon, title: a.title, sub: a.sub, date: a.date })),
  );
}
