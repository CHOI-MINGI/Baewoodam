"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, User, Bell, Settings, Clapperboard, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';

interface TabItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const ACTOR_TABS: TabItem[] = [
  { label: '홈', href: '/home', icon: Home },
  { label: '캐스팅', href: '/casting', icon: Briefcase },
  { label: '마이페이지', href: '/mypage', icon: User },
  { label: '알림', href: '/notifications', icon: Bell },
  { label: '설정', href: '/settings', icon: Settings },
];

const AGENCY_TABS: TabItem[] = [
  { label: '홈', href: '/home', icon: Home },
  { label: '프로젝트', href: '/projects', icon: Clapperboard },
  { label: '캐스팅', href: '/casting', icon: Briefcase },
  { label: '알림', href: '/notifications', icon: Bell },
  { label: '설정', href: '/settings', icon: Settings },
];

export default function Sidebar({ roleType = 'ACTOR' }: { roleType?: string }) {
  const pathname = usePathname();
  const tabs = roleType === 'AGENCY' ? AGENCY_TABS : ACTOR_TABS;

  return (
    <aside className="hidden md:flex flex-col w-[220px] min-h-screen bg-white fixed left-0 top-0 z-40">
      {/* 로고 */}
      <div className="px-6 py-6 border-b border-[#F0F0F0]">
        <Link href="/home">
          <h1 className="text-[22px] font-bold text-[#1A1A2E]">배우담</h1>
          <p className="text-[11px] text-[#888888] mt-0.5">캐스팅 플랫폼</p>
        </Link>
      </div>

      {/* 메뉴 */}
      <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
        {tabs.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/home' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors',
                active
                  ? 'bg-[#1A1A2E] text-white'
                  : 'text-[#888888] hover:bg-[#F5F5F5] hover:text-[#1A1A2E]'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* 로그아웃 */}
      <div className="px-3 py-4 border-t border-[#F0F0F0]">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-[#888888] hover:bg-[#F5F5F5] w-full"
        >
          <LogOut size={18} />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
