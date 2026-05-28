"use client";

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Check } from 'lucide-react';

export default function SignupCompletePage() {
  const router = useRouter();
  const { update } = useSession();

  const handleHome = async () => {
    await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboardingCompleted: true }),
    });
    // JWT 토큰 갱신 — 갱신 없으면 proxy가 계속 /signup으로 리다이렉트
    await update({ onboardingCompleted: true });
    router.push('/home');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 pb-8">
      <div className="flex flex-col items-center gap-5 mb-auto mt-auto">
        {/* 빨간 체크 원형 아이콘 */}
        <div className="w-[60px] h-[60px] rounded-full bg-[#E53935] flex items-center justify-center">
          <Check size={28} color="white" strokeWidth={3} />
        </div>

        <h1 className="text-[26px] font-bold text-[#1A1A1A] text-center leading-snug">
          회원가입이<br />완료되었습니다.
        </h1>
        <p className="text-[14px] text-[#888888]">이제 서비스를 시작해 보세요!</p>
      </div>

      <button
        onClick={handleHome}
        className="w-full h-[52px] rounded-full bg-[#1A1A2E] text-white text-[15px] font-semibold mt-auto"
      >
        홈으로
      </button>
    </div>
  );
}
