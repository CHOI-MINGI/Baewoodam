"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PasswordResetPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSend = async () => {
    if (!isValid) return;
    setLoading(true);
    await fetch('/api/auth/password/reset-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="flex flex-col min-h-screen px-6 pt-4 pb-8">
      <button onClick={() => router.back()} className="text-xl text-[#1A1A1A] mb-10 self-start">←</button>

      <h1 className="text-[26px] font-bold text-[#1A1A1A] mb-3">비밀번호 재설정</h1>
      <p className="text-[14px] text-[#888888] leading-relaxed mb-10">
        가입하신 이메일 주소를 입력하면<br />재설정 링크를 보내드릴게요
      </p>

      {sent ? (
        <p className="text-[14px] text-[#1A1A1A] bg-[#F5F5F5] rounded-xl p-4">
          <strong>{email}</strong>으로 재설정 링크를 보냈습니다.<br />
          이메일을 확인해 주세요.
        </p>
      ) : (
        <>
          <div>
            <label className="text-[13px] text-[#1A1A1A] font-medium mb-1 block">이메일 주소</label>
            <div className="flex items-center border-b border-[#E0E0E0] pb-2 gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@email.com"
                className="flex-1 text-[15px] outline-none text-[#1A1A1A] placeholder:text-[#D9D9D9] bg-transparent"
              />
              {email && (
                <button onClick={() => setEmail('')} type="button">
                  <X size={16} className="text-[#888888]" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-auto pt-8">
            <button
              disabled={!isValid || loading}
              onClick={handleSend}
              className={cn(
                'w-full h-[52px] rounded-full text-[15px] font-semibold transition-colors',
                isValid && !loading
                  ? 'bg-[#1A1A2E] text-white'
                  : 'bg-[#D9D9D9] text-[#999999]',
              )}
            >
              {loading ? '전송 중...' : '재설정 링크 보내기'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
