"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-white px-8">
      <div className="flex flex-col gap-3" style={{ marginTop: '38%' }}>
        <h1 className="text-[52px] font-bold text-[#1A1A2E] leading-tight tracking-tight">
          배우담
        </h1>
        <p className="text-[15px] text-[#999999] leading-relaxed">
          시나리오에 어울리는 배우를<br />
          한 번에 찾는 캐스팅 플랫폼
        </p>
      </div>
    </div>
  );
}
