import { NextResponse } from 'next/server';
import { requireUserId } from '@/lib/api-helpers';

export async function PATCH() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  // 알림 설정은 별도 테이블이 필요하나 현재는 User 모델 확장 전 임시 처리
  return NextResponse.json({ ok: true });
}
