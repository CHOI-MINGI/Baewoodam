"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, Check, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AGE_RANGE_MAP } from '@/constants';
import type { ActorListItem, ProjectItem, ActorDetail } from '@/types';

export default function CastingSendPage() {
  const router = useRouter();
  const params = useSearchParams();
  const initActorId = params.get('actorId');
  const initProjectId = params.get('projectId');
  const initCharacterId = params.get('characterId');

  // 진입 모드: 배우가 정해져있으면 'fromActor', 아니면 'fromCharacter'
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

  // fromActor 모드: 배우 정보
  const [actor, setActor] = useState<ActorDetail | null>(null);
  // fromCharacter 모드: 배우 선택
  const [actors, setActors] = useState<ActorListItem[]>([]);
  const [selectedActor, setSelectedActor] = useState<ActorListItem | null>(null);
  const [step, setStep] = useState<1 | 2>(mode === 'fromCharacter' ? 1 : 2);

  const selectedProject = projects.find((p) => p.id === projectId);
  const characters = selectedProject?.characters ?? [];

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(d => setProjects(d ?? []));

    if (mode === 'fromActor' && initActorId) {
      fetch(`/api/actors/${initActorId}`).then(r => r.json()).then(setActor);
    } else {
      fetch('/api/actors/recommended').then(r => r.json()).then(d => setActors(d.actors ?? []));
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

        {/* ===== fromCharacter STEP 1: 배우 선택 ===== */}
        {mode === 'fromCharacter' && step === 1 && (
          <>
            <p className="text-[14px] text-[#888888] mb-5">제안을 보낼 배우를 선택하세요. (추천순)</p>
            {actors.length === 0 ? (
              <div className="text-center py-20 text-[#888888]">등록된 배우가 없어요.</div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {actors.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedActor(a)}
                    className={cn(
                      'text-left rounded-2xl overflow-hidden border-2 transition-all bg-white',
                      selectedActor?.id === a.id ? 'border-[#E53935]' : 'border-transparent hover:border-[#E0E0E0]',
                    )}
                  >
                    <div className="relative w-full aspect-[3/4] bg-[#F5F5F5]">
                      {a.image ? <Image src={a.image} alt={a.name ?? ''} fill className="object-cover" /> : <div className="w-full h-full bg-[#D9D9D9]" />}
                      {selectedActor?.id === a.id && (
                        <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#E53935] flex items-center justify-center">
                          <Check size={16} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-[14px] font-bold text-[#1A1A1A]">{a.name}</p>
                      <p className="text-[12px] text-[#888888]">
                        {a.ageRange ? (AGE_RANGE_MAP as any)[a.ageRange] : ''} · 필모 {a.filmographyCount}편
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="mt-6">
              <button
                disabled={!selectedActor}
                onClick={() => setStep(2)}
                className={cn(
                  'w-full h-[52px] rounded-full text-[15px] font-semibold transition-colors',
                  selectedActor ? 'bg-[#1A1A2E] text-white' : 'bg-[#D9D9D9] text-[#999999]',
                )}
              >
                {selectedActor ? `${selectedActor.name}에게 제안하기` : '배우를 선택하세요'}
              </button>
            </div>
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
