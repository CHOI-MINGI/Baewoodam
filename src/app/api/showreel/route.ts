import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUserId } from '@/lib/api-helpers';

export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const items = await db.showreel.findMany({
    where: { userId },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const filmographyId = formData.get('filmographyId') as string | null;
    const tagsRaw = formData.get('tags') as string | null;
    const tags = tagsRaw ? JSON.parse(tagsRaw) : [];

    const { uploadVideo } = await import('@/lib/storage');

    const records = await Promise.all(
      files.map(async (file) => {
        const videoUrl = await uploadVideo(userId, file, 'showreels');
        return db.showreel.create({
          data: {
            userId,
            title,
            description,
            videoUrl,
            filmographyId: filmographyId || null,
            tags,
          },
        });
      }),
    );

    return NextResponse.json(records, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? '오류가 발생했습니다.' }, { status: 500 });
  }
}
