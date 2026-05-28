"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface TopHeaderProps {
  title?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export default function TopHeader({ title, showBack = false, rightAction }: TopHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center h-[52px] px-4 border-b border-[#F0F0F0] bg-white">
      <div className="w-10">
        {showBack && (
          <button onClick={() => router.back()} className="p-1 -ml-1">
            <ArrowLeft size={20} className="text-[#1A1A1A]" />
          </button>
        )}
      </div>

      <div className="flex-1 text-center">
        {title && (
          <h1 className="text-[16px] font-semibold text-[#1A1A1A]">{title}</h1>
        )}
      </div>

      <div className="w-10 flex justify-end">
        {rightAction}
      </div>
    </header>
  );
}
