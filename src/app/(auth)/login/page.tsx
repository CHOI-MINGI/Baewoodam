"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isReady = email.trim() && password;

  const handleLogin = async () => {
    if (!isReady) return;
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('이메일 또는 비밀번호가 올바르지 않아요.');
    } else {
      router.push('/home');
    }
  };

  return (
    <div className="flex flex-col min-h-screen px-6 pt-16 pb-8">
      {/* 로고 */}
      <div className="mb-12">
        <h1 className="text-[32px] font-bold text-[#1A1A2E]">배우담</h1>
        <p className="text-[14px] text-[#888888] mt-1">배우와 에이전시를 잇는 캐스팅 플랫폼</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* 이메일 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">이메일</label>
          <div className="flex items-center border-b border-[#E0E0E0] pb-2 gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소 입력"
              className="flex-1 text-[15px] outline-none placeholder:text-[#D9D9D9] bg-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            {email && <button onClick={() => setEmail('')}><X size={16} className="text-[#888888]" /></button>}
          </div>
        </div>

        {/* 비밀번호 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">비밀번호</label>
          <div className="flex items-center border-b border-[#E0E0E0] pb-2 gap-2">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="flex-1 text-[15px] outline-none placeholder:text-[#D9D9D9] bg-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            {password && <button onClick={() => setPassword('')}><X size={16} className="text-[#888888]" /></button>}
            <button onClick={() => setShowPw((v) => !v)}>
              {showPw ? <EyeOff size={16} className="text-[#888888]" /> : <Eye size={16} className="text-[#888888]" />}
            </button>
          </div>
        </div>

        {error && <p className="text-[13px] text-[#E53935]">{error}</p>}
      </div>

      <div className="flex justify-end mt-3">
        <Link href="/password-reset" className="text-[13px] text-[#888888]">비밀번호 재설정</Link>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <button
          disabled={!isReady || loading}
          onClick={handleLogin}
          className={cn(
            'w-full h-[52px] rounded-full text-[15px] font-semibold transition-colors',
            isReady && !loading ? 'bg-[#1A1A2E] text-white' : 'bg-[#D9D9D9] text-[#999999]',
          )}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>

        <div className="text-center text-[14px] text-[#888888]">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-[#1A1A2E] font-semibold">회원가입</Link>
        </div>
      </div>
    </div>
  );
}
