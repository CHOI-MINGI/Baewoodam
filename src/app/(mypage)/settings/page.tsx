"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { ChevronRight, X } from 'lucide-react';

interface UserInfo {
  name: string | null;
  email: string;
  image: string | null;
  roleType: string;
  agencyProfile?: { companyName: string | null; position: string | null } | null;
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/users/me', { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제 실패');
      await signOut({ callbackUrl: '/login' });
    } catch {
      alert('계정 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#F0F0F0]">
        <button onClick={() => router.back()} className="text-xl">←</button>
        <h1 className="text-[16px] font-semibold text-[#1A1A1A]">설정</h1>
      </div>

      {/* 프로필 영역 */}
      <Link
        href={user?.roleType === 'AGENCY' ? '/profile-edit/agency' : '/profile-edit'}
        className="flex items-center justify-between gap-3 px-5 py-5 border-b border-[#F0F0F0] hover:bg-[#F9F9F9] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-[50px] h-[50px] rounded-full overflow-hidden bg-[#D9D9D9] flex-shrink-0">
            {user?.image && <Image src={user.image} alt={user.name ?? ''} width={50} height={50} className="object-cover w-full h-full" />}
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-[#1A1A1A]">{user?.name ?? '이름 없음'}</p>
            <p className="text-[13px] text-[#888888]">{user?.email}</p>
            {user?.roleType === 'AGENCY' && (
              <p className="text-[12px] text-[#AAAAAA] mt-0.5">
                {[user.agencyProfile?.companyName, user.agencyProfile?.position].filter(Boolean).join(' · ') || '소속·직무 미입력'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-[13px] text-[#888888]">프로필 수정</span>
          <ChevronRight size={16} className="text-[#888888]" />
        </div>
      </Link>

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
        <button onClick={() => setShowDeleteModal(true)} className="text-[#888888] text-[14px] text-left py-2">
          계정 삭제
        </button>
      </div>

      {/* 계정 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full max-w-[430px] mx-auto rounded-t-2xl px-6 py-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[17px] font-bold text-[#1A1A1A]">계정 삭제</h2>
              <button onClick={() => setShowDeleteModal(false)}>
                <X size={20} className="text-[#888888]" />
              </button>
            </div>

            <div className="bg-[#FFF5F5] rounded-xl px-4 py-4 mb-6">
              <p className="text-[14px] font-semibold text-[#E53935] mb-2">삭제 전 꼭 확인하세요</p>
              <ul className="space-y-1.5">
                {['작성한 모든 필모그래피, 작품, 쇼릴이 삭제됩니다', '받은 캐스팅 제안 내역이 삭제됩니다', '삭제 후 복구가 불가능합니다'].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-[13px] text-[#888888]">
                    <span className="text-[#E53935] mt-0.5">•</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 h-[52px] rounded-full border border-[#E0E0E0] text-[#1A1A1A] text-[15px] font-semibold"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 h-[52px] rounded-full bg-[#E53935] text-white text-[15px] font-semibold disabled:opacity-60"
              >
                {deleting ? '삭제 중...' : '계정 삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
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
