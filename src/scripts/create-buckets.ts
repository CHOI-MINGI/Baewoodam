import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const BUCKETS = [
  {
    name: 'profiles',
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/*'],
  },
  {
    name: 'filmography-thumbnails',
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/*'],
  },
  {
    name: 'showreels',
    public: false,
    fileSizeLimit: 500 * 1024 * 1024,
    allowedMimeTypes: ['video/*'],
  },
  {
    name: 'auditions',
    public: false,
    fileSizeLimit: 500 * 1024 * 1024,
    allowedMimeTypes: ['video/*'],
  },
];

async function main() {
  for (const bucket of BUCKETS) {
    const { data: existing } = await supabase.storage.getBucket(bucket.name);
    if (existing) {
      console.log(`✓ 버킷 이미 존재: ${bucket.name}`);
      continue;
    }

    const { error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: bucket.fileSizeLimit,
      allowedMimeTypes: bucket.allowedMimeTypes,
    });

    if (error) {
      console.error(`✗ 버킷 생성 실패: ${bucket.name}`, error.message);
    } else {
      console.log(`✓ 버킷 생성 완료: ${bucket.name}`);
    }
  }
  console.log('\nSupabase 버킷 설정 완료.');
}

main();
