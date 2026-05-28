"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('형식이 올바르지 않아요.'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 해요.')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, '영문과 숫자를 조합해주세요.'),
  passwordConfirm: z.string(),
}).refine((d) => d.password === d.passwordConfirm, {
  message: '비밀번호가 일치하지 않아요.',
  path: ['passwordConfirm'],
});

type FormValues = z.infer<typeof schema>;

export default function BasicInfoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleType = searchParams.get('role') ?? 'ACTOR';

  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: 'onChange' });

  const emailVal = watch('email');
  const pwVal = watch('password');
  const pwcVal = watch('passwordConfirm');
  const isReady = emailVal && pwVal && pwcVal && !errors.email && !errors.password && !errors.passwordConfirm;

  const onSubmit = async (data: FormValues) => {
    setServerError('');
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, password: data.password, roleType }),
    });

    if (!res.ok) {
      const err = await res.json();
      setServerError(err.error ?? '오류가 발생했습니다.');
      return;
    }

    // 가입 즉시 자동 로그인
    await signIn('credentials', { email: data.email, password: data.password, redirect: false });

    const nextPath = roleType === 'AGENCY' ? '/signup/agency' : '/signup/profile';
    router.push(nextPath);
  };

  return (
    <div className="flex flex-col min-h-screen px-6 pt-4 pb-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-10">
        <button onClick={() => router.back()} className="text-[#1A1A1A] text-xl">←</button>
        <span className="text-[16px] font-semibold text-[#1A1A1A]">회원가입</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 gap-6">
        {/* 이메일 */}
        <div>
          <label className="text-[13px] text-[#1A1A1A] font-medium mb-1 block">이메일 주소</label>
          <div className="flex items-center border-b border-[#E0E0E0] pb-2 gap-2"
            style={{ borderColor: errors.email ? '#E53935' : undefined }}
          >
            <input
              {...register('email')}
              type="email"
              placeholder="이메일 주소 입력"
              className="flex-1 text-[15px] outline-none text-[#1A1A1A] placeholder:text-[#D9D9D9] bg-transparent"
            />
            {emailVal && (
              <button type="button" onClick={() => setValue('email', '')}>
                <X size={16} className="text-[#888888]" />
              </button>
            )}
          </div>
          {errors.email && (
            <p className="text-[12px] text-[#E53935] mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* 비밀번호 */}
        <div>
          <label className="text-[13px] text-[#1A1A1A] font-medium mb-1 block">비밀번호</label>
          <div className="flex items-center border-b border-[#E0E0E0] pb-2 gap-2"
            style={{ borderColor: errors.password ? '#E53935' : undefined }}
          >
            <input
              {...register('password')}
              type={showPw ? 'text' : 'password'}
              placeholder="비밀번호 입력"
              className="flex-1 text-[15px] outline-none text-[#1A1A1A] placeholder:text-[#D9D9D9] bg-transparent"
            />
            {pwVal && (
              <button type="button" onClick={() => setValue('password', '')}>
                <X size={16} className="text-[#888888]" />
              </button>
            )}
            <button type="button" onClick={() => setShowPw((v) => !v)}>
              {showPw ? <EyeOff size={16} className="text-[#888888]" /> : <Eye size={16} className="text-[#888888]" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[12px] text-[#E53935] mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* 비밀번호 확인 */}
        <div>
          <label className="text-[13px] text-[#1A1A1A] font-medium mb-1 block">비밀번호 확인</label>
          <div className="flex items-center border-b border-[#E0E0E0] pb-2 gap-2"
            style={{ borderColor: errors.passwordConfirm ? '#E53935' : undefined }}
          >
            <input
              {...register('passwordConfirm')}
              type={showPwConfirm ? 'text' : 'password'}
              placeholder="비밀번호 다시 입력"
              className="flex-1 text-[15px] outline-none text-[#1A1A1A] placeholder:text-[#D9D9D9] bg-transparent"
            />
            {pwcVal && (
              <button type="button" onClick={() => setValue('passwordConfirm', '')}>
                <X size={16} className="text-[#888888]" />
              </button>
            )}
            <button type="button" onClick={() => setShowPwConfirm((v) => !v)}>
              {showPwConfirm ? <EyeOff size={16} className="text-[#888888]" /> : <Eye size={16} className="text-[#888888]" />}
            </button>
          </div>
          {errors.passwordConfirm && (
            <p className="text-[12px] text-[#E53935] mt-1">{errors.passwordConfirm.message}</p>
          )}
        </div>

        {serverError && (
          <p className="text-[13px] text-[#E53935]">{serverError}</p>
        )}

        <div className="mt-auto pt-8">
          <button
            type="submit"
            disabled={!isReady || isSubmitting}
            className={cn(
              'w-full h-[52px] rounded-full text-[15px] font-semibold transition-colors',
              isReady && !isSubmitting
                ? 'bg-[#1A1A2E] text-white'
                : 'bg-[#D9D9D9] text-[#999999]',
            )}
          >
            {isSubmitting ? '처리 중...' : '다음'}
          </button>
        </div>
      </form>
    </div>
  );
}
