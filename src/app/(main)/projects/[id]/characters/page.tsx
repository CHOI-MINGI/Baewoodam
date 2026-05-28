"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pencil, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AGE_RANGE_MAP, GENDER_MAP } from '@/constants';
import type { CharacterItem } from '@/types';

export default function CharactersPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const router = useRouter();
  const [characters, setCharacters] = useState<CharacterItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch(`/api/projects/${projectId}/characters`)
      .then((r) => r.json())
      .then((d) => { setCharacters(d ?? []); setLoading(false); });
  };

  useEffect(() => { load(); }, [projectId]);

  const handleDelete = async (charId: string) => {
    if (!confirm('삭제하시겠어요?')) return;
    await fetch(`/api/projects/${projectId}/characters/${charId}`, { method: 'DELETE' });
    setCharacters((prev) => prev.filter((c) => c.id !== charId));
  };

  return (
    <div className="flex flex-col min-h-screen px-5 pb-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 py-3 mb-4">
        <button onClick={() => router.back()} className="text-xl text-[#1A1A1A]">←</button>
        <h1 className="text-[16px] font-semibold text-[#1A1A1A]">새 프로젝트 만들기</h1>
      </div>

      <p className="text-[20px] font-bold text-[#1A1A1A] leading-snug mb-6">
        시놉시스에 등장하는<br />주요 인물들을 등록해 주세요.
      </p>

      {/* 캐릭터 목록 */}
      <div className="flex flex-col gap-3 flex-1">
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-20 bg-[#F5F5F5] rounded-xl" />)}
          </div>
        ) : characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <X size={22} className="text-[#BBBBBB]" />
            </div>
            <p className="text-[14px] text-[#888888] text-center">
              등록한 인물이 없어요<br />주요 인물을 추가해 주세요
            </p>
          </div>
        ) : (
          characters.map((char) => (
            <div key={char.id} className="flex items-center gap-3 bg-[#F5F5F5] rounded-xl p-4">
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-[#1A1A1A]">{char.name}</p>
                <p className="text-[12px] text-[#888888] mt-0.5">
                  {char.ageRange ? (AGE_RANGE_MAP as any)[char.ageRange] : ''}{' '}
                  {char.gender ? `· ${(GENDER_MAP as any)[char.gender]}` : ''}
                </p>
                {char.description && (
                  <p className="text-[13px] text-[#888888] mt-1">{char.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Link href={`/projects/${projectId}/characters/${char.id}/edit`}>
                  <Pencil size={16} className="text-[#888888]" />
                </Link>
                <button onClick={() => handleDelete(char.id)}>
                  <X size={16} className="text-[#888888]" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="flex flex-col gap-3 pt-6">
        <Link
          href={`/projects/${projectId}/characters/new`}
          className="w-full h-[52px] rounded-full border border-[#1A1A2E] text-[#1A1A2E] text-[15px] font-semibold flex items-center justify-center"
        >
          주요 인물 추가하기
        </Link>
        <button
          disabled={characters.length === 0}
          onClick={() => router.push('/home')}
          className={cn(
            'w-full h-[52px] rounded-full text-[15px] font-semibold transition-colors',
            characters.length > 0 ? 'bg-[#1A1A2E] text-white' : 'bg-[#D9D9D9] text-[#999999]',
          )}
        >
          배우 추천 받기
        </button>
      </div>
    </div>
  );
}
