"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import DrumrollPicker from '@/components/shared/DrumrollPicker';
import { POSITION_OPTIONS, GENRE_OPTIONS } from '@/constants';

export default function AgencySignupPage() {
  const router = useRouter();

  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const isReady = company.trim() && position && selectedGenres.length > 0;

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  };

  const handleNext = async () => {
    if (!isReady) return;
    setLoading(true);
    await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: company,
        position,
        preferredGenres: selectedGenres,
      }),
    });
    setLoading(false);
    router.push('/signup/complete');
  };

  return (
    <div className="flex flex-col min-h-screen px-6 pt-4 pb-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-10">
        <button onClick={() => router.back()} className="text-xl text-[#1A1A1A]">←</button>
        <span className="text-[16px] font-semibold text-[#1A1A1A]">회원가입</span>
      </div>

      <div className="flex flex-col gap-6 flex-1">
        {/* 소속 */}
        <div>
          <label className="text-[13px] text-[#1A1A1A] font-medium mb-1 block">소속</label>
          <div className="flex items-center border-b border-[#E0E0E0] pb-2 gap-2">
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="회사명 또는 프리랜서 입력"
              className="flex-1 text-[15px] outline-none text-[#1A1A1A] placeholder:text-[#D9D9D9] bg-transparent"
            />
            {company && (
              <button onClick={() => setCompany('')}>
                <X size={16} className="text-[#888888]" />
              </button>
            )}
          </div>
        </div>

        {/* 직무 */}
        <div>
          <label className="text-[13px] text-[#1A1A1A] font-medium mb-1 block">직무</label>
          <button
            onClick={() => setPickerOpen(true)}
            className="w-full flex items-center justify-between border-b border-[#E0E0E0] pb-2"
          >
            <span className={cn('text-[15px]', position ? 'text-[#1A1A1A]' : 'text-[#D9D9D9]')}>
              {position || '직무 선택'}
            </span>
            <span className="text-[#888888]">∨</span>
          </button>
        </div>

        {/* 선호 장르 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[13px] text-[#1A1A1A] font-medium">선호 장르</label>
            <span className="text-[12px] text-[#888888]">다중 선택 가능</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((genre) => {
              const active = selectedGenres.includes(genre);
              return (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={cn(
                    'px-4 py-2 rounded-full border text-[14px] transition-colors',
                    active
                      ? 'border-[#E53935] text-[#E53935]'
                      : 'border-[#E0E0E0] text-[#1A1A1A]',
                  )}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-8">
        <button
          disabled={!isReady || loading}
          onClick={handleNext}
          className={cn(
            'w-full h-[52px] rounded-full text-[15px] font-semibold transition-colors',
            isReady && !loading
              ? 'bg-[#1A1A2E] text-white'
              : 'bg-[#D9D9D9] text-[#999999]',
          )}
        >
          {loading ? '저장 중...' : '다음'}
        </button>
      </div>

      <DrumrollPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="직무를 선택해 주세요"
        options={[...POSITION_OPTIONS]}
        value={position}
        onChange={setPosition}
      />
    </div>
  );
}
