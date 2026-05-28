"use client";

import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      {/* 배경 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #1a0a0a 0%, #2d1515 40%, #1a1a2e 100%)',
        }}
      />

      {/* 콘텐츠 */}
      <div className="relative flex flex-col flex-1 px-6 pt-16 pb-10 justify-between">
        {/* 상단 텍스트 */}
        <div className="flex flex-col gap-4">
          <h1 className="text-[28px] font-bold text-white leading-snug">
            시나리오에<br />
            생명을 불어넣을 완벽한 배우,<br />
            AI가 찾아드립니다.
          </h1>
          <p className="text-[13px] text-[#aaaaaa] leading-relaxed">
            캐스팅 디렉터와 에이전시를 위한<br />
            시나리오 기반 배우 추천, 배우를 위한 새로운 기회
          </p>
        </div>

        {/* 하단 버튼 */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/signup/basic?roleType=AGENCY')}
            className="w-full h-[52px] rounded-full bg-white text-[#1A1A2E] text-[15px] font-semibold"
          >
            에이전시로 시작하기
          </button>
          <button
            onClick={() => router.push('/signup/basic?roleType=ACTOR')}
            className="w-full h-[52px] rounded-full bg-[#1A1A2E] text-white text-[15px] font-semibold border border-white/20"
          >
            배우로 시작하기
          </button>
          <p className="text-center text-[13px] text-[#888888] mt-1">
            이미 계정이 있으신가요?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-white underline"
            >
              로그인
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
