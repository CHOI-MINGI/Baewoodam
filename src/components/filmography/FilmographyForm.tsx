"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ExternalLink } from 'lucide-react';
import DrumrollPicker from '@/components/shared/DrumrollPicker';
import { cn } from '@/lib/utils';
import { MEDIA_TYPE_OPTIONS, ROLE_OPTIONS, YEAR_OPTIONS } from '@/constants';

interface FilmographyFormProps {
  initialValues?: {
    id?: string;
    title?: string;
    year?: number;
    mediaType?: string;
    role?: string;
    characterName?: string;
    description?: string;
    youtubeUrl?: string | null;
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
  const [characterName, setCharacterName] = useState(initialValues?.characterName ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [youtubeUrl, setYoutubeUrl] = useState(initialValues?.youtubeUrl ?? '');

  const [yearOpen, setYearOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isReady = title.trim() && year && mediaType && role;

  const handleSave = async () => {
    if (!isReady) return;
    setLoading(true);
    const body = {
      title,
      year: Number(year),
      mediaType: MEDIA_LABEL_MAP[mediaType],
      role: ROLE_LABEL_MAP[role],
      characterName: characterName || null,
      description: description || null,
      youtubeUrl: youtubeUrl || null,
    };

    const url = isEdit ? `/api/filmography/${initialValues!.id}` : '/api/filmography';
    await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
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

  const DropdownRow = ({
    label, value, placeholder, onOpen,
  }: { label: string; value: string; placeholder: string; onOpen: () => void }) => (
    <div>
      <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">{label}</label>
      <button
        onClick={onOpen}
        className="w-full flex items-center justify-between border-b border-[#E0E0E0] pb-2"
      >
        <span className={cn('text-[15px]', value ? 'text-[#1A1A1A]' : 'text-[#D9D9D9]')}>
          {value || placeholder}
        </span>
        <span className="text-[#888888] text-[12px]">∨</span>
      </button>
    </div>
  );

  const TextRow = ({
    label, value, onChange, placeholder,
  }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) => (
    <div>
      <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">{label}</label>
      <div className="flex items-center border-b border-[#E0E0E0] pb-2 gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 text-[15px] outline-none text-[#1A1A1A] placeholder:text-[#D9D9D9] bg-transparent"
        />
        {value && (
          <button type="button" onClick={() => onChange('')}>
            <X size={16} className="text-[#888888]" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen px-5 pb-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 py-3 mb-4">
        <button onClick={() => router.back()} className="text-xl text-[#1A1A1A]">←</button>
        <h1 className="text-[16px] font-semibold text-[#1A1A1A]">작품 편집</h1>
      </div>

      <div className="flex flex-col gap-5 flex-1">
        <TextRow label="작품명" value={title} onChange={setTitle} placeholder="작품명 입력" />
        <DropdownRow label="미디어 타입" value={mediaType} placeholder="미디어 타입 선택" onOpen={() => setMediaOpen(true)} />
        <DropdownRow label="연도" value={year} placeholder="연도 선택" onOpen={() => setYearOpen(true)} />
        <DropdownRow label="역할" value={role} placeholder="역할 선택" onOpen={() => setRoleOpen(true)} />
        <TextRow label="배역명" value={characterName} onChange={setCharacterName} placeholder="강민준" />
        <TextRow label="한 줄 설명" value={description} onChange={setDescription} placeholder="작품에 대한 한 줄 설명" />
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
          {isEdit && youtubeUrl && (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2 text-[13px] text-[#E53935]"
            >
              <ExternalLink size={13} />
              유튜브에서 보기
            </a>
          )}
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

      <DrumrollPicker open={mediaOpen} onClose={() => setMediaOpen(false)} title="미디어 타입" options={[...MEDIA_TYPE_OPTIONS]} value={mediaType} onChange={setMediaType} />
      <DrumrollPicker open={yearOpen} onClose={() => setYearOpen(false)} title="연도 선택" options={YEAR_OPTIONS} value={year} onChange={setYear} />
      <DrumrollPicker open={roleOpen} onClose={() => setRoleOpen(false)} title="역할 선택" options={[...ROLE_OPTIONS]} value={role} onChange={setRole} />
    </div>
  );
}
