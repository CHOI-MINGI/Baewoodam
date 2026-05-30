"use client";

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import DrumrollPicker from '@/components/shared/DrumrollPicker';
import { MEDIA_TYPE_OPTIONS, ROLE_OPTIONS, YEAR_OPTIONS, GENRE_OPTIONS } from '@/constants';

const MEDIA_MAP: Record<string, string> = {
  '영화': 'FILM', '드라마': 'DRAMA', 'OTT': 'OTT', '웹드라마': 'WEB_DRAMA',
  '단편': 'SHORT_FILM', '광고': 'AD', '뮤직비디오': 'MUSIC_VIDEO',
};
const ROLE_MAP: Record<string, string> = {
  '주연': 'LEAD', '조연': 'SUPPORTING', '단역': 'EXTRA', '기타': 'OTHER',
};

const MEDIA_OPTIONS = ['영화', '드라마', 'OTT', '웹드라마', '단편', '광고', '뮤직비디오'];

export default function FilmographyNewPage() {
  const router = useRouter();
  const posterRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [role, setRole] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [description, setDescription] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const [mediaOpen, setMediaOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isReady = title.trim() && mediaType && year && role;

  const toggleGenre = (g: string) =>
    setGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);

  const handlePoster = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
  if (!isReady) return;
  setLoading(true);

  console.log('posterFile:', posterFile);

  let thumbnailUrl: string | null = null;
  if (posterFile) {
    console.log('uploading poster...');
    const form = new FormData();
    form.append('file', posterFile);
    form.append('bucket', 'filmography-thumbnails');
    const up = await fetch('/api/upload/image', { method: 'POST', body: form });
    console.log('upload result:', up.status);
    if (up.ok) thumbnailUrl = (await up.json()).url;
    console.log('thumbnailUrl:', thumbnailUrl);
  }

    await fetch('/api/filmography', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        mediaType: MEDIA_MAP[mediaType],
        year: Number(year),
        role: ROLE_MAP[role],
        characterName: characterName || null,
        description: description || null,
        genre: genres[0] ?? null,
        thumbnailUrl,
        youtubeUrl: youtubeUrl || null,
      }),
    });

    setLoading(false);
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
          <div className="flex items-center border-b border-[#E0E0E0] pb-2 gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="작품명 입력"
              className="flex-1 text-[15px] outline-none text-[#1A1A1A] placeholder:text-[#D9D9D9] bg-transparent"
            />
            {title && <button type="button" onClick={() => setTitle('')}><X size={16} className="text-[#888888]" /></button>}
          </div>
        </div>

        {/* 미디어 타입 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">미디어 타입</label>
          <button onClick={() => setMediaOpen(true)} className="w-full flex items-center justify-between border-b border-[#E0E0E0] pb-2">
            <span className={cn('text-[15px]', mediaType ? 'text-[#1A1A1A]' : 'text-[#D9D9D9]')}>{mediaType || '미디어 타입 선택'}</span>
            <span className="text-[#888888] text-[12px]">∨</span>
          </button>
        </div>

        {/* 연도 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">연도</label>
          <button onClick={() => setYearOpen(true)} className="w-full flex items-center justify-between border-b border-[#E0E0E0] pb-2">
            <span className="text-[15px] text-[#1A1A1A]">{year}</span>
            <span className="text-[#888888] text-[12px]">∨</span>
          </button>
        </div>

        {/* 역할 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">역할</label>
          <button onClick={() => setRoleOpen(true)} className="w-full flex items-center justify-between border-b border-[#E0E0E0] pb-2">
            <span className={cn('text-[15px]', role ? 'text-[#1A1A1A]' : 'text-[#D9D9D9]')}>{role || '역할 선택'}</span>
            <span className="text-[#888888] text-[12px]">∨</span>
          </button>
        </div>

        {/* 배역명 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">배역명</label>
          <div className="flex items-center border-b border-[#E0E0E0] pb-2 gap-2">
            <input
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="강민준"
              className="flex-1 text-[15px] outline-none text-[#1A1A1A] placeholder:text-[#D9D9D9] bg-transparent"
            />
            {characterName && <button type="button" onClick={() => setCharacterName('')}><X size={16} className="text-[#888888]" /></button>}
          </div>
        </div>

        {/* 한 줄 설명 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">한 줄 설명</label>
          <div className="flex items-center border-b border-[#E0E0E0] pb-2 gap-2">
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="작품에 대한 한 줄 설명"
              className="flex-1 text-[15px] outline-none text-[#1A1A1A] placeholder:text-[#D9D9D9] bg-transparent"
            />
            {description && <button type="button" onClick={() => setDescription('')}><X size={16} className="text-[#888888]" /></button>}
          </div>
        </div>

        {/* 장르 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-2 block">장르</label>
          <div className="flex flex-wrap gap-2">
            {['드라마', '로맨스', '코미디', '액션', '스릴러', 'SF', '판타지'].map((g) => (
              <button
                key={g}
                onClick={() => toggleGenre(g)}
                className={cn(
                  'px-3 py-1.5 rounded-full border text-[13px] transition-colors',
                  genres.includes(g) ? 'border-[#E53935] text-[#E53935]' : 'border-[#E0E0E0] text-[#1A1A1A]',
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* 유튜브 URL */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">유튜브 URL <span className="text-[#888888] font-normal">(선택)</span></label>
          <div className="flex items-center border-b border-[#E0E0E0] pb-2 gap-2">
            <input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 text-[15px] outline-none text-[#1A1A1A] placeholder:text-[#D9D9D9] bg-transparent"
            />
            {youtubeUrl && <button type="button" onClick={() => setYoutubeUrl('')}><X size={16} className="text-[#888888]" /></button>}
          </div>
        </div>

        {/* 포스터 업로드 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-2 block">포스터 이미지 <span className="text-[#888888] font-normal">(선택)</span></label>
          <button
            onClick={() => posterRef.current?.click()}
            className="relative w-full h-[120px] rounded-xl border-2 border-dashed border-[#D9D9D9] flex flex-col items-center justify-center gap-2 overflow-hidden"
          >
            {posterPreview ? (
              <Image src={posterPreview} alt="포스터" fill className="object-cover rounded-xl" />
            ) : (
              <>
                <ImagePlus size={24} className="text-[#BBBBBB]" />
                <span className="text-[13px] text-[#BBBBBB]">이미지 선택</span>
              </>
            )}
          </button>
          <input ref={posterRef} type="file" accept="image/*" className="hidden" onChange={handlePoster} />
        </div>
      </div>

      {/* 저장 버튼 */}
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

      <DrumrollPicker open={mediaOpen} onClose={() => setMediaOpen(false)} title="미디어 타입" options={MEDIA_OPTIONS} value={mediaType} onChange={setMediaType} />
      <DrumrollPicker open={yearOpen} onClose={() => setYearOpen(false)} title="연도 선택" options={YEAR_OPTIONS} value={year} onChange={setYear} />
      <DrumrollPicker open={roleOpen} onClose={() => setRoleOpen(false)} title="역할 선택" options={[...ROLE_OPTIONS]} value={role} onChange={setRole} />
    </div>
  );
}
