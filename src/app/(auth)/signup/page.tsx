"use client";

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function SignupRolePage() {
  const router = useRouter();

  const select = (role: 'ACTOR' | 'AGENCY') => {
    router.push(`/signup/terms?role=${role}`);
  };

  return (
    <div className="flex flex-col min-h-screen px-6 pt-16 pb-8">
      <div className="flex items-center gap-3 mb-10">
        <button onClick={() => router.back()} className="text-xl text-[#1A1A1A]">←</button>
        <span className="text-[16px] font-semibold text-[#1A1A1A]">회원가입</span>
      </div>

      <h1 className="text-[24px] font-bold text-[#1A1A1A] leading-snug mb-2">
        어떤 역할로<br />가입하시나요?
      </h1>
      <p className="text-[14px] text-[#888888] mb-12">가입 후에는 변경이 어려우니 신중하게 선택해 주세요.</p>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => select('ACTOR')}
          className="w-full border-2 border-[#E0E0E0] rounded-2xl p-6 text-left hover:border-[#1A1A2E] transition-colors group"
        >
          <div className="text-[32px] mb-3">🎭</div>
          <p className="text-[18px] font-bold text-[#1A1A1A] mb-1">배우</p>
          <p className="text-[13px] text-[#888888]">프로필과 포트폴리오를 등록하고 캐스팅 제안을 받아보세요.</p>
        </button>

        <button
          onClick={() => select('AGENCY')}
          className="w-full border-2 border-[#E0E0E0] rounded-2xl p-6 text-left hover:border-[#1A1A2E] transition-colors group"
        >
          <div className="text-[32px] mb-3">🎬</div>
          <p className="text-[18px] font-bold text-[#1A1A1A] mb-1">에이전시 / 감독</p>
          <p className="text-[13px] text-[#888888]">프로젝트를 등록하고 배우를 찾아 캐스팅 제안을 보내보세요.</p>
        </button>
      </div>
    </div>
  );
}
