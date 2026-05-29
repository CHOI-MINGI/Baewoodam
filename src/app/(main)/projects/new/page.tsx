"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GENRE_OPTIONS, PLATFORM_OPTIONS } from '@/constants';

const MEDIA_OPTIONS = ['드라마', '영화', 'OTT', '웹드라마', '광고', '기타'];
const MEDIA_MAP: Record<string, string> = {
  '드라마': 'DRAMA', '영화': 'FILM', 'OTT': 'OTT',
  '웹드라마': 'WEB_DRAMA', '광고': 'AD', '기타': 'OTHER',
};

export default function ProjectNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [genre, setGenre] = useState('');
  const [platform, setPlatform] = useState('');
  const [logline, setLogline] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [loading, setLoading] = useState(false);

  const isReady = title.trim() && mediaType && genre && platform;

  const handleNext = async () => {
    if (!isReady) return;
    setLoading(true);
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        mediaType: MEDIA_MAP[mediaType] ?? 'OTHER',
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
    <div className="bg-[#F5F5F5] min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-8 pt-8 pb-4">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
          <ChevronLeft size={20} className="text-[#1A1A1A]" />
        </button>
        <h1 className="text-[22px] font-bold text-[#1A1A1A]">새 프로젝트 만들기</h1>
      </div>

      <div className="max-w-[720px] mx-auto px-8 pb-12">
        <div className="bg-white rounded-2xl p-8 space-y-6">

          {/* 작품 제목 */}
          <div>
            <label className="text-[14px] font-semibold text-[#1A1A1A] mb-2 block">작품 제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="작품 제목을 입력하세요"
              className="w-full text-[15px] outline-none border border-[#E0E0E0] rounded-xl px-4 py-3 placeholder:text-[#BBBBBB] focus:border-[#1A1A2E] transition-colors"
            />
          </div>

          {/* 미디어 타입 + 장르 (2열) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[14px] font-semibold text-[#1A1A1A] mb-2 block">미디어 타입</label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className={cn(
                  'w-full text-[15px] outline-none border border-[#E0E0E0] rounded-xl px-4 py-3 bg-white focus:border-[#1A1A2E] transition-colors',
                  mediaType ? 'text-[#1A1A1A]' : 'text-[#BBBBBB]',
                )}
              >
                <option value="">선택</option>
                {MEDIA_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[14px] font-semibold text-[#1A1A1A] mb-2 block">장르</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className={cn(
                  'w-full text-[15px] outline-none border border-[#E0E0E0] rounded-xl px-4 py-3 bg-white focus:border-[#1A1A2E] transition-colors',
                  genre ? 'text-[#1A1A1A]' : 'text-[#BBBBBB]',
                )}
              >
                <option value="">선택</option>
                {GENRE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* 플랫폼 */}
          <div>
            <label className="text-[14px] font-semibold text-[#1A1A1A] mb-2 block">플랫폼</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className={cn(
                'w-full text-[15px] outline-none border border-[#E0E0E0] rounded-xl px-4 py-3 bg-white focus:border-[#1A1A2E] transition-colors',
                platform ? 'text-[#1A1A1A]' : 'text-[#BBBBBB]',
              )}
            >
              <option value="">선택</option>
              {PLATFORM_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* 로그라인 */}
          <div>
            <label className="text-[14px] font-semibold text-[#1A1A1A] mb-2 block">로그라인</label>
            <input
              value={logline}
              onChange={(e) => setLogline(e.target.value)}
              placeholder="작품을 한 줄로 설명해주세요"
              className="w-full text-[15px] outline-none border border-[#E0E0E0] rounded-xl px-4 py-3 placeholder:text-[#BBBBBB] focus:border-[#1A1A2E] transition-colors"
            />
          </div>

          {/* 시놉시스 */}
          <div>
            <label className="text-[14px] font-semibold text-[#1A1A1A] mb-2 block">시놉시스</label>
            <textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="전체 줄거리나 기획 의도를 자유롭게 적어주세요"
              rows={6}
              className="w-full text-[15px] outline-none border border-[#E0E0E0] rounded-xl px-4 py-3 resize-none placeholder:text-[#BBBBBB] focus:border-[#1A1A2E] transition-colors"
            />
          </div>

          {/* 다음 버튼 */}
          <button
            disabled={!isReady || loading}
            onClick={handleNext}
            className={cn(
              'w-full h-[52px] rounded-full text-[15px] font-semibold transition-colors',
              isReady && !loading ? 'bg-[#1A1A2E] text-white hover:bg-[#2A2A3E]' : 'bg-[#D9D9D9] text-[#999999]',
            )}
          >
            {loading ? '저장 중...' : '다음 (캐릭터 등록)'}
          </button>
        </div>
      </div>
    </div>
  );
}
