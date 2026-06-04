import { NextRequest, NextResponse } from 'next/server';
import { requireUserId, apiError } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const url = req.nextUrl.searchParams.get('url');
  if (!url) return apiError.badRequest('url 파라미터가 필요합니다.');

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) return apiError.badRequest('영상 정보를 가져올 수 없습니다.');
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return apiError.serverError('서버 오류가 발생했습니다.');
  }
}
