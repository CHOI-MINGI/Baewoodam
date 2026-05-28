import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function PATCH(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // 알림 설정은 별도 테이블이 필요하나 현재는 User 모델 확장 전 임시 처리
  return NextResponse.json({ ok: true });
}
