"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Pencil, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import DrumrollPicker from '@/components/shared/DrumrollPicker';
import ImageCropper from '@/components/shared/ImageCropper';
import { AGE_RANGE_OPTIONS } from '@/constants';

const AGE_MAP: Record<string, string> = {
  '10대': 'TEENS', '20대': 'TWENTIES', '30대': 'THIRTIES',
  '40대': 'FORTIES', '50대': 'FIFTIES',
};

export default function ActorProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isReady = name.trim() && bio.trim() && ageRange;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setCropSrc(URL.createObjectURL(file));
  };

  const handleCropConfirm = (blob: Blob) => {
    setPhotoFile(new File([blob], 'profile.jpg', { type: 'image/jpeg' }));
    setPhoto(URL.createObjectURL(blob));
    setCropSrc(null);
  };

  const handleNext = async () => {
    if (!isReady) return;
    setLoading(true);

    let imageUrl: string | null = null;
    if (photoFile) {
      const form = new FormData();
      form.append('file', photoFile);
      form.append('bucket', 'profiles');
      const up = await fetch('/api/upload/image', { method: 'POST', body: form });
      if (up.ok) imageUrl = (await up.json()).url;
    }

    await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        bio,
        ageRange: AGE_MAP[ageRange],
        ...(imageUrl && { image: imageUrl }),
      }),
    });
    setLoading(false);
    router.push('/signup/complete');
  };

  if (cropSrc) {
    return (
      <ImageCropper
        imageSrc={cropSrc}
        aspect={3 / 4}
        onConfirm={handleCropConfirm}
        onCancel={() => setCropSrc(null)}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen px-6 pt-4 pb-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="text-xl text-[#1A1A1A]">←</button>
        <span className="text-[16px] font-semibold text-[#1A1A1A]">회원가입</span>
      </div>

      {/* 프로필 사진 */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div
            onClick={() => fileRef.current?.click()}
            className="w-[90px] h-[90px] rounded-full bg-[#D9D9D9] flex items-center justify-center overflow-hidden cursor-pointer"
          >
            {photo ? (
              <img src={photo} alt="프로필" className="w-full h-full object-cover" />
            ) : (
              <Camera size={28} className="text-[#888888]" />
            )}
          </div>
          <div
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-6 h-6 bg-[#1A1A2E] rounded-full flex items-center justify-center cursor-pointer"
          >
            <Pencil size={12} color="white" />
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelect}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 flex-1">
        {/* 이름 */}
        <div>
          <label className="text-[13px] text-[#1A1A1A] font-medium mb-1 block">이름</label>
          <div className="flex items-center border-b border-[#E0E0E0] pb-2 gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="활동명 입력"
              className="flex-1 text-[15px] outline-none text-[#1A1A1A] placeholder:text-[#D9D9D9] bg-transparent"
            />
            {name && (
              <button onClick={() => setName('')}>
                <X size={16} className="text-[#888888]" />
              </button>
            )}
          </div>
        </div>

        {/* 한 줄 소개 */}
        <div>
          <label className="text-[13px] text-[#1A1A1A] font-medium mb-1 block">한 줄 소개</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="캐릭터를 잘 나타내는 한 줄 소개를 작성해 보세요"
            rows={2}
            className="w-full text-[15px] outline-none text-[#1A1A1A] placeholder:text-[#D9D9D9] bg-transparent border-b border-[#E0E0E0] pb-2 resize-none"
          />
        </div>

        {/* 나이대 */}
        <div>
          <label className="text-[13px] text-[#1A1A1A] font-medium mb-1 block">나이대</label>
          <button
            onClick={() => setPickerOpen(true)}
            className="w-full flex items-center justify-between border-b border-[#E0E0E0] pb-2"
          >
            <span className={cn('text-[15px]', ageRange ? 'text-[#1A1A1A]' : 'text-[#D9D9D9]')}>
              {ageRange || '나이대 선택'}
            </span>
            <span className="text-[#888888]">∨</span>
          </button>
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
        title="나이대를 선택해 주세요"
        options={[...AGE_RANGE_OPTIONS].reverse()}
        value={ageRange}
        onChange={setAgeRange}
      />
    </div>
  );
}
