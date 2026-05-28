"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DrumrollPicker from '@/components/shared/DrumrollPicker';
import { cn } from '@/lib/utils';
import { GENRE_OPTIONS, MEDIA_TYPE_OPTIONS, ROLE_OPTIONS, YEAR_OPTIONS } from '@/constants';

interface FilmographyFormProps {
  initialValues?: {
    id?: string;
    title?: string;
    year?: number;
    mediaType?: string;
    role?: string;
    characterName?: string;
    genre?: string;
    description?: string;
  };
}

const MEDIA_LABEL_MAP: Record<string, string> = {
  '드라마': 'DRAMA', '영화': 'FILM', 'OTT': 'OTT', '웹드라마': 'WEB_DRAMA',
  '단편': 'SHORT_FILM', '광고': 'AD', '뮤직비디오': 'MUSIC_VIDEO', '기타': 'OTHER',
};
const ROLE_LABEL_MAP: Record<string, string> = {
  '주연': 'LEAD', '조연': 'SUPPORTING', '단역': 'EXTRA', '기타': 'OTHER',
};
const MEDIA_REV_MAP = Object.fromEntries(Object.entries(MEDIA_LABEL_MAP).map(([k, v]) => [v, k]));
const ROLE_REV_MAP = Object.fromEntries(Object.entries(ROLE_LABEL_MAP).map(([k, v]) => [v, k]));

export default function FilmographyForm({ initialValues }: FilmographyFormProps) {
  const router = useRouter();
  const isEdit = !!initialValues?.id;

  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [year, setYear] = useState(String(initialValues?.year ?? new Date().getFullYear()));
  const [mediaType, setMediaType] = useState(
    initialValues?.mediaType ? (MEDIA_REV_MAP[initialValues.mediaType] ?? '') : '',
  );
  const [role, setRole] = useState(
    initialValues?.role ? (ROLE_REV_MAP[initialValues.role] ?? '') : '',
  );
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    initialValues?.genre ? [initialValues.genre] : [],
  );

  const [yearOpen, setYearOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isReady = title.trim() && year && mediaType && role;

  const toggleGenre = (g: string) =>
    setSelectedGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);

  const handleSave = async () => {
    if (!isReady) return;
    setLoading(true);
    const body = {
      title,
      year: Number(year),
      mediaType: MEDIA_LABEL_MAP[mediaType],
      role: ROLE_LABEL_MAP[role],
      description,
      genre: selectedGenres[0] ?? null,
    };

    const url = isEdit ? `/api/filmography/${initialValues.id}` : '/api/filmography';
    const method = isEdit ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setLoading(false);
    router.push('/filmography');
  };

  const handleDelete = async () => {
    if (!initialValues?.id || !confirm('삭제하시겠어요?')) return;
    await fetch(`/api/filmography/${initialValues.id}`, { method: 'DELETE' });
    router.push('/filmography');
  };

  return (
    <div className="flex flex-col min-h-screen px-5 pb-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 py-3 mb-4">
        <button onClick={() => router.back()} className="text-xl text-[#1A1A1A]">←</button>
        <h1 className="text-[16px] font-semibold text-[#1A1A1A]">작품 편집</h1>
      </div>

      <div className="flex flex-col gap-5 flex-1">
        {/* 작품명 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">작품명</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="작품명 입력"
            className="w-full text-[15px] outline-none border-b border-[#E0E0E0] pb-2 placeholder:text-[#D9D9D9]"
          />
        </div>

        {/* 연도 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">연도</label>
          <button onClick={() => setYearOpen(true)} className="w-full flex justify-between border-b border-[#E0E0E0] pb-2">
            <span className={cn('text-[15px]', year ? 'text-[#1A1A1A]' : 'text-[#D9D9D9]')}>{year || '연도 선택'}</span>
            <span className="text-[#888888]">∨</span>
          </button>
        </div>

        {/* 역할 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">역할</label>
          <button onClick={() => setRoleOpen(true)} className="w-full flex justify-between border-b border-[#E0E0E0] pb-2">
            <span className={cn('text-[15px]', role ? 'text-[#1A1A1A]' : 'text-[#D9D9D9]')}>{role || '역할 선택'}</span>
            <span className="text-[#888888]">∨</span>
          </button>
        </div>

        {/* 한 줄 설명 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">한 줄 설명</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="작품에 대한 한 줄 설명"
            className="w-full text-[15px] outline-none border-b border-[#E0E0E0] pb-2 placeholder:text-[#D9D9D9]"
          />
        </div>

        {/* 장르 태그 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-2 block">장르</label>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((g) => (
              <button
                key={g}
                onClick={() => toggleGenre(g)}
                className={cn(
                  'px-3 py-1.5 rounded-full border text-[13px] transition-colors',
                  selectedGenres.includes(g)
                    ? 'border-[#E53935] text-[#E53935]'
                    : 'border-[#E0E0E0] text-[#1A1A1A]',
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex gap-3 pt-8">
        {isEdit && (
          <button
            onClick={handleDelete}
            className="flex-1 h-[52px] rounded-full border border-[#E0E0E0] text-[#888888] text-[15px] font-semibold"
          >
            삭제하기
          </button>
        )}
        <button
          disabled={!isReady || loading}
          onClick={handleSave}
          className={cn(
            'flex-1 h-[52px] rounded-full text-[15px] font-semibold transition-colors',
            isReady && !loading ? 'bg-[#1A1A2E] text-white' : 'bg-[#D9D9D9] text-[#999999]',
          )}
        >
          {loading ? '저장 중...' : '저장하기'}
        </button>
      </div>

      <DrumrollPicker open={yearOpen} onClose={() => setYearOpen(false)} title="연도 선택" options={YEAR_OPTIONS} value={year} onChange={setYear} />
      <DrumrollPicker open={mediaOpen} onClose={() => setMediaOpen(false)} title="미디어 유형" options={[...MEDIA_TYPE_OPTIONS]} value={mediaType} onChange={setMediaType} />
      <DrumrollPicker open={roleOpen} onClose={() => setRoleOpen(false)} title="역할 선택" options={[...ROLE_OPTIONS]} value={role} onChange={setRole} />
    </div>
  );
}
