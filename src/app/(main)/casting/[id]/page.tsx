"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AGE_RANGE_MAP, GENDER_MAP, MEDIA_TYPE_MAP, CASTING_STATUS_MAP } from '@/constants';

interface OfferDetail {
  id: string;
  status: string;
  shootingPeriod: string | null;
  shootingLocation: string | null;
  conditions: string | null;
  message: string | null;
  rejectReason: string | null;
  auditionVideoUrl: string | null;
  auditionNote: string | null;
  createdAt: string;
  project: { title: string; mediaType: string; genre: string | null; logline: string | null; synopsis: string | null };
  character: { name: string; ageRange: string | null; gender: string | null; description: string | null; keywords: string[] };
  sender: { id: string; name: string | null; image: string | null };
  receiver: { id: string; name: string | null; image: string | null };
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-[#FEE2E2] text-[#E53935]',
  ACCEPTED: 'bg-[#DCFCE7] text-[#16A34A]',
  AUDITION_SUBMITTED: 'bg-[#EFF6FF] text-[#2563EB]',
  SELECTED: 'bg-[#DCFCE7] text-[#16A34A]',
  REJECTED_AFTER_AUDITION: 'bg-[#FEE2E2] text-[#E53935]',
  REJECTED: 'bg-[#F5F5F5] text-[#888888]',
  EXPIRED: 'bg-[#F5F5F5] text-[#888888]',
};

export default function CastingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const myId = (session?.user as any)?.id;

  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const load = () => {
    fetch(`/api/casting/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => setOffer(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [id]);

  // 내가 받는 사람(배우)인지 보낸 사람(에이전시)인지
  const isReceiver = offer && myId === offer.receiver.id;
  const isSender = offer && myId === offer.sender.id;

  const handleDelete = async () => {
    if (!confirm('정말 이 캐스팅 제안을 삭제하시겠습니까?')) {
      return;
    }

    const res = await fetch(`/api/casting/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      alert('삭제에 실패했어요.');
      return;
    }

    alert('삭제되었습니다.');
    router.push('/casting');
  };

