"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Film, Play, PlayCircle, Star, X } from 'lucide-react';
import type { ShowreelItem } from '@/types';

interface Work {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  genre: string | null;
  year: number | null;
  channelTitle: string | null;
  isFeatured: boolean;
  isPublic: boolean;
}

function formatDuration(sec: number | null) {
  if (!sec) return '';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function WorksPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [showreels, setShowreels] = useState<ShowreelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingFeatured, setSelectingFeatured] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/works').then((r) => r.ok ? r.json() : []),
      fetch('/api/showreel').then((r) => r.ok ? r.json() : []),
    ])
      .then(([w, s]) => {
        setWorks(Array.isArray(w) ? w : []);
        setShowreels(Array.isArray(s) ? s : []);
      })
      .catch((e) => console.error('로딩 실패:', e))
      .finally(() => setLoading(false));
  }, []);

  const handleSetFeatured = async (work: Work) => {
    const isUnset = work.isFeatured;
    const msg = isUnset
      ? `"${work.title}" 대표영상을 해제할까요?`
      : `"${work.title}"을(를) 대표영상으로 설정할까요?`;
    if (!confirm(msg)) return;
    await fetch(`/api/works/${work.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured: !isUnset }),
    });
    setWorks((prev) => prev.map((w) =>
      isUnset
        ? { ...w, isFeatured: false }
        : { ...w, isFeatured: w.id === work.id }
    ));
    setSelectingFeatured(false);
  };

  if (loading) return <div className="min-h-screen bg-[#F5F5F5]" />;

  const isEmpty = works.length === 0 && showreels.length === 0;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pt-8 pb-4">
        <h1 className="text-[20px] font-bold text-[#1A1A1A]">작품 관리</h1>
        <div className="flex items-center gap-2">
          {works.length > 0 && (
            <button
              onClick={() => setSelectingFeatured((v) => !v)}
              className={`flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-full border transition-colors ${
                selectingFeatured
                  ? 'bg-[#E53935] text-white border-[#E53935]'
                  : 'bg-white text-[#1A1A1A] border-[#E0E0E0]'
              }`}
            >
              {selectingFeatured ? <><X size={14} /> 취소</> : <><Star size={14} /> 대표영상 설정</>}
            </button>
          )}
          <Link
            href="/works/new"
            className="flex items-center gap-1.5 bg-[#1A1A2E] text-white text-[13px] font-medium px-4 py-2 rounded-full"
          >
            <Plus size={14} />
            작품 등록
          </Link>
        </div>
      </div>

      {/* 선택 모드 안내 배너 */}
      {selectingFeatured && (
        <div className="mx-5 mb-2 px-4 py-2.5 bg-[#FFF3F3] border border-[#E53935]/30 rounded-xl">
          <p className="text-[13px] text-[#E53935] font-medium">설정할 작품을 클릭하세요 · 대표 작품 클릭 시 해제</p>
        </div>
      )}

      <div className="px-5 pb-24">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-full bg-[#F0F0F0] flex items-center justify-center">
              <Film size={28} className="text-[#BBBBBB]" />
            </div>
            <p className="text-[15px] text-[#888888] text-center">
              아직 등록된 작품이 없어요.<br />유튜브 링크로 작품을 등록해보세요!
            </p>
            <Link
              href="/works/new"
              className="mt-2 bg-[#1A1A2E] text-white text-[14px] font-semibold px-6 py-3 rounded-full"
            >
              작품 등록하기
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* YouTube 작품 섹션 */}
            {works.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <PlayCircle size={16} className="text-[#FF0000]" />
                  <h2 className="text-[15px] font-bold text-[#1A1A1A]">YouTube 작품</h2>
                  <span className="text-[12px] text-[#888888]">{works.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {works.map((work) => {
                    const thumbArea = (
                      <div className={`relative w-full aspect-video rounded-xl overflow-hidden bg-[#1A1A1A] transition-all ${
                        selectingFeatured ? 'group-hover:opacity-90' : ''
                      }`}>
                        {work.thumbnailUrl ? (
                          <Image src={work.thumbnailUrl} alt={work.title} fill className="object-cover transition-opacity" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PlayCircle size={24} className="text-[#555555]" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2 flex gap-1">
                          {work.isFeatured && (
                            <span className="bg-[#E53935] text-white text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                              <Star size={8} fill="white" /> 대표
                            </span>
                          )}
                          {!work.isPublic && (
                            <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">비공개</span>
                          )}
                        </div>
                        {selectingFeatured && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className={`text-white text-[12px] font-semibold px-3 py-1.5 rounded-full ${work.isFeatured ? 'bg-black/60' : 'bg-[#E53935]'}`}>
                              {work.isFeatured ? '대표 해제' : '대표로 설정'}
                            </span>
                          </div>
                        )}
                      </div>
                    );

                    const info = (
                      <div className="mt-2 px-0.5">
                        <p className="text-[14px] font-semibold text-[#1A1A1A] line-clamp-1">{work.title}</p>
                        <p className="text-[12px] text-[#888888]">{[work.genre, work.year].filter(Boolean).join(' · ')}</p>
                      </div>
                    );

                    return selectingFeatured ? (
                      <button key={work.id} className="block text-left group w-full" onClick={() => handleSetFeatured(work)}>
                        {thumbArea}{info}
                      </button>
                    ) : (
                      <Link key={work.id} href={`/works/${work.id}`} className="block group">
                        {thumbArea}{info}
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 쇼릴 섹션 */}
            {showreels.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Play size={16} className="text-[#1A1A2E]" />
                  <h2 className="text-[15px] font-bold text-[#1A1A1A]">쇼릴</h2>
                  <span className="text-[12px] text-[#888888]">{showreels.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {showreels.map((reel) => (
                    <Link key={reel.id} href={`/showreel/${reel.id}`} className="block group">
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#1A1A1A]">
                        {reel.thumbnailUrl && (
                          <Image
                            src={reel.thumbnailUrl}
                            alt={reel.title}
                            fill
                            className="object-cover opacity-80 group-hover:opacity-70 transition-opacity"
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                            <Play size={16} className="text-[#1A1A1A] ml-0.5" />
                          </div>
                        </div>
                        {reel.isFeatured && (
                          <span className="absolute top-2 left-2 bg-[#E53935] text-white text-[10px] px-2 py-0.5 rounded-full">
                            대표
                          </span>
                        )}
                      </div>
                      <div className="mt-2 px-0.5">
                        <p className="text-[14px] font-semibold text-[#1A1A1A] line-clamp-1">{reel.title}</p>
                        <p className="text-[12px] text-[#888888]">
                          {[formatDuration(reel.duration ?? null), reel.tags[0] ? `#${reel.tags[0]}` : null].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
