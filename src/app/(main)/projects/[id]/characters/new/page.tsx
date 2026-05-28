"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import DrumrollPicker from '@/components/shared/DrumrollPicker';
import { AGE_RANGE_OPTIONS, CHARACTER_KEYWORD_SUGGESTIONS } from '@/constants';

const AGE_MAP: Record<string, string> = {
  '10대': 'TEENS', '20대': 'TWENTIES', '30대': 'THIRTIES', '40대': 'FORTIES', '50대': 'FIFTIES',
};

export default function CharacterNewPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const router = useRouter();

  const [name, setName] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | ''>('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [ageOpen, setAgeOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isReady = name.trim();

  const toggleKeyword = (k: string) =>
    setKeywords((prev) => prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]);

  const handleSave = async () => {
    if (!isReady) return;
    setLoading(true);
    await fetch(`/api/projects/${projectId}/characters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        ageRange: ageRange ? AGE_MAP[ageRange] : null,
        gender: gender || null,
        description,
        keywords,
      }),
    });
    setLoading(false);
    router.push(`/projects/${projectId}/characters`);
  };

  return (
    <div className="flex flex-col min-h-screen px-5 pb-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 py-3 mb-4">
        <button onClick={() => router.back()} className="text-xl text-[#1A1A1A]">←</button>
        <h1 className="text-[16px] font-semibold text-[#1A1A1A]">캐릭터 추가</h1>
      </div>

      <div className="flex flex-col gap-5 flex-1">
        {/* 역할명 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">역할명</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예) 김철수"
            className="w-full text-[15px] outline-none border-b border-[#E0E0E0] pb-2 placeholder:text-[#D9D9D9]"
          />
        </div>

        {/* 나이대 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">나이대</label>
          <button onClick={() => setAgeOpen(true)} className="w-full flex justify-between border-b border-[#E0E0E0] pb-2">
            <span className={cn('text-[15px]', ageRange ? 'text-[#1A1A1A]' : 'text-[#D9D9D9]')}>{ageRange || '나이대 선택'}</span>
            <span className="text-[#888888]">∨</span>
          </button>
        </div>

        {/* 성별 토글 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-2 block">성별</label>
          <div className="flex gap-2">
            {(['MALE', 'FEMALE'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGender((prev) => prev === g ? '' : g)}
                className={cn(
                  'flex-1 h-[42px] rounded-full border text-[14px] font-medium transition-colors',
                  gender === g
                    ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]'
                    : 'border-[#E0E0E0] text-[#1A1A1A]',
                )}
              >
                {g === 'MALE' ? '남성' : '여성'}
              </button>
            ))}
          </div>
        </div>

        {/* 한 줄 설명 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">한 줄 설명</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="캐릭터 설명"
            className="w-full text-[15px] outline-none border-b border-[#E0E0E0] pb-2 placeholder:text-[#D9D9D9]"
          />
        </div>

        {/* 키워드 태그 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-2 block">키워드</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {CHARACTER_KEYWORD_SUGGESTIONS.map((k) => (
              <button
                key={k}
                onClick={() => toggleKeyword(k)}
                className={cn(
                  'px-3 py-1.5 rounded-full border text-[13px] transition-colors',
                  keywords.includes(k)
                    ? 'border-[#E53935] text-[#E53935]'
                    : 'border-[#E0E0E0] text-[#1A1A1A]',
                )}
              >
                {k}
              </button>
            ))}
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-[#E0E0E0] text-[13px] text-[#888888]">
              <Plus size={12} /> 추가하기
            </button>
          </div>
        </div>
      </div>

      <div className="pt-8">
        <button
          disabled={!isReady || loading}
          onClick={handleSave}
          className={cn(
            'w-full h-[52px] rounded-full text-[15px] font-semibold transition-colors',
            isReady && !loading ? 'bg-[#1A1A2E] text-white' : 'bg-[#D9D9D9] text-[#999999]',
          )}
        >
          {loading ? '저장 중...' : '저장하기'}
        </button>
      </div>

      <DrumrollPicker
        open={ageOpen}
        onClose={() => setAgeOpen(false)}
        title="나이대를 선택해 주세요"
        options={[...AGE_RANGE_OPTIONS].reverse()}
        value={ageRange}
        onChange={setAgeRange}
      />
    </div>
  );
}
