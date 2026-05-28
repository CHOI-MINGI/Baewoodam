"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, X } from 'lucide-react';
import { MEDIA_TYPE_MAP, ROLE_MAP } from '@/constants';
import type { FilmographyItem } from '@/types';

export default function FilmographyManagePage() {
  const router = useRouter();
  const [items, setItems] = useState<FilmographyItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch('/api/filmography')
      .then((r) => r.json())
      .then((d) => { setItems(d ?? []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠어요?')) return;
    await fetch(`/api/filmography/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((f) => f.id !== id));
  };

  const byYear = items.reduce<Record<number, FilmographyItem[]>>((acc, f) => {
    if (!acc[f.year]) acc[f.year] = [];
    acc[f.year].push(f);
    return acc;
  }, {});
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#F0F0F0]">
        <button onClick={() => router.back()} className="text-xl text-[#1A1A1A]">←</button>
        <h1 className="text-[16px] font-semibold text-[#1A1A1A]">필모그래피 관리</h1>
      </div>

      <div className="flex-1 px-5 py-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-[#F5F5F5] rounded-xl animate-pulse" />)}
          </div>
        ) : years.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-[15px] text-[#888888]">등록된 필모그래피가 없어요.</p>
            <Link
              href="/filmography/new"
              className="px-6 h-[46px] flex items-center rounded-full bg-[#1A1A2E] text-white text-[14px] font-semibold"
            >
              + 작품 추가하기
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {years.map((year) => (
              <div key={year}>
                <p className="text-[13px] font-semibold text-[#888888] mb-4">{year}</p>
                <div className="relative flex flex-col gap-5">
                  {/* 타임라인 선 */}
                  <div className="absolute left-[6px] top-2 bottom-2 w-[1px] bg-[#E0E0E0]" />

                  {byYear[year].map((film) => (
                    <div key={film.id} className="flex gap-3 items-start pl-5 relative">
                      {/* 타임라인 점 */}
                      <div className="absolute left-0 top-2 w-3 h-3 rounded-full border-2 border-[#1A1A2E] bg-white flex-shrink-0" />

                      {/* 포스터 */}
                      <div className="w-[52px] h-[72px] rounded-lg overflow-hidden bg-[#F5F5F5] flex-shrink-0">
                        {film.thumbnailUrl
                          ? <Image src={film.thumbnailUrl} alt={film.title} width={52} height={72} className="object-cover w-full h-full" />
                          : <div className="w-full h-full bg-[#E0E0E0]" />}
                      </div>

                      {/* 정보 */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <span className="text-[11px] text-[#888888] bg-[#F5F5F5] px-2 py-0.5 rounded">
                          {(MEDIA_TYPE_MAP as any)[film.mediaType] ?? film.mediaType}
                        </span>
                        <p className="text-[14px] font-semibold text-[#1A1A1A] mt-1.5">{film.title}</p>
                        <p className="text-[12px] text-[#888888]">
                          {(ROLE_MAP as any)[film.role]}{film.characterName ? ` · ${film.characterName}` : ''}
                        </p>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-3 flex-shrink-0 pt-1">
                        <Link href={`/filmography/${film.id}`}>
                          <Pencil size={16} className="text-[#888888]" />
                        </Link>
                        <button onClick={() => handleDelete(film.id)}>
                          <X size={16} className="text-[#888888]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <Link
        href="/filmography/new"
        className="fixed bottom-24 right-6 w-12 h-12 rounded-full bg-[#1A1A2E] flex items-center justify-center shadow-lg z-10"
      >
        <Plus size={22} color="white" />
      </Link>
    </div>
  );
}
