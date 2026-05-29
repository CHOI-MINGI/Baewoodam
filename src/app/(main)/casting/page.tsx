"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CASTING_STATUS_MAP, MEDIA_TYPE_MAP } from '@/constants';
import type { CastingOfferWithDetails } from '@/types';
import { format } from 'date-fns';
import { useSession } from "next-auth/react";

const TABS = ['전체', '확인안함', '수락', '거절', '마감'] as const;
const STATUS_FILTER: Record<string, string[]> = {
  '확인안함': ['PENDING'],
  '수락': ['ACCEPTED', 'AUDITION_SUBMITTED'],
  '거절': ['REJECTED'],
  '마감': ['EXPIRED'],
};



export default function CastingPage() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<string>('전체');
  const [offers, setOffers] = useState<CastingOfferWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (status !== "authenticated") return;

  const type =
    (session?.user as any)?.roleType === "AGENCY"
      ? "sent"
      : "received";

  fetch(`/api/casting?type=${type}`)
    .then((r) => r.json())
    .then((d) => {
      setOffers(d ?? []);
      setLoading(false);
    });
}, [session, status]);

  const filtered = tab === '전체'
    ? offers
    : offers.filter((o) => STATUS_FILTER[tab]?.includes(o.status));

  return (
    <div className="flex flex-col min-h-full">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-[#F0F0F0]">
        <h1 className="text-[16px] font-semibold text-[#1A1A1A]">
        {(session?.user as any)?.roleType === 'AGENCY'
          ? '보낸 캐스팅 제안'
          : '받은 캐스팅 제안'}
        </h1>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-[#F0F0F0] overflow-x-auto scrollbar-hide">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-shrink-0 px-4 py-3 text-[14px] font-medium transition-colors whitespace-nowrap',
              tab === t
                ? 'text-[#E53935] border-b-2 border-[#E53935]'
                : 'text-[#888888]',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 제안 목록 */}
      <div className="flex-1 px-4 py-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-[#F5F5F5] rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-[15px] text-[#888888]">제안이 없어요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((offer) => <OfferCard key={offer.id} offer={offer} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function OfferCard({ offer }: { offer: CastingOfferWithDetails }) {
  const statusColor: Record<string, string> = {
    ACCEPTED: 'text-green-600',
    AUDITION_SUBMITTED: 'text-green-600',
    REJECTED: 'text-[#888888]',
  };

  return (
    <Link href={`/casting/${offer.id}`}>
      <div className="flex gap-3 bg-white border border-[#F0F0F0] rounded-xl p-3">
        {/* 포스터 */}
        <div className="w-[64px] h-[86px] rounded-lg bg-[#F5F5F5] flex-shrink-0" />
        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <span className="text-[11px] text-[#888888] bg-[#F5F5F5] px-2 py-0.5 rounded">
            {(MEDIA_TYPE_MAP as any)[offer.project?.mediaType] ?? offer.project?.mediaType}
          </span>
          <p className="text-[15px] font-bold text-[#1A1A1A] mt-1">{offer.project?.title}</p>
          <p className="text-[13px] text-[#888888]">{offer.character?.name}</p>
          <p className="text-[12px] text-[#888888]">{offer.sender?.name}</p>
          <div className="flex items-center gap-2 mt-1">
            {offer.status !== 'PENDING' && (
              <span className={cn('text-[12px] font-medium', statusColor[offer.status] ?? '')}>
                {(CASTING_STATUS_MAP as any)[offer.status]}
              </span>
            )}
            <span className="text-[11px] text-[#BBBBBB]">
              {format(new Date(offer.createdAt), 'yyyy.MM.dd')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
