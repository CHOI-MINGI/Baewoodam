"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, X, Play } from 'lucide-react';
import type { ShowreelItem } from '@/types';

export default function ShowreelManagePage() {
  const router = useRouter();
  const [items, setItems] = useState<ShowreelItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/showreel')
      .then((r) => r.json())
      .then((d) => { setItems(d ?? []); setLoading(false); });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠어요?')) return;
    await fetch(`/api/showreel/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((r) => r.id !== id));
  };

  const formatDuration = (sec: number | null) => {
    if (!sec) return '';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#F0F0F0]">
        <button onClick={() => router.back()} className="text-xl text-[#1A1A1A]">←</button>
        <h1 className="text-[16px] font-semibold text-[#1A1A1A]">대표 영상 관리</h1>
      </div>

      <div className="flex-1 px-5 py-4">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-[#F0F0F0]">
                <div className="w-full aspect-video bg-[#F5F5F5] animate-pulse" />
                <div className="px-3 py-2 h-10 bg-[#F5F5F5] animate-pulse" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-[15px] text-[#888888]">등록된 대표 영상이 없어요.</p>
            <Link
              href="/showreel/new"
              className="px-6 h-[46px] flex items-center rounded-full bg-[#1A1A2E] text-white text-[14px] font-semibold"
            >
              + 영상 추가하기
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((reel) => (
              <div key={reel.id} className="rounded-xl overflow-hidden border border-[#F0F0F0]">
                {/* 썸네일 */}
                <div className="relative w-full aspect-video bg-[#1A1A1A]">
                  {reel.thumbnailUrl ? (
                    <Image
                      src={reel.thumbnailUrl}
                      alt={reel.title}
                      fill
                      className="object-cover opacity-80"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#2A2A2A]" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-white/80 flex items-center justify-center">
                      <Play size={18} className="text-[#1A1A1A] ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* 정보 + 액션 */}
                <div className="px-3 py-2.5 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#1A1A1A] truncate">{reel.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {reel.duration && (
                        <span className="text-[12px] text-[#888888]">{formatDuration(reel.duration)}</span>
                      )}
                      {reel.tags.length > 0 && (
                        <span className="text-[12px] text-[#888888] truncate">
                          {reel.tags.map((t) => `#${t}`).join(' ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 flex-shrink-0 pt-0.5">
                    <Link href={`/showreel/${reel.id}`}>
                      <Pencil size={16} className="text-[#888888]" />
                    </Link>
                    <button onClick={() => handleDelete(reel.id)}>
                      <X size={16} className="text-[#888888]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <Link
        href="/showreel/new"
        className="fixed bottom-24 right-6 w-12 h-12 rounded-full bg-[#1A1A2E] flex items-center justify-center shadow-lg z-40"
      >
        <Plus size={22} color="white" />
      </Link>
    </div>
  );
}
