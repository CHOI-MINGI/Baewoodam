"use client";

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import FilterBottomSheet, {
  FilterType,
  FilterValues,
} from '@/components/shared/FilterBottomSheet';
import { AGE_RANGE_MAP } from '@/constants';
import type { ActorListItem } from '@/types';

const DEFAULT_FILTERS: FilterValues = {
  ageRange: '', gender: '', location: '', minFilmo: 0, maxFilmo: 999,
};

const FILTER_CHIPS = [
  { key: 'ageRange' as FilterType }, { key: 'gender' as FilterType },
  { key: 'location' as FilterType }, { key: 'filmCount' as FilterType },
];

export default function AgencyHome() {
  const [recommended, setRecommended] = useState<ActorListItem[]>([]);
  const [actors, setActors] = useState<ActorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
  const [activeFilter, setActiveFilter] = useState<FilterType | null>(null);
  const [current, setCurrent] = useState(0);

  // 추천 배우 (필모 많은 순)
  useEffect(() => {
    fetch('/api/actors/recommended')
      .then(r => r.json())
      .then(d => setRecommended(d.actors ?? []));
  }, []);

  const fetchActors = async (f: FilterValues) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (f.ageRange) params.set('ageRange', f.ageRange);
    if (f.gender) params.set('gender', f.gender);
    if (f.location) params.set('location', f.location);
    if (f.minFilmo > 0) params.set('minFilmo', String(f.minFilmo));
    const res = await fetch(`/api/actors?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setActors(data.actors ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchActors(filters); }, []);

  const handleFilterChange = (partial: Partial<FilterValues>) => {
    const next = { ...filters, ...partial };
    setFilters(next);
    fetchActors(next);
  };

  const chipLabel = (key: FilterType) => {
    switch (key) {
      case 'ageRange': return filters.ageRange || '나이대';
      case 'gender': return filters.gender || '성별';
      case 'location': return filters.location || '활동 지역';
      case 'filmCount':
        return filters.minFilmo > 0 ? `${filters.minFilmo}편 이상` : '필모 수';
    }
  };

  const isActive = (key: FilterType) => {
    switch (key) {
      case 'ageRange': return !!filters.ageRange;
      case 'gender': return !!filters.gender;
      case 'location': return !!filters.location;
      case 'filmCount': return filters.minFilmo > 0;
    }
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    fetchActors(DEFAULT_FILTERS);
  };


  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-8 pt-8 pb-4">
        <h1 className="text-[22px] font-bold text-[#1A1A1A]">홈</h1>
        <button><Search size={22} className="text-[#1A1A1A]" /></button>
      </div>

      <div className="max-w-[1200px] mx-auto px-8 pb-12 space-y-5">

        {/* 필터바 */}
        <div className="flex gap-2 flex-wrap">
          {FILTER_CHIPS.map(({ key }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={cn(
                'px-4 py-2 rounded-full text-[14px] font-medium border transition-colors',
                isActive(key)
                  ? 'bg-[#E53935] text-white border-[#E53935]'
                  : 'bg-white text-[#1A1A1A] border-[#E0E0E0]',
              )}
            >
              {chipLabel(key)} {isActive(key) ? '' : '∨'}
            </button>
          ))}
        </div>

        {/* 추천 배우 — 3D 캐러셀 */}
        {recommended.length > 0 && (
          <div className="bg-white rounded-2xl pt-5 pb-6 overflow-hidden">
            <div className="flex items-center justify-between px-6 mb-4">
              <h2 className="text-[18px] font-bold text-[#1A1A1A]">✨ 추천 배우</h2>
              <span className="text-[13px] text-[#888888]">{current + 1} / {recommended.length}</span>
            </div>

            {/* 3D 원근감 캐러셀 */}
            <div className="relative" style={{ perspective: '1000px', height: '370px' }}>
              {recommended.map((actor, i) => {
                const offset = i - current;
                if (Math.abs(offset) > 1) return null;

                const isCenter = offset === 0;
                const dir = offset > 0 ? 1 : -1;

                const cardStyle: React.CSSProperties = {
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: '250px',
                  height: '333px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.45s ease, box-shadow 0.45s ease',
                  ...(isCenter
                    ? {
                        transform: 'translate(-50%, -50%) rotateY(0deg) scale(1)',
                        zIndex: 10,
                        opacity: 1,
                        boxShadow: '0 24px 64px rgba(0,0,0,0.32)',
                        cursor: 'pointer',
                      }
                    : {
                        transform: `translate(calc(-50% + ${dir * 245}px), -50%) rotateY(${-dir * 42}deg) scale(0.80)`,
                        zIndex: 5,
                        opacity: 0.72,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                      }
                  ),
                };

                const inner = (
                  <div className="relative w-full h-full">
                    {actor.image ? (
                      <Image
                        src={actor.image}
                        alt={actor.name ?? ''}
                        fill
                        className="object-cover object-top"
                        priority={isCenter}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#444] to-[#888]" />
                    )}
                    {!isCenter && <div className="absolute inset-0 bg-black/30" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  </div>
                );

                return isCenter ? (
                  <Link key={actor.id} href={`/actors/${actor.id}`} style={cardStyle}>{inner}</Link>
                ) : (
                  <div key={actor.id} style={cardStyle} onClick={() => setCurrent(i)}>{inner}</div>
                );
              })}

              {/* 이전 버튼 */}
              <button
                onClick={() => setCurrent(c => Math.max(0, c - 1))}
                disabled={current === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center disabled:opacity-25 transition-opacity hover:bg-white"
              >
                <ChevronLeft size={20} className="text-[#1A1A1A]" />
              </button>

              {/* 다음 버튼 */}
              <button
                onClick={() => setCurrent(c => Math.min(recommended.length - 1, c + 1))}
                disabled={current === recommended.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center disabled:opacity-25 transition-opacity hover:bg-white"
              >
                <ChevronRight size={20} className="text-[#1A1A1A]" />
              </button>
            </div>

            {/* 현재 배우 정보 */}
            {recommended[current] && (
              <Link href={`/actors/${recommended[current].id}`} className="block">
                <div className="text-center mt-5 px-6">
                  <p className="text-[20px] font-bold text-[#1A1A1A]">{recommended[current].name}</p>
                  <p className="text-[13px] text-[#888888] mt-1">
                    {recommended[current].ageRange ? (AGE_RANGE_MAP as any)[recommended[current].ageRange!] : '나이 미상'} · 필모 {recommended[current].filmographyCount}편
                  </p>
                  {recommended[current].skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                      {recommended[current].skills.slice(0, 3).map((s) => (
                        <span key={s} className="text-[12px] px-3 py-1 bg-[#F0F0F0] text-[#555555] rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            )}

            {/* 아바타 스트립 */}
            <div className="flex gap-2 justify-center mt-4 px-6 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {recommended.map((actor, i) => (
                <button key={actor.id} onClick={() => setCurrent(i)} className="flex-shrink-0">
                  <div className={cn(
                    'w-9 h-9 rounded-full overflow-hidden border-2 transition-all',
                    i === current ? 'border-[#E53935] scale-110' : 'border-transparent opacity-60',
                  )}>
                    {actor.image ? (
                      <Image src={actor.image} alt={actor.name ?? ''} width={36} height={36} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-[#D9D9D9]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 전체 배우 그리드 */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-4">전체 배우</h2>
          {loading ? (
            <div className="grid grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="aspect-[3/4] bg-[#F5F5F5] rounded-xl animate-pulse" />)}
            </div>
          ) : actors.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-4">
              <p className="text-[15px] text-[#888888]">조건에 맞는 배우가 없어요</p>
              <button onClick={resetFilters} className="px-6 py-2.5 rounded-full border border-[#E0E0E0] text-[14px]">
                필터 초기화
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {actors.map((actor) => (
                <Link key={actor.id} href={`/actors/${actor.id}`} className="group">
                  <div className="rounded-xl overflow-hidden border border-[#F0F0F0]">
                    <div className="relative w-full aspect-[3/4] bg-[#F5F5F5]">
                      {actor.image ? (
                        <Image src={actor.image} alt={actor.name ?? ''} fill className="object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full bg-[#D9D9D9]" />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-[14px] font-bold text-[#1A1A1A]">{actor.name}</p>
                      <p className="text-[12px] text-[#888888] mt-0.5">
                        {actor.ageRange ? (AGE_RANGE_MAP as any)[actor.ageRange] : ''} · 필모 {actor.filmographyCount}편
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {actor.skills.slice(0, 2).map((s) => (
                          <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5F5F5] text-[#888888]">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <FilterBottomSheet
        filterType={activeFilter}
        values={filters}
        onClose={() => setActiveFilter(null)}
        onChange={handleFilterChange}
      />
    </div>
  );
}
