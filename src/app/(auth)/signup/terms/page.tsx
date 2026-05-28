"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TermsState {
  service: boolean;
  privacy: boolean;
  marketing: boolean;
}

export default function TermsPage() {
  const router = useRouter();
  const [terms, setTerms] = useState<TermsState>({
    service: false,
    privacy: false,
    marketing: false,
  });

  const allRequired = terms.service && terms.privacy;
  const allChecked = allRequired && terms.marketing;

  const toggleAll = () => {
    const next = !allChecked;
    setTerms({ service: next, privacy: next, marketing: next });
  };

  const toggle = (key: keyof TermsState) => {
    setTerms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col h-full min-h-screen px-6 pt-16 pb-8">
      <h1 className="text-[22px] font-bold text-[#1A1A1A] leading-snug mb-10">
        서비스 이용을 위해<br />약관에 동의 해주세요.
      </h1>

      {/* 전체 동의 */}
      <button
        onClick={toggleAll}
        className="flex items-center gap-3 py-4 border-b border-[#E0E0E0]"
      >
        <span
          className={cn(
            'w-5 h-5 rounded-full flex items-center justify-center border',
            allChecked
              ? 'bg-[#E53935] border-[#E53935]'
              : 'border-[#D9D9D9]',
          )}
        >
          {allChecked && <Check size={12} color="white" strokeWidth={3} />}
        </span>
        <span className="text-[15px] font-semibold text-[#1A1A1A]">약관 전체 동의</span>
      </button>

      <div className="flex flex-col mt-4 gap-4">
        <TermRow
          checked={terms.service}
          onToggle={() => toggle('service')}
          label="서비스 이용약관 동의"
          required
        />
        <TermRow
          checked={terms.privacy}
          onToggle={() => toggle('privacy')}
          label="개인정보 처리방침 동의"
          required
        />
        <TermRow
          checked={terms.marketing}
          onToggle={() => toggle('marketing')}
          label="마케팅 정보 수신 동의"
          required={false}
        />
      </div>

      <div className="mt-auto pt-8">
        <button
          disabled={!allRequired}
          onClick={() => {
            const role = new URLSearchParams(window.location.search).get('role') ?? 'ACTOR';
            router.push(`/signup/basic?role=${role}`);
          }}
          className={cn(
            'w-full h-[52px] rounded-full text-[15px] font-semibold transition-colors',
            allRequired
              ? 'bg-[#1A1A2E] text-white'
              : 'bg-[#D9D9D9] text-[#999999]',
          )}
        >
          전체 동의하고 다음
        </button>
      </div>
    </div>
  );
}

function TermRow({
  checked,
  onToggle,
  label,
  required,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  required: boolean;
}) {
  return (
    <button onClick={onToggle} className="flex items-center justify-between w-full py-1">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'w-5 h-5 rounded-full flex items-center justify-center border flex-shrink-0',
            checked
              ? 'bg-[#E53935] border-[#E53935]'
              : 'border-[#D9D9D9]',
          )}
        >
          {checked && <Check size={12} color="white" strokeWidth={3} />}
        </span>
        <span className="text-[14px] text-[#1A1A1A] text-left">
          <span className="text-[#888888] mr-1">[{required ? '필수' : '선택'}]</span>
          {label}
        </span>
      </div>
      <span className="text-[#888888] text-lg ml-2">›</span>
    </button>
  );
}
