import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  roleType: z.enum(['ACTOR', 'AGENCY']).default('ACTOR'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, roleType } = signupSchema.parse(body);

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: { email, passwordHash, roleType },
      select: { id: true, email: true, roleType: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
