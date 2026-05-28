import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const { email } = schema.parse(await req.json());

    const user = await db.user.findUnique({ where: { email } });
    // 보안상 사용자 존재 여부 노출 금지 — 항상 200 반환
    if (!user) return NextResponse.json({ ok: true });

    // TODO: Resend로 재설정 이메일 발송
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '오류가 발생했습니다.' }, { status: 500 });
  }
}
