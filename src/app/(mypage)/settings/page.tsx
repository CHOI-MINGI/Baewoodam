"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { Switch } from '@/components/ui/switch';
import { ChevronRight } from 'lucide-react';

interface UserInfo {
  name: string | null;
  email: string;
  image: string | null;
}

interface NotifSettings {
  casting: boolean;
  reaction: boolean;
  notice: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [notif, setNotif] = useState<NotifSettings>({ casting: true, reaction: false, notice: true });

  useEffect(() => {
    fetch('/api/users/me').then((r) => r.json()).then(setUser);
  }, []);

  const toggleNotif = async (key: keyof NotifSettings) => {
    const next = { ...notif, [key]: !notif[key] };
    setNotif(next);
    await fetch('/api/users/me/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    });
  };

  const handleLogout = async () => {
    if (!confirm('로그아웃 하시겠어요?')) return;
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#F0F0F0]">
        <button onClick={() => router.back()} className="text-xl">←</button>
        <h1 className="text-[16px] font-semibold text-[#1A1A1A]">설정</h1>
      </div>

      {/* 프로필 영역 */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#F0F0F0]">
        <div className="w-[50px] h-[50px] rounded-full overflow-hidden bg-[#D9D9D9] flex-shrink-0">
          {user?.image && <Image src={user.image} alt={user.name ?? ''} width={50} height={50} className="object-cover w-full h-full" />}
        </div>
        <div>
          <p className="text-[15px] font-bold text-[#1A1A1A]">{user?.name ?? '이름 없음'}</p>
          <p className="text-[13px] text-[#888888]">{user?.email}</p>
        </div>
      </div>

      {/* 알림 설정 */}
      <div className="px-5 py-4">
        <p className="text-[13px] font-semibold text-[#888888] mb-3">알림</p>
        <div className="flex flex-col gap-4">
          <NotifRow
            label="캐스팅 제안 알림"
            checked={notif.casting}
            onToggle={() => toggleNotif('casting')}
          />
          <NotifRow
            label="댓글/좋아요 알림"
            checked={notif.reaction}
            onToggle={() => toggleNotif('reaction')}
          />
          <NotifRow
            label="서비스 공지 알림"
            checked={notif.notice}
            onToggle={() => toggleNotif('notice')}
          />
        </div>
      </div>

      {/* 기타 */}
      <div className="px-5 py-4 border-t border-[#F0F0F0]">
        <p className="text-[13px] font-semibold text-[#888888] mb-3">기타</p>
        <div className="flex flex-col gap-3">
          <button className="flex items-center justify-between py-2">
            <span className="text-[15px] text-[#1A1A1A]">이용약관 보기</span>
            <ChevronRight size={16} className="text-[#888888]" />
          </button>
          <button className="flex items-center justify-between py-2">
            <span className="text-[15px] text-[#1A1A1A]">개인정보 처리방침</span>
            <ChevronRight size={16} className="text-[#888888]" />
          </button>
          <div className="flex items-center justify-between py-2">
            <span className="text-[15px] text-[#1A1A1A]">앱 버전</span>
            <span className="text-[14px] text-[#888888]">v1.0.0</span>
          </div>
        </div>
      </div>

      {/* 로그아웃 / 계정 삭제 */}
      <div className="px-5 py-4 border-t border-[#F0F0F0] mt-auto flex flex-col gap-3">
        <button onClick={handleLogout} className="text-[#E53935] text-[15px] font-medium text-left py-2">
          로그아웃
        </button>
        <button className="text-[#888888] text-[14px] text-left py-2">
          계정 삭제
        </button>
      </div>
    </div>
  );
}

function NotifRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[15px] text-[#1A1A1A]">{label}</span>
      <Switch
        checked={checked}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-[#E53935]"
      />
    </div>
  );
}
