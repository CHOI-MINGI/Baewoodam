"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
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

/** 에이전시(발신자)가 삭제할 수 있는 상태 목록 */
const DELETABLE_STATUSES = ['PENDING', 'REJECTED', 'EXPIRED', 'REJECTED_AFTER_AUDITION'];

export default function CastingPage() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<string>('전체');
  const [offers, setOffers] = useState<CastingOfferWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const isAgency = (session?.user as any)?.roleType === 'AGENCY';

  useEffect(() => {
    if (status !== "authenticated") return;
    const type = isAgency ? "sent" : "received";
    fetch(`/api/casting?type=${type}`)
      .then((r) => r.json())
      .then((d) => { setOffers(d ?? []); setLoading(false); });
  }, [session, status]);

  const handleDelete = async (offerId: string) => {
    if (!confirm('이 캐스팅 제안을 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/casting/${offerId}`, { method: 'DELETE' });
    if (res.ok) {
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
    } else {
      alert('삭제에 실패했어요.');
    }
  };

  const filtered = tab === '전체'
    ? offers
    : offers.filter((o) => STATUS_FILTER[tab]?.includes(o.status));

  return (
    <div className="flex flex-col min-h-full">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-[#F0F0F0]">
        <h1 className="text-[16px] font-semibold text-[#1A1A1A]">
          {isAgency ? '보낸 캐스팅 제안' : '받은 캐스팅 제안'}
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
            {filtered.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onDelete={isAgency && DELETABLE_STATUSES.includes(offer.status)
                  ? () => handleDelete(offer.id)
                  : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OfferCard({
  offer,
  onDelete,
}: {
  offer: CastingOfferWithDetails;
  onDelete?: () => void;
}) {
  const statusColor: Record<string, string> = {
    ACCEPTED: 'text-green-600',
    AUDITION_SUBMITTED: 'text-green-600',
    REJECTED: 'text-[#888888]',
  };

  return (
    <div className="relative flex bg-white border border-[#F0F0F0] rounded-xl overflow-hidden">
      <Link href={`/casting/${offer.id}`} className="flex gap-3 p-3 flex-1 min-w-0">
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
      </Link>

      {/* 삭제 버튼 — 에이전시 + 삭제 가능 상태일 때만 표시 */}
      {onDelete && (
        <button
          onClick={onDelete}
          className="flex-shrink-0 px-3 flex items-center justify-center border-l border-[#F0F0F0] text-[#BBBBBB] hover:text-[#E53935] hover:bg-[#FFF5F5] transition-colors"
          title="삭제"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
