"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pencil, X, ChevronLeft, UserPlus, Plus } from 'lucide-react';
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
    if (!confirm('이 캐릭터를 삭제할까요?')) return;
    await fetch(`/api/projects/${projectId}/characters/${charId}`, { method: 'DELETE' });
    setCharacters((prev) => prev.filter((c) => c.id !== charId));
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-8 pt-8 pb-4">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
          <ChevronLeft size={20} className="text-[#1A1A1A]" />
        </button>
        <h1 className="text-[22px] font-bold text-[#1A1A1A]">캐릭터 관리</h1>
      </div>

      <div className="max-w-[900px] mx-auto px-8 pb-12">
        <p className="text-[16px] text-[#888888] mb-6">
          시놉시스에 등장하는 주요 인물들을 등록하고, 각 캐릭터에 맞는 배우를 찾아보세요.
        </p>

        {/* 캐릭터 목록 */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : characters.length === 0 ? (
          <div className="bg-white rounded-2xl flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <UserPlus size={24} className="text-[#BBBBBB]" />
            </div>
            <p className="text-[14px] text-[#888888] text-center">
              등록한 인물이 없어요<br />주요 인물을 추가해 주세요
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {characters.map((char) => (
              <div key={char.id} className="bg-white rounded-2xl p-6 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[17px] font-bold text-[#1A1A1A]">{char.name}</p>
                    <span className="text-[12px] text-[#888888]">
                      {char.ageRange ? (AGE_RANGE_MAP as any)[char.ageRange] : ''}
                      {char.gender ? ` · ${(GENDER_MAP as any)[char.gender]}` : ''}
                    </span>
                  </div>
                  {char.description && (
                    <p className="text-[14px] text-[#888888]">{char.description}</p>
                  )}
                  {char.keywords?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {char.keywords.map((k) => (
                        <span key={k} className="text-[11px] px-2 py-0.5 rounded-full bg-[#F5F5F5] text-[#888888]">{k}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* 배우 찾기 버튼 (핵심!) */}
                  <Link
                    href={`/casting/send?projectId=${projectId}&characterId=${char.id}`}
                    className="px-4 py-2 rounded-full bg-[#E53935] text-white text-[13px] font-semibold hover:bg-[#C62828] transition-colors"
                  >
                    배우 찾기
                  </Link>
                  <Link
                    href={`/projects/${projectId}/characters/${char.id}/edit`}
                    className="w-9 h-9 rounded-full bg-[#F5F5F5] flex items-center justify-center"
                  >
                    <Pencil size={15} className="text-[#888888]" />
                  </Link>
                  <button
                    onClick={() => handleDelete(char.id)}
                    className="w-9 h-9 rounded-full bg-[#F5F5F5] flex items-center justify-center"
                  >
                    <X size={15} className="text-[#888888]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 인물 추가 버튼 */}
        <Link
          href={`/projects/${projectId}/characters/new`}
          className="mt-4 w-full h-[52px] rounded-2xl border-2 border-dashed border-[#D9D9D9] text-[#888888] text-[15px] font-semibold flex items-center justify-center gap-2 hover:border-[#1A1A2E] hover:text-[#1A1A2E] transition-colors"
        >
          <Plus size={18} />
          주요 인물 추가하기
        </Link>
      </div>
    </div>
  );
}
