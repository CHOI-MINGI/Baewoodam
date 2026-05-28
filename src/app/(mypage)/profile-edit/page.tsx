"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Camera, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import DrumrollPicker from '@/components/shared/DrumrollPicker';
import { AGE_RANGE_OPTIONS, LOCATION_OPTIONS, POSITION_OPTIONS } from '@/constants';

const AGE_MAP: Record<string, string> = {
  '10대': 'TEENS', '20대': 'TWENTIES', '30대': 'THIRTIES', '40대': 'FORTIES', '50대': 'FIFTIES',
};

export default function ProfileEditPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [position, setPosition] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [contactableTime, setContactableTime] = useState('');
  const [contactMemo, setContactMemo] = useState('');

  const [locationOpen, setLocationOpen] = useState(false);
  const [positionOpen, setPositionOpen] = useState(false);
  const [ageOpen, setAgeOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/users/me')
      .then((r) => r.json())
      .then((u) => {
        if (!u) return;
        setName(u.name ?? '');
        setBio(u.bio ?? '');
        setLocation(u.location ?? '');
        setContactableTime(u.contactableTime ?? '');
        setContactMemo(u.contactMemo ?? '');
        if (u.image) setPhoto(u.image);
        if (u.actorProfile?.ageRange) {
          const rev: Record<string, string> = { TEENS: '10대', TWENTIES: '20대', THIRTIES: '30대', FORTIES: '40대', FIFTIES: '50대' };
          setAgeRange(rev[u.actorProfile.ageRange] ?? '');
        }
        if (u.agencyProfile?.position) setPosition(u.agencyProfile.position);
      });
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setLoading(true);
    await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        bio,
        location,
        contactableTime,
        contactMemo,
        ...(ageRange && { ageRange: AGE_MAP[ageRange] }),
        ...(position && { position }),
        ...(photo && { image: photo }),
      }),
    });
    setLoading(false);
    router.push('/mypage');
  };

  return (
    <div className="flex flex-col min-h-screen px-5 pb-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 py-3 mb-6">
        <button onClick={() => router.back()} className="text-xl text-[#1A1A1A]">←</button>
        <h1 className="text-[16px] font-semibold text-[#1A1A1A]">프로필 편집</h1>
      </div>

      {/* 프로필 사진 */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div
            onClick={() => fileRef.current?.click()}
            className="w-[80px] h-[80px] rounded-full overflow-hidden bg-[#D9D9D9] cursor-pointer"
          >
            {photo
              ? <Image src={photo} alt="프로필" width={80} height={80} className="object-cover w-full h-full" />
              : <div className="w-full h-full flex items-center justify-center"><Camera size={24} className="text-[#888888]" /></div>}
          </div>
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#1A1A2E] rounded-full flex items-center justify-center cursor-pointer">
            <Camera size={12} color="white" />
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        <Field label="이름" value={name} onChange={setName} placeholder="이름 입력" clearable />
        <TextareaField label="한 줄 소개" value={bio} onChange={setBio} placeholder="안녕하세요, 연기파 배우 차운우입니다." />

        {/* 활동 지역 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">활동 지역</label>
          <button onClick={() => setLocationOpen(true)} className="w-full flex justify-between border-b border-[#E0E0E0] pb-2">
            <span className={cn('text-[15px]', location ? 'text-[#1A1A1A]' : 'text-[#D9D9D9]')}>{location || '지역 선택'}</span>
            <span className="text-[#888888]">∨</span>
          </button>
        </div>

        {/* 소속 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">소속</label>
          <button onClick={() => setPositionOpen(true)} className="w-full flex justify-between border-b border-[#E0E0E0] pb-2">
            <span className={cn('text-[15px]', position ? 'text-[#1A1A1A]' : 'text-[#D9D9D9]')}>{position || '프리랜서'}</span>
            <span className="text-[#888888]">∨</span>
          </button>
        </div>

        {/* 나이대 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">나이대</label>
          <button onClick={() => setAgeOpen(true)} className="w-full flex justify-between border-b border-[#E0E0E0] pb-2">
            <span className={cn('text-[15px]', ageRange ? 'text-[#1A1A1A]' : 'text-[#D9D9D9]')}>{ageRange || '나이대 선택'}</span>
            <span className="text-[#888888]">∨</span>
          </button>
        </div>

        <Field label="연락 가능한 시간" value={contactableTime} onChange={setContactableTime} placeholder="평일 10:00 - 19:00" />
        <TextareaField label="메모 (캐스팅 디렉터에게)" value={contactMemo} onChange={setContactMemo} placeholder="캐스팅 디렉터에게 보내는 메모" />
      </div>

      <button
        disabled={loading}
        onClick={handleSave}
        className={cn(
          'w-full h-[52px] rounded-full text-[15px] font-semibold mt-8 transition-colors',
          !loading ? 'bg-[#1A1A2E] text-white' : 'bg-[#D9D9D9] text-[#999999]',
        )}
      >
        {loading ? '저장 중...' : '저장하기'}
      </button>

      <DrumrollPicker open={locationOpen} onClose={() => setLocationOpen(false)} title="활동 지역" options={[...LOCATION_OPTIONS]} value={location} onChange={setLocation} />
      <DrumrollPicker open={positionOpen} onClose={() => setPositionOpen(false)} title="소속" options={['프리랜서', ...POSITION_OPTIONS]} value={position} onChange={setPosition} />
      <DrumrollPicker open={ageOpen} onClose={() => setAgeOpen(false)} title="나이대" options={[...AGE_RANGE_OPTIONS].reverse()} value={ageRange} onChange={setAgeRange} />
    </div>
  );
}

function Field({ label, value, onChange, placeholder, clearable }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; clearable?: boolean;
}) {
  return (
    <div>
      <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">{label}</label>
      <div className="flex items-center border-b border-[#E0E0E0] pb-2 gap-2">
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="flex-1 text-[15px] outline-none placeholder:text-[#D9D9D9]" />
        {clearable && value && <button onClick={() => onChange('')}><X size={16} className="text-[#888888]" /></button>}
      </div>
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className="w-full text-[15px] outline-none border-b border-[#E0E0E0] pb-2 resize-none placeholder:text-[#D9D9D9] bg-transparent" />
    </div>
  );
}
