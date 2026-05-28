import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export type StorageBucket =
  | 'showreels'
  | 'profiles'
  | 'filmography-thumbnails'
  | 'auditions';

export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File | Blob,
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) throw new Error(error.message);

  const { data: urlData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function deleteFile(
  bucket: StorageBucket,
  path: string,
): Promise<void> {
  const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
  if (error) throw new Error(error.message);
}

export async function uploadImage(
  bucket: 'profiles' | 'filmography-thumbnails',
  userId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  return uploadFile(bucket, path, file);
}

export async function uploadVideo(
  userId: string,
  file: File,
  bucket: 'showreels' | 'auditions' = 'showreels',
): Promise<string> {
  const ALLOWED_TYPES = ['video/mp4', 'video/quicktime'];
  const MAX_SIZE = 500 * 1024 * 1024; // 500MB

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('mp4 또는 mov 파일만 업로드 가능합니다.');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('파일 크기는 500MB 이하여야 합니다.');
  }

  const path = `${userId}/${Date.now()}_${file.name}`;
  return uploadFile(bucket, path, file);
}
