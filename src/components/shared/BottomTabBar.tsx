"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, User, Bell, Settings, Clapperboard, Film } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const ACTOR_TABS: TabItem[] = [
  { label: '홈', href: '/home', icon: Home },
  { label: '작품', href: '/works', icon: Film },
  { label: '캐스팅', href: '/casting', icon: Briefcase },
  { label: '포트폴리오', href: '/mypage', icon: User },
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

export default function BottomTabBar({ roleType = 'ACTOR' }: { roleType?: string }) {
  const pathname = usePathname();
  const tabs = roleType === 'AGENCY' ? AGENCY_TABS : ACTOR_TABS;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-[60px] bg-white border-t border-[#E0E0E0] flex items-center z-50">
      {tabs.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || (href !== '/home' && pathname.startsWith(href));
        return (
          <Link key={href} href={href} className="flex-1 flex flex-col items-center justify-center gap-0.5">
            <Icon size={22} className={cn(active ? 'text-[#1A1A2E]' : 'text-[#BBBBBB]')} />
            <span className={cn('text-[10px] font-medium', active ? 'text-[#1A1A2E]' : 'text-[#BBBBBB]')}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
