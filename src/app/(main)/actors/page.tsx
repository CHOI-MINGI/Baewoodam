"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import FilterBottomSheet, {
  FilterType,
  FilterValues,
} from '@/components/shared/FilterBottomSheet';
import { AGE_RANGE_MAP } from '@/constants';
import type { ActorListItem } from '@/types';

const DEFAULT_FILTERS: FilterValues = {
  ageRange: '',
  gender: '',
  location: '',
  minFilmo: 0,
  maxFilmo: 30,
};

const FILTER_CHIPS = [
  { key: 'ageRange' as FilterType, label: '나이대' },
  { key: 'gender' as FilterType, label: '성별' },
  { key: 'location' as FilterType, label: '지역' },
  { key: 'filmCount' as FilterType, label: '필모 수' },
];

export default function ActorsPage() {
  const [actors, setActors] = useState<ActorListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
  const [activeFilter, setActiveFilter] = useState<FilterType | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchActors = async (q: string, f: FilterValues) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (f.ageRange) params.set('ageRange', f.ageRange);
    if (f.gender) params.set('gender', f.gender);
    if (f.location) params.set('location', f.location);
    if (f.minFilmo > 0) params.set('minFilmo', String(f.minFilmo));
    if (f.maxFilmo < 30) params.set('maxFilmo', String(f.maxFilmo));
    const res = await fetch(`/api/actors?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setActors(data.actors ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActors('', DEFAULT_FILTERS);
  }, []);

  const handleSearch = () => fetchActors(query, filters);

  const handleFilterChange = (partial: Partial<FilterValues>) => {
    const next = { ...filters, ...partial };
    setFilters(next);
    fetchActors(query, next);
  };

  const isActive = (key: FilterType) => {
    switch (key) {
      case 'ageRange': return !!filters.ageRange;
      case 'gender': return !!filters.gender;
      case 'location': return !!filters.location;
      case 'filmCount': return filters.minFilmo > 0 || filters.maxFilmo < 30;
    }
  };

  const chipLabel = (key: FilterType) => {
    switch (key) {
      case 'ageRange': return filters.ageRange || '나이대';
      case 'gender': return filters.gender || '성별';
      case 'location': return filters.location || '지역';
      case 'filmCount':
        return filters.minFilmo > 0 || filters.maxFilmo < 30
          ? `${filters.minFilmo}~${filters.maxFilmo}편`
          : '필모 수';
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* 헤더 + 검색 */}
      <div className="px-4 pt-4 pb-3 border-b border-[#F0F0F0] bg-white">
        <h1 className="text-[16px] font-semibold text-[#1A1A1A] mb-3">배우 탐색</h1>
        <div className="flex items-center gap-2 bg-[#F5F5F5] rounded-full px-4 h-[42px]">
          <Search size={16} className="text-[#888888] flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="이름, 스킬로 배우를 찾아보세요"
            className="flex-1 bg-transparent text-[14px] text-[#1A1A1A] placeholder:text-[#BBBBBB] outline-none"
          />
          {query && (
            <button onClick={() => { setQuery(''); fetchActors('', filters); }}>
              <X size={15} className="text-[#888888]" />
            </button>
          )}
        </div>
      </div>

      {/* 필터 칩 */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-white border-b border-[#F0F0F0]"
        style={{ scrollbarWidth: 'none' }}>
        {FILTER_CHIPS.map(({ key }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors',
              isActive(key)
                ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]'
                : 'bg-white text-[#1A1A1A] border-[#E0E0E0]',
            )}
          >
            {chipLabel(key)} {isActive(key) ? '' : '∨'}
          </button>
        ))}
      </div>

      {/* 결과 수 */}
      <div className="px-4 py-2">
        <span className="text-[12px] text-[#888888]">
          {loading ? '검색 중...' : `배우 ${actors.length}명`}
        </span>
      </div>

      {/* 배우 목록 */}
      <div className="flex-1 px-4 pb-4">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[100px] bg-[#F5F5F5] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : actors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-[15px] text-[#888888]">검색 결과가 없어요</p>
            <button
              onClick={() => { setQuery(''); setFilters(DEFAULT_FILTERS); fetchActors('', DEFAULT_FILTERS); }}
              className="px-5 py-2 rounded-full border border-[#E0E0E0] text-[13px] text-[#1A1A1A]"
            >
              초기화
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {actors.map((actor) => (
              <Link key={actor.id} href={`/actors/${actor.id}`}>
                <div className="flex gap-3 bg-white rounded-xl p-3 border border-[#F0F0F0] shadow-sm">
                  <div className="w-[80px] h-[80px] rounded-lg overflow-hidden bg-[#F5F5F5] flex-shrink-0">
                    {actor.image ? (
                      <Image src={actor.image} alt={actor.name ?? ''} width={80} height={80} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#D9D9D9]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <p className="text-[15px] font-bold text-[#1A1A1A]">{actor.name}</p>
                    <p className="text-[12px] text-[#888888] mt-0.5">
                      {actor.ageRange ? (AGE_RANGE_MAP as any)[actor.ageRange] : ''}
                      {actor.ageRange ? ' · ' : ''}필모 {actor.filmographyCount}편
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {actor.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="px-2 py-0.5 rounded-full border border-[#E0E0E0] text-[11px] text-[#888888]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
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
