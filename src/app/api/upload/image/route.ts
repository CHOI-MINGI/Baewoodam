import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadImage } from '@/lib/storage';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file') as File | null;
  const bucket = (form.get('bucket') as string) ?? 'profiles';

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const url = await uploadImage(
    bucket as 'profiles' | 'filmography-thumbnails',
    session.user.id,
    file,
  );

  return NextResponse.json({ url });
}
