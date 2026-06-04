import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/storage';
import { requireUserId } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const form = await req.formData();
  const file = form.get('file') as File | null;
  const bucket = (form.get('bucket') as string) ?? 'profiles';

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  try {
    const url = await uploadImage(
      bucket as 'profiles' | 'filmography-thumbnails',
      userId,
      file,
    );
    return NextResponse.json({ url });
  } catch (err: any) {
    console.error('[upload/image]', err);
    return NextResponse.json({ error: err.message ?? '업로드 실패' }, { status: 500 });
  }
}
