"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MEDIA_TYPE_MAP, AGE_RANGE_MAP, GENDER_MAP } from '@/constants';
import type { CastingOfferWithDetails } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function CastingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [offer, setOffer] = useState<CastingOfferWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetch(`/api/casting/${id}`)
      .then((r) => r.json())
      .then((d) => { setOffer(d); setLoading(false); });
  }, [id]);

  const handleRespond = async (action: 'accept' | 'reject') => {
    setResponding(true);
    await fetch(`/api/casting/${id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    setResponding(false);
    if (action === 'accept') {
      router.push(`/casting/${id}/accept`);
    } else {
      router.push('/casting');
    }
  };

  if (loading) return <div className="min-h-screen animate-pulse bg-[#F5F5F5]" />;
  if (!offer) return <div className="flex items-center justify-center min-h-screen"><p className="text-[#888888]">제안을 찾을 수 없어요.</p></div>;

  const isPending = offer.status === 'PENDING';

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#F0F0F0]">
        <button onClick={() => router.back()} className="text-xl text-[#1A1A1A]">←</button>
        <h1 className="text-[16px] font-semibold text-[#1A1A1A]">캐스팅 제안 상세</h1>
      </div>

      {/* 포스터 */}
      <div className="w-full aspect-[3/4] bg-[#1A1A1A]" />

      <div className="px-5 py-5 flex flex-col gap-6">
        {/* 작품 기본 정보 */}
        <section>
          <span className="text-[12px] bg-[#F5F5F5] px-2 py-0.5 rounded text-[#888888]">
            {(MEDIA_TYPE_MAP as any)[offer.project.mediaType] ?? offer.project.mediaType}
          </span>
          <h2 className="text-[20px] font-bold text-[#1A1A1A] mt-1">{offer.project.title}</h2>
          <p className="text-[14px] text-[#888888] mt-0.5">
            {offer.character.name} · {offer.receiver.name}
          </p>
        </section>

        {/* 프로젝트 정보 */}
        <section className="flex flex-col gap-3">
          <h3 className="text-[14px] font-bold text-[#1A1A1A]">프로젝트 정보</h3>
          <InfoRow label="장르" value={offer.project.genre} />
          {offer.project.logline && (
            <div>
              <p className="text-[12px] text-[#888888] mb-1">로그라인</p>
              <p className="text-[14px] text-[#1A1A1A]">{offer.project.logline}</p>
            </div>
          )}
          {offer.character.description && (
            <div>
              <p className="text-[12px] text-[#888888] mb-1">캐릭터 설정</p>
              <p className="text-[14px] text-[#1A1A1A]">{offer.character.description}</p>
            </div>
          )}
        </section>

        {/* 조건 및 일정 */}
        <section className="flex flex-col gap-3">
          <h3 className="text-[14px] font-bold text-[#1A1A1A]">조건 및 일정</h3>
          <InfoRow label="촬영 예상 기간" value={offer.shootingPeriod} />
          <InfoRow label="주요 촬영 지역" value={offer.shootingLocation} />
          <InfoRow label="출연 조건" value={offer.conditions} />
        </section>

        {/* 감독/작가 메모 */}
        {offer.message && (
          <section>
            <h3 className="text-[14px] font-bold text-[#1A1A1A] mb-2">감독/작가 메모</h3>
            <p className="text-[14px] text-[#1A1A1A] leading-relaxed bg-[#F5F5F5] rounded-xl p-4">
              {offer.message}
            </p>
          </section>
        )}

        <p className="text-[12px] text-[#BBBBBB]">
          {format(new Date(offer.createdAt), 'yyyy.MM.dd')}
        </p>
      </div>

      {/* 하단 버튼 */}
      {isPending && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] flex gap-3 px-5 py-4 bg-white border-t border-[#F0F0F0]">
          <button
            disabled={responding}
            onClick={() => handleRespond('reject')}
            className="flex-1 h-[52px] rounded-full border border-[#E0E0E0] text-[#1A1A1A] text-[15px] font-semibold"
          >
            거절하기
          </button>
          <button
            disabled={responding}
            onClick={() => handleRespond('accept')}
            className="flex-1 h-[52px] rounded-full bg-[#1A1A2E] text-white text-[15px] font-semibold"
          >
            수락하기
          </button>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[12px] text-[#888888]">{label}</p>
      <p className="text-[14px] text-[#1A1A1A] mt-0.5">{value}</p>
    </div>
  );
}
