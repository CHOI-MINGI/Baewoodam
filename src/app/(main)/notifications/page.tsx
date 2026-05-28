"use client";

import { useEffect, useState } from 'react';
import { Heart, Diamond } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { NotificationItem } from '@/types';

const TABS = ['전체', '캐스팅', '피드', '시스템'] as const;

export default function NotificationsPage() {
  const [tab, setTab] = useState<string>('전체');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => { setNotifications(d ?? []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleReadAll = async () => {
    await fetch('/api/notifications/read-all', { method: 'PATCH' });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, isRead: true } : n),
    );
  };

  const filtered = tab === '전체'
    ? notifications
    : notifications.filter((n) => {
        if (tab === '캐스팅') return n.type === 'CASTING';
        if (tab === '피드') return n.type === 'FEED';
        if (tab === '시스템') return n.type === 'SYSTEM';
        return true;
      });

  return (
    <div className="flex flex-col min-h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0F0F0]">
        <h1 className="text-[16px] font-semibold text-[#1A1A1A]">알림</h1>
        <button onClick={handleReadAll} className="text-[13px] text-[#888888]">모두 읽기</button>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-[#F0F0F0]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-3 text-[14px] font-medium transition-colors',
              tab === t ? 'text-[#E53935] border-b-2 border-[#E53935]' : 'text-[#888888]',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 알림 목록 */}
      <div className="flex-1 px-4 py-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-[#F5F5F5] rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-[15px] text-[#888888]">등록된 알림이 없어요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filtered.map((notif) => (
              <NotifItem key={notif.id} notif={notif} onRead={() => handleRead(notif.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NotifItem({ notif, onRead }: { notif: NotificationItem; onRead: () => void }) {
  const isCasting = notif.type === 'CASTING';

  return (
    <button
      onClick={onRead}
      className={cn(
        'flex items-start gap-3 px-3 py-3 rounded-xl w-full text-left transition-colors',
        notif.isRead ? 'bg-transparent' : 'bg-[#FFF5F5]',
      )}
    >
      <div className={cn(
        'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
        isCasting ? 'bg-[#FFE5E5]' : 'bg-[#EDE5FF]',
      )}>
        {isCasting
          ? <Heart size={16} className="text-[#E53935]" />
          : <Diamond size={16} className="text-[#8B5CF6]" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-[14px]', notif.isRead ? 'text-[#888888]' : 'font-semibold text-[#1A1A1A]')}>
          {notif.title}
        </p>
        <p className="text-[13px] text-[#888888] truncate">{notif.body}</p>
        <p className="text-[11px] text-[#BBBBBB] mt-0.5">
          {format(new Date(notif.createdAt), 'yyyy.MM.dd')}
        </p>
      </div>
    </button>
  );
}
