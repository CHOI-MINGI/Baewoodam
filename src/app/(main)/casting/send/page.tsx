"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Check, Calendar, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AGE_RANGE_MAP } from '@/constants';
import FilterBottomSheet, {
  FilterType,
  FilterValues,
} from '@/components/shared/FilterBottomSheet';
import type { ActorListItem, ProjectItem, ActorDetail } from '@/types';

const DEFAULT_ACTOR_FILTERS: FilterValues = {
  ageRange: '', gender: '', location: '', minFilmo: 0, maxFilmo: 999,
};

const ACTOR_FILTER_CHIPS: { key: FilterType }[] = [
  { key: 'ageRange' },
  { key: 'gender' },
  { key: 'location' },
  { key: 'filmCount' },
];

export default function CastingSendPage() {
  const router = useRouter();
  const params = useSearchParams();
  const initActorId = params.get('actorId');
  const initProjectId = params.get('projectId');
  const initCharacterId = params.get('characterId');

  const mode: 'fromActor' | 'fromCharacter' = initActorId ? 'fromActor' : 'fromCharacter';

  // 공통 상태
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [projectId, setProjectId] = useState(initProjectId ?? '');
  const [characterId, setCharacterId] = useState(initCharacterId ?? '');
  const [period, setPeriod] = useState('');
  const [location, setLocation] = useState('');
  const [conditions, setConditions] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // fromActor 모드
  const [actor, setActor] = useState<ActorDetail | null>(null);
  // fromCharacter 모드
  const [actors, setActors] = useState<ActorListItem[]>([]);
  const [selectedActor, setSelectedActor] = useState<ActorListItem | null>(null);
  const [step, setStep] = useState<1 | 2>(mode === 'fromCharacter' ? 1 : 2);

  // 캐러셀 + 필터 상태
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [actorFilters, setActorFilters] = useState<FilterValues>(DEFAULT_ACTOR_FILTERS);
  const [activeFilter, setActiveFilter] = useState<FilterType | null>(null);
  const [actorQuery, setActorQuery] = useState('');
  const [actorsLoading, setActorsLoading] = useState(false);

  const selectedProject = projects.find((p) => p.id === projectId);
  const characters = selectedProject?.characters ?? [];

  const fetchActorList = async (q: string, f: FilterValues) => {
    setActorsLoading(true);
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (f.ageRange) p.set('ageRange', f.ageRange);
    if (f.gender) p.set('gender', f.gender);
    if (f.location) p.set('location', f.location);
    if (f.minFilmo > 0) p.set('minFilmo', String(f.minFilmo));
    const res = await fetch(`/api/actors?${p.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setActors(data.actors ?? []);
      setCarouselIdx(0);
    }
    setActorsLoading(false);
  };

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(d => setProjects(d ?? []));

    if (mode === 'fromActor' && initActorId) {
      fetch(`/api/actors/${initActorId}`).then(r => r.json()).then(setActor);
    } else {
      fetchActorList('', DEFAULT_ACTOR_FILTERS);
    }
  }, []);

  const targetActorId = mode === 'fromActor' ? initActorId : selectedActor?.id;
  const isReady = targetActorId && projectId && characterId && period.trim() && location.trim();

  const handleSubmit = async () => {
    if (!isReady) return;
    setSending(true);
    const res = await fetch('/api/casting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actorId: targetActorId,
        projectId,
        characterId,
        shootingPeriod: period || null,
        shootingLocation: location || null,
        conditions: conditions || null,
        message: message || null,
      }),
    });
    setSending(false);
    if (res.ok) {
      alert('제안을 보냈어요!');
      router.push('/casting');
    } else {
      alert('제안 발송에 실패했어요.');
    }
  };

  const handleActorFilterChange = (partial: Partial<FilterValues>) => {
    const next = { ...actorFilters, ...partial };
    setActorFilters(next);
    fetchActorList(actorQuery, next);
  };

  const isActorFilterActive = (key: FilterType) => {
    switch (key) {
      case 'ageRange': return !!actorFilters.ageRange;
      case 'gender': return !!actorFilters.gender;
      case 'location': return !!actorFilters.location;
      case 'filmCount': return actorFilters.minFilmo > 0;
    }
  };

  const actorChipLabel = (key: FilterType) => {
    switch (key) {
      case 'ageRange': return actorFilters.ageRange || '나이대';
      case 'gender': return actorFilters.gender || '성별';
      case 'location': return actorFilters.location || '활동 지역';
      case 'filmCount':
        return actorFilters.minFilmo > 0 ? `${actorFilters.minFilmo}편 이상` : '필모 수';
    }
  };

  const currentActor = actors[carouselIdx] ?? null;

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-8 pt-8 pb-4">
        <button
          onClick={() => (mode === 'fromCharacter' && step === 2) ? setStep(1) : router.back()}
          className="w-9 h-9 rounded-full bg-white flex items-center justify-center"
        >
          <ChevronLeft size={20} className="text-[#1A1A1A]" />
        </button>
        <h1 className="text-[22px] font-bold text-[#1A1A1A]">
          {mode === 'fromCharacter' && step === 1 ? '배우 선택' : '캐스팅 제안 보내기'}
        </h1>
      </div>

      <div className="max-w-[1000px] mx-auto px-8 pb-12">

        {/* ===== fromCharacter STEP 1: 배우 선택 (3D 캐러셀) ===== */}
        {mode === 'fromCharacter' && step === 1 && (
          <>
            {/* 검색바 */}
            <div className="flex items-center gap-2 bg-white rounded-2xl px-5 h-[50px] border border-[#E0E0E0] mb-3">
              <Search size={18} className="text-[#888888] flex-shrink-0" />
              <input
                value={actorQuery}
                onChange={(e) => setActorQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchActorList(actorQuery, actorFilters)}
                placeholder="이름, 스킬로 배우를 찾아보세요"
                className="flex-1 bg-transparent text-[15px] text-[#1A1A1A] placeholder:text-[#BBBBBB] outline-none"
              />
              {actorQuery && (
                <button onClick={() => { setActorQuery(''); fetchActorList('', actorFilters); }}>
                  <X size={16} className="text-[#888888]" />
                </button>
              )}
            </div>

            {/* 필터 칩 */}
            <div className="flex gap-2 flex-wrap mb-5">
              {ACTOR_FILTER_CHIPS.map(({ key }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={cn(
                    'px-4 py-2 rounded-full text-[13px] font-medium border transition-colors',
                    isActorFilterActive(key)
                      ? 'bg-[#E53935] text-white border-[#E53935]'
                      : 'bg-white text-[#1A1A1A] border-[#E0E0E0]',
                  )}
                >
                  {actorChipLabel(key)} {isActorFilterActive(key) ? '' : '∨'}
                </button>
              ))}
            </div>

            {/* 3D 캐러셀 */}
            {actorsLoading ? (
              <div className="bg-white rounded-2xl" style={{ height: '500px' }}>
                <div className="h-full animate-pulse bg-[#F5F5F5] rounded-2xl" />
              </div>
            ) : actors.length === 0 ? (
              <div className="bg-white rounded-2xl flex flex-col items-center justify-center py-20 gap-3">
                <p className="text-[15px] text-[#888888]">조건에 맞는 배우가 없어요</p>
                <button
                  onClick={() => { setActorQuery(''); setActorFilters(DEFAULT_ACTOR_FILTERS); fetchActorList('', DEFAULT_ACTOR_FILTERS); }}
                  className="px-5 py-2 rounded-full border border-[#E0E0E0] text-[13px]"
                >
                  필터 초기화
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl pt-5 pb-6 overflow-hidden mb-5">
                <div className="flex items-center justify-between px-6 mb-4">
                  <p className="text-[15px] text-[#888888]">배우 {actors.length}명</p>
                  <span className="text-[13px] text-[#888888]">{carouselIdx + 1} / {actors.length}</span>
                </div>

                {/* 3D 원근감 캐러셀 */}
                <div className="relative" style={{ perspective: '1000px', height: '370px' }}>
                  {actors.map((a, i) => {
                    const offset = i - carouselIdx;
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
                            cursor: 'default',
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

                    return (
                      <div
                        key={a.id}
                        style={cardStyle}
                        onClick={() => { if (!isCenter) setCarouselIdx(i); }}
                      >
                        <div className="relative w-full h-full">
                          {a.image ? (
                            <Image src={a.image} alt={a.name ?? ''} fill className="object-cover object-top" priority={isCenter} />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#444] to-[#888]" />
                          )}
                          {!isCenter && <div className="absolute inset-0 bg-black/30" />}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                          {isCenter && (
                            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#E53935] flex items-center justify-center shadow">
                              <Check size={16} className="text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* 이전 버튼 */}
                  <button
                    onClick={() => setCarouselIdx(c => Math.max(0, c - 1))}
                    disabled={carouselIdx === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center disabled:opacity-25 transition-opacity hover:bg-white"
                  >
                    <ChevronLeft size={20} className="text-[#1A1A1A]" />
                  </button>

                  {/* 다음 버튼 */}
                  <button
                    onClick={() => setCarouselIdx(c => Math.min(actors.length - 1, c + 1))}
                    disabled={carouselIdx === actors.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center disabled:opacity-25 transition-opacity hover:bg-white"
                  >
                    <ChevronRight size={20} className="text-[#1A1A1A]" />
                  </button>
                </div>

                {/* 현재 배우 정보 */}
                {currentActor && (
                  <div className="text-center mt-5 px-6">
                    <p className="text-[20px] font-bold text-[#1A1A1A]">{currentActor.name}</p>
                    <p className="text-[13px] text-[#888888] mt-1">
                      {currentActor.ageRange ? (AGE_RANGE_MAP as any)[currentActor.ageRange] : '나이 미상'} · 필모 {currentActor.filmographyCount}편
                    </p>
                    {currentActor.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                        {currentActor.skills.slice(0, 3).map((s) => (
                          <span key={s} className="text-[12px] px-3 py-1 bg-[#F0F0F0] text-[#555555] rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 아바타 스트립 */}
                <div className="flex gap-2 justify-center mt-4 px-6 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {actors.map((a, i) => (
                    <button key={a.id} onClick={() => setCarouselIdx(i)} className="flex-shrink-0">
                      <div className={cn(
                        'w-9 h-9 rounded-full overflow-hidden border-2 transition-all',
                        i === carouselIdx ? 'border-[#E53935] scale-110' : 'border-transparent opacity-60',
                      )}>
                        {a.image ? (
                          <Image src={a.image} alt={a.name ?? ''} width={36} height={36} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full bg-[#D9D9D9]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 선택 버튼 */}
            <button
              disabled={!currentActor}
              onClick={() => { if (currentActor) { setSelectedActor(currentActor); setStep(2); } }}
              className={cn(
                'w-full h-[52px] rounded-full text-[15px] font-semibold transition-colors',
                currentActor ? 'bg-[#E53935] text-white hover:bg-[#C62828]' : 'bg-[#D9D9D9] text-[#999999]',
              )}
            >
              {currentActor ? `${currentActor.name}에게 제안하기` : '배우를 선택하세요'}
            </button>

            <FilterBottomSheet
              filterType={activeFilter}
              values={actorFilters}
              onClose={() => setActiveFilter(null)}
              onChange={handleActorFilterChange}
            />
          </>
        )}

        {/* ===== 제안 작성 폼 (양쪽 공통) ===== */}
        {((mode === 'fromActor') || (mode === 'fromCharacter' && step === 2)) && (
          <div className="bg-white rounded-2xl p-8 space-y-6">
            {/* 선택된 배우 카드 */}
            {(() => {
              const showActor = mode === 'fromActor' ? actor : selectedActor;
              if (!showActor) return null;
              return (
                <div className="flex items-center gap-4 pb-6 border-b border-[#F0F0F0]">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-[#F5F5F5] flex-shrink-0">
                    {showActor.image ? <Image src={showActor.image} alt={showActor.name ?? ''} width={64} height={64} className="object-cover w-full h-full" /> : <div className="w-full h-full bg-[#D9D9D9]" />}
                  </div>
                  <div>
                    <p className="text-[16px] font-bold text-[#1A1A1A]">{showActor.name}</p>
                    <p className="text-[13px] text-[#888888]">
                      {showActor.ageRange ? (AGE_RANGE_MAP as any)[showActor.ageRange] : ''} · 필모 {(showActor as any).filmographyCount ?? 0}편
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* 프로젝트 선택 */}
            <div>
              <label className="text-[14px] font-semibold text-[#1A1A1A] mb-2 block">프로젝트</label>
              <select
                value={projectId}
                onChange={(e) => { setProjectId(e.target.value); setCharacterId(''); }}
                disabled={mode === 'fromCharacter'}
                className="w-full text-[15px] outline-none border border-[#E0E0E0] rounded-xl px-4 py-3 bg-white focus:border-[#1A1A2E] disabled:bg-[#F5F5F5]"
              >
                <option value="">프로젝트 선택</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>

            {/* 캐릭터 선택 */}
            <div>
              <label className="text-[14px] font-semibold text-[#1A1A1A] mb-2 block">캐릭터</label>
              <select
                value={characterId}
                onChange={(e) => setCharacterId(e.target.value)}
                disabled={!projectId || mode === 'fromCharacter'}
                className="w-full text-[15px] outline-none border border-[#E0E0E0] rounded-xl px-4 py-3 bg-white focus:border-[#1A1A2E] disabled:bg-[#F5F5F5]"
              >
                <option value="">캐릭터 선택</option>
                {characters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* 촬영 기간 */}
            <div>
              <label className="text-[14px] font-semibold text-[#1A1A1A] mb-2 block">촬영 예상 기간</label>
              <div className="flex items-center border border-[#E0E0E0] rounded-xl px-4 py-3 gap-2 focus-within:border-[#1A1A2E]">
                <input
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="예: 2026.07.01 ~ 2026.09.30"
                  className="flex-1 text-[15px] outline-none placeholder:text-[#BBBBBB]"
                />
                <Calendar size={16} className="text-[#888888]" />
              </div>
            </div>

            {/* 촬영 지역 */}
            <div>
              <label className="text-[14px] font-semibold text-[#1A1A1A] mb-2 block">촬영 지역</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="예: 서울, 부산"
                className="w-full text-[15px] outline-none border border-[#E0E0E0] rounded-xl px-4 py-3 placeholder:text-[#BBBBBB] focus:border-[#1A1A2E]"
              />
            </div>

            {/* 출연 조건 */}
            <div>
              <label className="text-[14px] font-semibold text-[#1A1A1A] mb-2 block">출연 조건</label>
              <input
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder="출연료, 계약 조건 등"
                className="w-full text-[15px] outline-none border border-[#E0E0E0] rounded-xl px-4 py-3 placeholder:text-[#BBBBBB] focus:border-[#1A1A2E]"
              />
            </div>

            {/* 메시지 */}
            <div>
              <label className="text-[14px] font-semibold text-[#1A1A1A] mb-2 block">배우에게 전하고 싶은 말</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="캐릭터와 배우가 잘 어울리는 이유, 제안 배경 등을 자유롭게 작성해 주세요."
                rows={5}
                className="w-full text-[15px] outline-none border border-[#E0E0E0] rounded-xl px-4 py-3 resize-none placeholder:text-[#BBBBBB] focus:border-[#1A1A2E]"
              />
            </div>

            <button
              disabled={!isReady || sending}
              onClick={handleSubmit}
              className={cn(
                'w-full h-[52px] rounded-full text-[15px] font-semibold transition-colors',
                isReady && !sending ? 'bg-[#E53935] text-white hover:bg-[#C62828]' : 'bg-[#D9D9D9] text-[#999999]',
              )}
            >
              {sending ? '전송 중...' : '제안 보내기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
