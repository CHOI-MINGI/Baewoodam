"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import FilterBottomSheet, { FilterType, FilterValues } from '@/components/shared/FilterBottomSheet';
import { AGE_RANGE_MAP, MEDIA_TYPE_MAP } from '@/constants';
import type { ActorListItem } from '@/types';

/* ───────── 에이전시 홈 ───────── */

const DEFAULT_FILTERS: FilterValues = {
  ageRange: '', gender: '', location: '', minFilmo: 0, maxFilmo: 30,
};
const FILTER_CHIPS = [
  { key: 'ageRange' as FilterType, label: '나이대' },
  { key: 'gender' as FilterType, label: '성별' },
  { key: 'location' as FilterType, label: '활동 지역' },
  { key: 'filmCount' as FilterType, label: '필모 수' },
];

function AgencyHome() {
  const [actors, setActors] = useState<ActorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
  const [activeFilter, setActiveFilter] = useState<FilterType | null>(null);

  const fetchActors = async (f: FilterValues) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (f.ageRange) params.set('ageRange', f.ageRange);
    if (f.gender) params.set('gender', f.gender);
    if (f.location) params.set('location', f.location);
    if (f.minFilmo > 0) params.set('minFilmo', String(f.minFilmo));
    if (f.maxFilmo < 30) params.set('maxFilmo', String(f.maxFilmo));
    const res = await fetch(`/api/actors?${params.toString()}`);
    if (res.ok) setActors((await res.json()).actors ?? []);
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
      case 'filmCount': return filters.minFilmo > 0 || filters.maxFilmo < 30
        ? `필모 ${filters.minFilmo}~${filters.maxFilmo}개` : '필모 수';
    }
  };

  const isActive = (key: FilterType) => {
    switch (key) {
      case 'ageRange': return !!filters.ageRange;
      case 'gender': return !!filters.gender;
      case 'location': return !!filters.location;
      case 'filmCount': return filters.minFilmo > 0 || filters.maxFilmo < 30;
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0F0F0]">
        <span className="text-[16px] font-semibold text-[#1A1A1A]">인기 배우</span>
        <button><Search size={20} className="text-[#1A1A1A]" /></button>
      </div>
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-[#F0F0F0]">
        {FILTER_CHIPS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors',
              isActive(key) ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]' : 'bg-white text-[#1A1A1A] border-[#E0E0E0]',
            )}
          >
            {chipLabel(key)} {isActive(key) ? '' : '∨'}
          </button>
        ))}
      </div>
      <div className="flex-1 px-4 py-3">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-[130px] bg-[#F5F5F5] rounded-xl animate-pulse" />)}
          </div>
        ) : actors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-[15px] text-[#888888]">조건에 맞는 배우가 없어요</p>
            <button
              onClick={() => { setFilters(DEFAULT_FILTERS); fetchActors(DEFAULT_FILTERS); }}
              className="px-6 py-2.5 rounded-full border border-[#E0E0E0] text-[14px] text-[#1A1A1A]"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {actors.map((actor) => <ActorCard key={actor.id} actor={actor} />)}
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

function ActorCard({ actor }: { actor: ActorListItem }) {
  return (
    <Link href={`/actors/${actor.id}`}>
      <div className="flex gap-3 bg-white rounded-xl p-3 shadow-sm border border-[#F0F0F0]">
        <div className="w-[90px] h-[90px] rounded-lg overflow-hidden bg-[#F5F5F5] flex-shrink-0">
          {actor.image ? (
            <Image src={actor.image} alt={actor.name ?? ''} width={90} height={90} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#D9D9D9]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-bold text-[#1A1A1A]">{actor.name}</p>
          <p className="text-[13px] text-[#888888] mt-0.5">
            {actor.ageRange ? (AGE_RANGE_MAP as any)[actor.ageRange] : ''} · 필모 {actor.filmographyCount}편
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {actor.skills.slice(0, 3).map((skill) => (
              <span key={skill} className="px-2 py-0.5 rounded-full border border-[#E0E0E0] text-[11px] text-[#888888]">{skill}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ───────── 배우 홈 ───────── */

const STATUS_LABEL: Record<string, string> = {
  PENDING: '검토 중', ACCEPTED: '수락됨', REJECTED: '거절됨',
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'text-[#888888]', ACCEPTED: 'text-[#1A7A4A]', REJECTED: 'text-[#E53935]',
};

type CastingOffer = {
  id: string;
  status: string;
  createdAt: string;
  project: { title: string; mediaType: string };
  character: { name: string };
  sender: { name: string | null; image: string | null };
};

function ActorHome() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const [offers, setOffers] = useState<CastingOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/casting?type=received')
      .then((r) => r.json())
      .then((data) => { setOffers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-full">
      {/* 프로필 요약 */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[#F0F0F0]">
        <div className="w-[48px] h-[48px] rounded-full overflow-hidden bg-[#D9D9D9] flex-shrink-0">
          {user?.image && <Image src={user.image} alt="" width={48} height={48} className="w-full h-full object-cover" />}
        </div>
        <div>
          <p className="text-[15px] font-bold text-[#1A1A1A]">{user?.name ?? '배우'}</p>
          <p className="text-[12px] text-[#888888]">내 프로필 보기</p>
        </div>
        <Link href="/mypage" className="ml-auto text-[13px] text-[#1A1A2E] font-medium border border-[#1A1A2E] px-3 py-1.5 rounded-full">
          프로필
        </Link>
      </div>

      {/* 받은 캐스팅 제안 */}
      <div className="px-4 py-4">
        <p className="text-[15px] font-semibold text-[#1A1A1A] mb-3">받은 캐스팅 제안</p>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-[80px] bg-[#F5F5F5] rounded-xl animate-pulse" />)}
          </div>
        ) : offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-[15px] text-[#888888]">아직 받은 캐스팅 제안이 없어요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {offers.map((offer) => (
              <Link key={offer.id} href={`/casting/${offer.id}`}>
                <div className="bg-white rounded-xl p-4 border border-[#F0F0F0] shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[15px] font-bold text-[#1A1A1A]">{offer.project.title}</p>
                    <span className={cn('text-[12px] font-medium', STATUS_COLOR[offer.status] ?? 'text-[#888888]')}>
                      {STATUS_LABEL[offer.status] ?? offer.status}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#888888]">
                    {(MEDIA_TYPE_MAP as any)[offer.project.mediaType] ?? offer.project.mediaType} · {offer.character.name} 역
                  </p>
                  <p className="text-[12px] text-[#BBBBBB] mt-1">from {offer.sender.name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────── 메인 분기 ───────── */

export default function HomePage() {
  const { data: session } = useSession();
  const roleType = (session?.user as any)?.roleType;

  if (!session) return null;

  return roleType === 'ACTOR' ? <ActorHome /> : <AgencyHome />;
}