  const handleRespond = async (action: 'accept' | 'reject') => {
    let rejectReason: string | undefined;
    if (action === 'reject') {
      rejectReason = prompt('거절 사유를 입력해주세요 (선택)') ?? undefined;
    }
    setProcessing(true);
    const res = await fetch(`/api/casting/${id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, rejectReason }),
    });
    setProcessing(false);
    if (res.ok) load();
    else alert('처리에 실패했어요.');
  };

  const handleFinalize = async (action: 'select' | 'reject') => {
    const res = await fetch(`/api/casting/${id}/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (res.ok) load();
    else alert('처리에 실패했어요.');
  };

  if (loading) return <div className="min-h-screen bg-[#F5F5F5] animate-pulse" />;
  if (!offer) return <div className="flex items-center justify-center min-h-screen text-[#888888]">제안을 찾을 수 없어요.</div>;

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-8 pt-8 pb-4">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
          <ChevronLeft size={20} className="text-[#1A1A1A]" />
        </button>
        <h1 className="text-[22px] font-bold text-[#1A1A1A]">캐스팅 제안 상세</h1>
      </div>

      <div className="max-w-[800px] mx-auto px-8 pb-12 space-y-4">

        {/* 상태 + 상대방 */}
        <div className="bg-white rounded-2xl p-6 flex items-center gap-4">
  <div className="w-14 h-14 rounded-full bg-[#F5F5F5] overflow-hidden">
    {(isReceiver ? offer.sender : offer.receiver).image ? (
      <img
        src={(isReceiver ? offer.sender : offer.receiver).image!}
        alt=""
        className="w-full h-full object-cover"
      />
    ) : null}
  </div>

  <div className="flex-1">
    <p className="text-[13px] text-[#888888]">
      {isReceiver ? '보낸 곳' : '받는 배우'}
    </p>
    <p className="text-[17px] font-bold text-[#1A1A1A]">
      {(isReceiver ? offer.sender : offer.receiver).name}
    </p>
  </div>

  <div className="flex items-center gap-2">
    <span
      className={`text-[12px] px-3 py-1.5 rounded-full font-semibold ${STATUS_BADGE[offer.status]}`}
    >
      {(CASTING_STATUS_MAP as any)[offer.status]}
    </span>

    {isSender && offer.status === 'PENDING' && (
      <button
        onClick={handleDelete}
        className="text-[12px] px-3 py-1.5 rounded-full bg-[#FEE2E2] text-[#E53935]"
      >
        삭제
      </button>
    )}
  </div>
</div>

        {/* 작품 정보 */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-[16px] font-bold text-[#1A1A1A] mb-4">작품 정보</h2>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] text-[#888888] bg-[#F5F5F5] px-2 py-0.5 rounded-full">
              {(MEDIA_TYPE_MAP as any)[offer.project.mediaType] ?? offer.project.mediaType}
            </span>
            {offer.project.genre && <span className="text-[12px] text-[#888888]">{offer.project.genre}</span>}
          </div>
          <p className="text-[18px] font-bold text-[#1A1A1A]">{offer.project.title}</p>
          {offer.project.logline && <p className="text-[14px] text-[#888888] mt-1">{offer.project.logline}</p>}
          {offer.project.synopsis && (
            <p className="text-[13px] text-[#666] mt-3 whitespace-pre-wrap">{offer.project.synopsis}</p>
          )}
        </div>

        {/* 캐릭터 정보 */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-[16px] font-bold text-[#1A1A1A] mb-4">제안 배역</h2>
          <p className="text-[17px] font-bold text-[#1A1A1A]">{offer.character.name}</p>
          <p className="text-[13px] text-[#888888] mt-1">
            {offer.character.ageRange ? (AGE_RANGE_MAP as any)[offer.character.ageRange] : ''}
            {offer.character.gender ? ` · ${(GENDER_MAP as any)[offer.character.gender]}` : ''}
          </p>
          {offer.character.description && (
            <p className="text-[14px] text-[#666] mt-2">{offer.character.description}</p>
          )}
          {offer.character.keywords?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {offer.character.keywords.map((k) => (
                <span key={k} className="text-[11px] px-2 py-0.5 rounded-full bg-[#F5F5F5] text-[#888888]">{k}</span>
              ))}
            </div>
          )}
        </div>

        {/* 제안 조건 */}
        <div className="bg-white rounded-2xl p-6 space-y-3">
          <h2 className="text-[16px] font-bold text-[#1A1A1A] mb-2">제안 조건</h2>
          {offer.shootingPeriod && (
            <div className="flex gap-3"><span className="text-[13px] text-[#888888] w-20 flex-shrink-0">촬영 기간</span><span className="text-[14px] text-[#1A1A1A]">{offer.shootingPeriod}</span></div>
          )}
          {offer.shootingLocation && (
            <div className="flex gap-3"><span className="text-[13px] text-[#888888] w-20 flex-shrink-0">촬영 지역</span><span className="text-[14px] text-[#1A1A1A]">{offer.shootingLocation}</span></div>
          )}
          {offer.conditions && (
            <div className="flex gap-3"><span className="text-[13px] text-[#888888] w-20 flex-shrink-0">출연 조건</span><span className="text-[14px] text-[#1A1A1A]">{offer.conditions}</span></div>
          )}
          {offer.message && (
            <div className="pt-3 border-t border-[#F0F0F0]">
              <p className="text-[13px] text-[#888888] mb-1">메시지</p>
              <p className="text-[14px] text-[#1A1A1A] whitespace-pre-wrap">{offer.message}</p>
            </div>
          )}
        </div>

        {/* 거절 사유 */}
        {offer.status === 'REJECTED' && offer.rejectReason && (
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-[16px] font-bold text-[#1A1A1A] mb-2">거절 사유</h2>
            <p className="text-[14px] text-[#666]">{offer.rejectReason}</p>
          </div>
        )}

        {/* 오디션 영상 (제출된 경우 - 양쪽 다 보임) */}
        {offer.auditionVideoUrl && (
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-[16px] font-bold text-[#1A1A1A] mb-4">
              {isSender ? '배우가 제출한 오디션 영상' : '내가 제출한 오디션 영상'}
            </h2>
            <div className="rounded-xl overflow-hidden bg-black">
              <video src={offer.auditionVideoUrl} controls className="w-full aspect-video" playsInline />
            </div>
            {offer.auditionNote && (
              <p className="text-[14px] text-[#666] mt-3 whitespace-pre-wrap">{offer.auditionNote}</p>
            )}
          </div>
        )}

        {/* ===== 배우용 액션 ===== */}
        {isReceiver && offer.status === 'PENDING' && (
          <div className="flex gap-3">
            <button
              onClick={() => handleRespond('reject')}
              disabled={processing}
              className="flex-1 h-[52px] rounded-full border border-[#E0E0E0] text-[#888888] text-[15px] font-semibold bg-white"
            >
              거절하기
            </button>
            <button
              onClick={() => handleRespond('accept')}
              disabled={processing}
              className="flex-1 h-[52px] rounded-full bg-[#E53935] text-white text-[15px] font-semibold"
            >
              수락하기
            </button>
          </div>
        )}

        {/* 배우용: 수락했고 아직 오디션 미제출 → 오디션 제출 버튼 */}
        {isReceiver && offer.status === 'ACCEPTED' && (
          <button
            onClick={() => router.push(`/casting/${id}/accept`)}
            className="w-full h-[52px] rounded-full bg-[#1A1A2E] text-white text-[15px] font-semibold"
          >
            🎥 오디션 영상 제출하기
          </button>
        )}

        {/* ===== 에이전시용 안내 ===== */}
        {isSender && offer.status === 'PENDING' && (
          <div className="bg-white rounded-2xl p-6 text-center text-[14px] text-[#888888]">
            배우의 응답을 기다리고 있어요.
          </div>
        )}
        {isSender && offer.status === 'ACCEPTED' && (
          <div className="bg-white rounded-2xl p-6 text-center text-[14px] text-[#16A34A]">
            배우가 제안을 수락했어요! 오디션 영상 제출을 기다리고 있어요.
          </div>
        )}
        {isSender && offer.status === 'AUDITION_SUBMITTED' && (
          <div className="flex gap-3">
            <button
              onClick={() => handleFinalize('select')}
              className="flex-1 h-[52px] rounded-full border border-[#E0E0E0] bg-white text-[#1A1A1A] text-[15px] font-semibold"
            >
              최종 합격
            </button>
            <button
              onClick={() => handleFinalize('reject')}
              className="flex-1 h-[52px] rounded-full bg-[#1A1A1A] text-white text-[15px] font-semibold"
            >
              최종 불합격
            </button>
          </div>
        )}
              </div>
            </div>
  );
}
