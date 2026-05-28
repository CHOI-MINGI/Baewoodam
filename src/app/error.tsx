"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5 px-6">
      <p className="text-[18px] font-semibold text-[#1A1A1A]">오류가 발생했어요</p>
      <p className="text-[14px] text-[#888888] text-center">일시적인 오류입니다. 잠시 후 다시 시도해 주세요.</p>
      <button
        onClick={reset}
        className="px-8 h-[48px] rounded-full bg-[#1A1A2E] text-white text-[15px] font-semibold"
      >
        다시 시도
      </button>
    </div>
  );
}
