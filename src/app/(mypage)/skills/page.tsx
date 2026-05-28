"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SKILL_SUGGESTIONS } from '@/constants';

export default function SkillsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users/me')
      .then((r) => r.json())
      .then((user) => {
        const skills: string[] = user?.actorProfile?.skills ?? [];
        setSelected(skills);
        setInitialLoading(false);
      });
  }, []);

  const toggle = (skill: string) => {
    setSelected((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (!trimmed || selected.includes(trimmed)) { setCustom(''); return; }
    setSelected((prev) => [...prev, trimmed]);
    setCustom('');
  };

  const removeSkill = (skill: string) => setSelected((prev) => prev.filter((s) => s !== skill));

  const handleSave = async () => {
    setLoading(true);
    await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills: selected }),
    });
    setLoading(false);
    router.push('/mypage');
  };

  if (initialLoading) return <div className="min-h-screen animate-pulse bg-[#F5F5F5]" />;

  const customSkills = selected.filter((s) => !SKILL_SUGGESTIONS.includes(s as any));

  return (
    <div className="flex flex-col min-h-screen px-5 pb-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 py-3 mb-4">
        <button onClick={() => router.back()} className="text-xl text-[#1A1A1A]">←</button>
        <h1 className="text-[16px] font-semibold text-[#1A1A1A]">스킬 및 특기 수정</h1>
      </div>

      <div className="flex flex-col gap-6 flex-1">
        {/* 추천 스킬 */}
        <div>
          <p className="text-[13px] font-medium text-[#1A1A1A] mb-3">추천 스킬</p>
          <div className="flex flex-wrap gap-2">
            {SKILL_SUGGESTIONS.map((skill) => (
              <button
                key={skill}
                onClick={() => toggle(skill)}
                className={cn(
                  'px-3 py-1.5 rounded-full border text-[13px] transition-colors',
                  selected.includes(skill)
                    ? 'border-[#E53935] text-[#E53935] bg-[#FFF5F5]'
                    : 'border-[#E0E0E0] text-[#1A1A1A]',
                )}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* 직접 입력 */}
        <div>
          <p className="text-[13px] font-medium text-[#1A1A1A] mb-1">직접 입력</p>
          <div className="flex items-center border-b border-[#E0E0E0] pb-2 gap-2">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustom()}
              placeholder="스킬을 직접 입력 후 엔터"
              className="flex-1 text-[15px] outline-none text-[#1A1A1A] placeholder:text-[#D9D9D9] bg-transparent"
            />
            {custom && (
              <button
                type="button"
                onClick={addCustom}
                className="text-[13px] text-[#E53935] font-medium"
              >
                추가
              </button>
            )}
          </div>
        </div>

        {/* 커스텀 스킬 태그 */}
        {customSkills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customSkills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E53935] text-[#E53935] text-[13px] bg-[#FFF5F5]"
              >
                {skill}
                <button onClick={() => removeSkill(skill)}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* 선택된 스킬 요약 */}
        {selected.length > 0 && (
          <div>
            <p className="text-[12px] text-[#888888] mb-2">선택된 스킬 {selected.length}개</p>
            <div className="flex flex-wrap gap-2">
              {selected.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F5F5] text-[#1A1A1A] text-[13px]"
                >
                  {skill}
                  <button onClick={() => removeSkill(skill)}>
                    <X size={12} className="text-[#888888]" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-8">
        <button
          disabled={loading}
          onClick={handleSave}
          className={cn(
            'w-full h-[52px] rounded-full text-[15px] font-semibold transition-colors',
            !loading ? 'bg-[#1A1A2E] text-white' : 'bg-[#D9D9D9] text-[#999999]',
          )}
        >
          {loading ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  );
}
