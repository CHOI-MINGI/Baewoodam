"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AGE_RANGE_MAP } from '@/constants';
import type { ActorListItem, ProjectItem } from '@/types';

export default function CastingSendPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actorId = searchParams.get('actorId') ?? '';

  const [actor, setActor] = useState<ActorListItem | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [projectId, setProjectId] = useState('');
  const [characterId, setCharacterId] = useState('');
  const [period, setPeriod] = useState('');
  const [location, setLocation] = useState('');
  const [conditions, setConditions] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedProject = projects.find((p) => p.id === projectId);
  const characters = selectedProject?.characters ?? [];

  const isReady = projectId && characterId && period.trim() && location.trim();

  useEffect(() => {
    if (actorId) {
      fetch(`/api/actors/${actorId}`).then((r) => r.json()).then(setActor);
    }
    fetch('/api/projects').then((r) => r.json()).then((d) => setProjects(d ?? []));
  }, [actorId]);

  const handleSubmit = async () => {
    if (!isReady) return;
    setLoading(true);
    const res = await fetch('/api/casting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actorId,
        projectId,
        characterId,
        shootingPeriod: period,
        shootingLocation: location,
        conditions,
        message,
      }),
    });
    setLoading(false);
    if (res.ok) router.push('/casting');
  };

  return (
    <div className="flex flex-col min-h-screen px-5 pb-32">
      {/* 헤더 */}
      <div className="flex items-center gap-3 py-3 mb-4">
        <button onClick={() => router.back()} className="text-xl text-[#1A1A1A]">←</button>
        <h1 className="text-[16px] font-semibold text-[#1A1A1A]">캐스팅 제안 보내기</h1>
      </div>

      {/* 배우 정보 카드 */}
      {actor && (
        <div className="flex gap-3 bg-[#F5F5F5] rounded-xl p-3 mb-5">
          <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-[#E0E0E0] flex-shrink-0">
            {actor.image && <Image src={actor.image} alt={actor.name ?? ''} width={60} height={60} className="object-cover w-full h-full" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-[#1A1A1A]">{actor.name}</p>
            <p className="text-[13px] text-[#888888]">
              {actor.ageRange ? (AGE_RANGE_MAP as any)[actor.ageRange] : ''} · 필모 {actor.filmographyCount}편
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {actor.skills.slice(0, 3).map((s) => (
                <span key={s} className="px-2 py-0.5 border border-[#E0E0E0] rounded-full text-[11px] text-[#888888]">{s}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* 프로젝트 선택 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">프로젝트</label>
          <select
            value={projectId}
            onChange={(e) => { setProjectId(e.target.value); setCharacterId(''); }}
            className="w-full text-[15px] outline-none border-b border-[#E0E0E0] pb-2 bg-transparent"
          >
            <option value="">프로젝트 선택</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>

        {/* 캐릭터 선택 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">캐릭터</label>
          <select
            value={characterId}
            onChange={(e) => setCharacterId(e.target.value)}
            disabled={!projectId}
            className="w-full text-[15px] outline-none border-b border-[#E0E0E0] pb-2 bg-transparent disabled:opacity-40"
          >
            <option value="">캐릭터 선택</option>
            {characters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* 촬영 예상 기간 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">촬영 예상 기간</label>
          <div className="flex items-center border-b border-[#E0E0E0] pb-2 gap-2">
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="YYYY.MM.DD ~ YYYY.MM.DD"
              className="flex-1 text-[15px] outline-none placeholder:text-[#D9D9D9]"
            />
            <Calendar size={16} className="text-[#888888]" />
          </div>
        </div>

        {/* 촬영 지역 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">촬영 지역</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="주요 촬영 지역"
            className="w-full text-[15px] outline-none border-b border-[#E0E0E0] pb-2 placeholder:text-[#D9D9D9]"
          />
        </div>

        {/* 출연 조건 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">출연 조건</label>
          <input
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            placeholder="출연료, 계약 조건 등"
            className="w-full text-[15px] outline-none border-b border-[#E0E0E0] pb-2 placeholder:text-[#D9D9D9]"
          />
        </div>

        {/* 배우에게 전하고 싶은 말 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">배우에게 전하고 싶은 말</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="캐릭터와 배우가 잘 어울리는 이유, 제안 배경 등을 자유롭게 작성해 주세요."
            rows={4}
            className="w-full text-[15px] outline-none border-b border-[#E0E0E0] pb-2 resize-none placeholder:text-[#D9D9D9]"
          />
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 py-4 bg-white border-t border-[#F0F0F0]">
        <button
          disabled={!isReady || loading}
          onClick={handleSubmit}
          className={cn(
            'w-full h-[52px] rounded-full text-[15px] font-semibold transition-colors',
            isReady && !loading ? 'bg-[#1A1A2E] text-white' : 'bg-[#D9D9D9] text-[#999999]',
          )}
        >
          {loading ? '전송 중...' : '제안 보내기'}
        </button>
      </div>
    </div>
  );
}
