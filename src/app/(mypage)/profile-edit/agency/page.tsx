"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import DrumrollPicker from '@/components/shared/DrumrollPicker';
import { POSITION_OPTIONS } from '@/constants';

export default function AgencyProfileEditPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/users/me')
      .then((r) => r.json())
      .then((u) => {
        if (!u) return;
        setName(u.name ?? '');
        setCompany(u.agencyProfile?.companyName ?? '');
        setPosition(u.agencyProfile?.position ?? '');
      });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, companyName: company, position }),
    });
    setLoading(false);
    router.back();
  };

  return (
    <div className="flex flex-col min-h-screen px-5 pb-8">
      <div className="flex items-center gap-3 py-3 mb-6">
        <button onClick={() => router.back()} className="text-xl text-[#1A1A1A]">←</button>
        <h1 className="text-[16px] font-semibold text-[#1A1A1A]">프로필 편집</h1>
      </div>

      <div className="flex flex-col gap-5 flex-1">
        {/* 이름 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">이름</label>
          <div className="flex items-center border-b border-[#E0E0E0] pb-2 gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름 입력"
              className="flex-1 text-[15px] outline-none text-[#1A1A1A] placeholder:text-[#D9D9D9] bg-transparent"
            />
            {name && <button onClick={() => setName('')}><X size={16} className="text-[#888888]" /></button>}
          </div>
        </div>

        {/* 소속 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">소속</label>
          <div className="flex items-center border-b border-[#E0E0E0] pb-2 gap-2">
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="회사명 또는 프리랜서 입력"
              className="flex-1 text-[15px] outline-none text-[#1A1A1A] placeholder:text-[#D9D9D9] bg-transparent"
            />
            {company && <button onClick={() => setCompany('')}><X size={16} className="text-[#888888]" /></button>}
          </div>
        </div>

        {/* 직무 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">직무</label>
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
