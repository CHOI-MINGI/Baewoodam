"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import DrumrollPicker from '@/components/shared/DrumrollPicker';
import { GENRE_OPTIONS, PLATFORM_OPTIONS } from '@/constants';

const MEDIA_OPTIONS = ['드라마', '영화', 'OTT', '웹드라마', '광고', '기타'];
const MEDIA_MAP: Record<string, string> = {
  '드라마': 'DRAMA', '영화': 'FILM', 'OTT': 'OTT',
  '웹드라마': 'WEB_DRAMA', '광고': 'AD', '기타': 'OTHER',
};

export default function ProjectNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [platform, setPlatform] = useState('');
  const [logline, setLogline] = useState('');
  const [synopsis, setSynopsis] = useState('');

  const [genreOpen, setGenreOpen] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isReady = title.trim() && genre && platform;

  const handleNext = async () => {
    if (!isReady) return;
    setLoading(true);
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        mediaType: MEDIA_MAP[genre] ?? 'OTHER',
        genre,
        platform,
        logline,
        synopsis,
      }),
    });
    if (res.ok) {
      const project = await res.json();
      router.push(`/projects/${project.id}/characters`);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen px-5 pb-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 py-3 mb-4">
        <button onClick={() => router.back()} className="text-xl text-[#1A1A1A]">←</button>
        <h1 className="text-[16px] font-semibold text-[#1A1A1A]">새 프로젝트 만들기</h1>
      </div>

      <div className="flex flex-col gap-5 flex-1">
        {/* 작품 제목 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">작품 제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="작품 제목 입력"
            className="w-full text-[15px] outline-none border-b border-[#E0E0E0] pb-2 placeholder:text-[#D9D9D9]"
          />
        </div>

        {/* 장르 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">장르</label>
          <button onClick={() => setGenreOpen(true)} className="w-full flex justify-between border-b border-[#E0E0E0] pb-2">
            <span className={cn('text-[15px]', genre ? 'text-[#1A1A1A]' : 'text-[#D9D9D9]')}>{genre || '장르 선택'}</span>
            <span className="text-[#888888]">∨</span>
          </button>
        </div>

        {/* 플랫폼 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">플랫폼</label>
          <button onClick={() => setPlatformOpen(true)} className="w-full flex justify-between border-b border-[#E0E0E0] pb-2">
            <span className={cn('text-[15px]', platform ? 'text-[#1A1A1A]' : 'text-[#D9D9D9]')}>{platform || '플랫폼 선택'}</span>
            <span className="text-[#888888]">∨</span>
          </button>
        </div>

        {/* 로그라인 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">로그라인</label>
          <input
            value={logline}
            onChange={(e) => setLogline(e.target.value)}
            placeholder="한 줄 설명"
            className="w-full text-[15px] outline-none border-b border-[#E0E0E0] pb-2 placeholder:text-[#D9D9D9]"
          />
        </div>

        {/* 시놉시스 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">시놉시스</label>
          <textarea
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            placeholder="전체 줄거리나 기획 의도를 자유롭게 적어주세요"
            rows={5}
            className="w-full text-[15px] outline-none border-b border-[#E0E0E0] pb-2 resize-none placeholder:text-[#D9D9D9]"
          />
        </div>
      </div>

      <div className="pt-8">
        <button
          disabled={!isReady || loading}
          onClick={handleNext}
          className={cn(
            'w-full h-[52px] rounded-full text-[15px] font-semibold transition-colors',
            isReady && !loading ? 'bg-[#1A1A2E] text-white' : 'bg-[#D9D9D9] text-[#999999]',
          )}
        >
          {loading ? '저장 중...' : '다음'}
        </button>
      </div>

      <DrumrollPicker open={genreOpen} onClose={() => setGenreOpen(false)} title="장르 선택" options={[...GENRE_OPTIONS]} value={genre} onChange={setGenre} />
      <DrumrollPicker open={platformOpen} onClose={() => setPlatformOpen(false)} title="플랫폼 선택" options={[...PLATFORM_OPTIONS]} value={platform} onChange={setPlatform} />
    </div>
  );
}
