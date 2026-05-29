"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Settings, Pencil, Play } from 'lucide-react';
import { AGE_RANGE_MAP, MEDIA_TYPE_MAP, ROLE_MAP } from '@/constants';
import type { ActorDetail, CastingOfferWithDetails } from '@/types';

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING: { label: '대기중', className: 'bg-[#F5F5F5] text-[#888888]' },
  ACCEPTED: { label: '수락됨', className: 'bg-[#DCFCE7] text-[#16A34A]' },
  REJECTED: { label: '거절됨', className: 'bg-[#F5F5F5] text-[#888888]' },
  AUDITION_SUBMITTED: { label: '오디션 제출', className: 'bg-[#EFF6FF] text-[#2563EB]' },
  EXPIRED: { label: '만료', className: 'bg-[#F5F5F5] text-[#888888]' },
};

export default function ActorHome() {
  const [actor, setActor] = useState<(ActorDetail & { coverImage?: string | null }) | null>(null);
  const [offers, setOffers] = useState<CastingOfferWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/users/me').then(r => r.json()),
      fetch('/api/casting?type=received').then(r => r.json()),
    ]).then(async ([user, offersData]) => {
      if (user?.id) {
        const res = await fetch(`/api/actors/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setActor({ ...data, coverImage: user.coverImage ?? null });
        }
      }
      setOffers(offersData ?? []);
      setLoading(false);
    });
  }, []);

  const formatDuration = (sec: number | null) => {
    if (!sec) return '';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const filmoByYear = (actor?.filmographies ?? []).reduce<Record<number, ActorDetail['filmographies']>>(
    (acc, f) => { if (!acc[f.year]) acc[f.year] = []; acc[f.year].push(f); return acc; },
    {} as Record<number, ActorDetail['filmographies']>,
  );
  const sortedYears = Object.keys(filmoByYear).map(Number).sort((a, b) => b - a);
  const pendingOffers = offers.filter(o => o.status === 'PENDING');
  const acceptedOffers = offers.filter(o => o.status === 'ACCEPTED');

  const completion = (() => {
    let score = 0;
    if (actor?.name) score += 15;
    if (actor?.coverImage || actor?.image) score += 15;
    if (actor?.bio) score += 14;
    if (actor?.location) score += 14;
    if ((actor?.skills?.length ?? 0) > 0) score += 14;
    if ((actor?.filmographies?.length ?? 0) > 0) score += 14;
    if ((actor?.showreels?.length ?? 0) > 0) score += 14;
    return score;
  })();

  if (loading) return <div className="min-h-screen bg-[#F5F5F5] animate-pulse" />;

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <div className="flex items-center justify-between px-8 pt-8 pb-4">
        <h1 className="text-[22px] font-bold text-[#1A1A1A]">마이페이지</h1>
        <Link href="/settings"><Settings size={22} className="text-[#1A1A1A]" /></Link>
      </div>

      <div className="max-w-[1200px] mx-auto px-8 pb-12 space-y-5">

        {/* 상단 2열: 프로필 카드 + 요약 */}
        <div className="grid grid-cols-[1fr_320px] gap-4">
          <div className="relative rounded-2xl overflow-hidden bg-[#1A1A1A]" style={{ minHeight: '220px' }}>
            {actor?.coverImage ? (
              <Image src={actor.coverImage} alt="" fill className="object-cover object-center" />
            ) : actor?.image ? (
              <Image src={actor.image} alt="" fill className="object-cover object-center" />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 text-white">
              <h2 className="text-[36px] font-bold leading-tight">{actor?.name ?? '이름 없음'}</h2>
              <p className="mt-1 text-white/70 text-[14px]">
                {[
                  actor?.ageRange ? (AGE_RANGE_MAP as any)[actor.ageRange] : null,
                  actor?.location ?? '서울',
                  actor?.height ? `${actor.height}cm` : null,
                ].filter(Boolean).join(' · ')}
              </p>
              <div className="mt-3 mb-1">
                <div className="w-[200px] bg-white/20 rounded-full h-1.5">
                  <div className="bg-[#E53935] h-1.5 rounded-full" style={{ width: `${completion}%` }} />
                </div>
                <p className="text-white/50 text-[11px] mt-1">프로필 완성도 <span className="text-[#E53935]">{completion}%</span></p>
              </div>
              <div className="flex gap-3 mt-4">
                <Link href="/profile-edit" className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/60 text-white text-[13px]">
                  <Pencil size={12} /> 수정하기
                </Link>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E53935] text-white text-[13px]">
                  ♥ 팬하기 추가하기
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 flex flex-col justify-center gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#888888]">받은 제안</span>
              <span className="text-[18px] font-bold text-[#1A1A1A]">{offers.length}건</span>
            </div>
            <div className="h-px bg-[#F0F0F0]" />
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#888888]">대기중</span>
              <span className="px-3 py-1 rounded-full bg-[#FEE2E2] text-[#E53935] text-[13px] font-semibold">{pendingOffers.length}건</span>
            </div>
            <div className="h-px bg-[#F0F0F0]" />
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#888888]">수락됨</span>
              <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A] text-[13px] font-semibold">{acceptedOffers.length}건</span>
            </div>
            <div className="h-px bg-[#F0F0F0]" />
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#888888]">필모그래피</span>
              <span className="text-[18px] font-bold text-[#1A1A1A]">{actor?.filmographyCount ?? 0}편</span>
            </div>
          </div>
        </div>

        {/* 받은 캐스팅 제안 */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[18px] font-bold text-[#1A1A1A]">받은 캐스팅 제안</h2>
            <Link href="/casting" className="text-[13px] text-[#E53935]">전체보기 →</Link>
          </div>
          {offers.length === 0 ? (
            <div className="text-center py-10 text-[#888888]">아직 받은 제안이 없어요.</div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {offers.slice(0, 3).map((offer) => {
                const status = STATUS_MAP[offer.status] ?? STATUS_MAP.PENDING;
                const isNew = offer.status === 'PENDING';
                return (
                  <Link key={offer.id} href={`/casting/${offer.id}`}>
                    <div className={`border-2 rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all ${isNew ? 'border-[#E53935] bg-[#FFF8F8]' : 'border-[#F0F0F0]'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-[12px] font-semibold ${isNew ? 'bg-[#E53935] text-white' : status.className}`}>
                          {isNew ? '새 제안' : status.label}
                        </span>
                        <span className="text-[11px] text-[#BBB]">
                          {new Date(offer.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[15px] font-bold text-[#1A1A1A] mb-1">{offer.project.title}</p>
                      <p className="text-[13px] text-[#888888] mb-3">{offer.character.name} 역 · {offer.project.mediaType}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#E0E0E0]" />
                        <span className="text-[12px] text-[#888888]">{offer.sender.name}</span>
                      </div>
                      {isNew && (
                        <p className="text-[12px] text-[#E53935] font-semibold mt-3">⏰ D-3 응답 기한</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* 최근 활동 */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-5">최근 활동</h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: '🎬', title: '필모그래피 등록', sub: '서울의 봄 · 2일 전' },
              { icon: '🎥', title: '쇼릴 업로드', sub: '2024 Actor Showreel · 3일 전' },
              { icon: '✅', title: '캐스팅 제안 수락', sub: '눈물의 여왕 2 · 5일 전' },
              { icon: '👤', title: '프로필 수정', sub: '스킬 및 특기 · 1주 전' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-2 p-4 border border-[#F0F0F0] rounded-2xl">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0F0] flex items-center justify-center text-[22px]">
                  {item.icon}
                </div>
                <p className="text-[13px] font-semibold text-[#1A1A1A]">{item.title}</p>
                <p className="text-[11px] text-[#888888]">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 필모그래피 + 스킬 2열 */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[18px] font-bold text-[#1A1A1A]">필모그래피</h2>
              <Link href="/filmography" className="text-[13px] text-[#E53935]">전체보기 →</Link>
            </div>
            {sortedYears.length === 0 ? (
              <p className="text-[#888888] text-[14px]">등록된 필모그래피가 없어요.</p>
            ) : (
              <div className="space-y-3">
                {sortedYears.slice(0, 2).map((year) => (
                  filmoByYear[year].map((film) => (
                    <div key={film.id} className="flex gap-3 items-start">
                      <div className="w-[56px] h-[72px] rounded-xl overflow-hidden bg-[#F5F5F5] flex-shrink-0">
                        {film.thumbnailUrl
                          ? <Image src={film.thumbnailUrl} alt={film.title} width={56} height={72} className="object-cover w-full h-full" />
                          : <div className="w-full h-full bg-[#E0E0E0]" />}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <span className="text-[11px] text-[#888888]">{(MEDIA_TYPE_MAP as any)[film.mediaType]}</span>
                        <p className="text-[14px] font-semibold text-[#1A1A1A] mt-0.5 line-clamp-2">{film.title}</p>
                        <p className="text-[12px] text-[#888888]">{(ROLE_MAP as any)[film.role]} · {film.year}</p>
                      </div>
                    </div>
                  ))
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[18px] font-bold text-[#1A1A1A]">스킬 및 특기</h2>
              <Link href="/skills" className="flex items-center gap-1 text-[13px] text-[#888888]">
                <Pencil size={12} /> 수정하기
              </Link>
            </div>
            {(actor?.skills ?? []).length === 0 ? (
              <p className="text-[#888888] text-[14px]">등록된 스킬이 없어요.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(actor?.skills ?? []).map((skill) => (
                  <span key={skill} className="px-3 py-1.5 rounded-full border border-[#E0E0E0] text-[13px] text-[#1A1A1A]">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 대표 영상 */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[18px] font-bold text-[#1A1A1A]">대표 영상</h2>
            <Link href="/showreel" className="text-[13px] text-[#E53935]">전체보기 →</Link>
          </div>
          {(actor?.showreels ?? []).length === 0 ? (
            <p className="text-[#888888] text-[14px]">등록된 영상이 없어요.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {(actor?.showreels ?? []).slice(0, 2).map((reel) => (
                <Link key={reel.id} href={`/showreel/${reel.id}`} className="block group">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#1A1A1A]">
                    <video src={reel.videoUrl} preload="metadata" className="w-full h-full object-cover" playsInline />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Play size={18} className="text-[#1A1A1A] ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <p className="text-[14px] font-medium text-[#1A1A1A] mt-2">{reel.title}</p>
                  {reel.duration && <p className="text-[12px] text-[#888888]">{formatDuration(reel.duration)}</p>}
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
