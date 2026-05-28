"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Settings, Pencil, Play } from 'lucide-react';
import { AGE_RANGE_MAP, MEDIA_TYPE_MAP, ROLE_MAP } from '@/constants';
import type { ActorDetail } from '@/types';

export default function MypagePage() {
  const [actor, setActor] = useState<ActorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users/me')
      .then((r) => r.json())
      .then(async (user) => {
        if (!user?.id) { setLoading(false); return; }
        const res = await fetch(`/api/actors/${user.id}`);
        if (res.ok) setActor(await res.json());
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="min-h-screen animate-pulse bg-[#F5F5F5]" />;

  const filmoByYear = (actor?.filmographies ?? []).reduce<Record<number, ActorDetail['filmographies']>>(
    (acc, f) => { if (!acc[f.year]) acc[f.year] = []; acc[f.year].push(f); return acc; },
    {} as any,
  );
  const sortedYears = Object.keys(filmoByYear).map(Number).sort((a, b) => b - a);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-[18px] font-bold text-[#1A1A1A]">마이페이지</h1>
        <Link href="/settings">
          <Settings size={20} className="text-[#1A1A1A]" />
        </Link>
      </div>

      {/* 프로필 히어로 */}
      <div className="relative w-full h-[280px] bg-[#1A1A1A]">
        {actor?.image && (
          <Image src={actor.image} alt={actor.name ?? ''} fill className="object-cover opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h2 className="text-[22px] font-bold text-white">{actor?.name}</h2>
          <p className="text-[13px] text-white/80 mt-0.5">
            {actor?.ageRange ? (AGE_RANGE_MAP as any)[actor.ageRange] : ''}{' '}
            · 필모 {actor?.filmographyCount ?? 0}편
          </p>
          {actor?.bio && <p className="text-[13px] text-white/70 mt-1">{actor.bio}</p>}
          <div className="flex gap-2 mt-3">
            <Link
              href="/profile-edit"
              className="px-4 py-1.5 rounded-full border border-white text-white text-[13px] font-medium"
            >
              수정하기
            </Link>
            <button className="px-4 py-1.5 rounded-full bg-[#1A1A2E] text-white text-[13px] font-medium">
              팔로워 현황보기
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 flex flex-col gap-8">
        {/* 필모그래피 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-bold text-[#1A1A1A]">필모그래피</h3>
            <Link href="/filmography" className="text-[13px] text-[#888888]">수정하기</Link>
          </div>
          {sortedYears.length === 0 ? (
            <p className="text-[14px] text-[#888888]">등록된 필모그래피가 없어요.</p>
          ) : (
            <div className="flex flex-col gap-6">
              {sortedYears.map((year) => (
                <div key={year}>
                  <p className="text-[12px] text-[#888888] mb-3">{year}</p>
                  <div className="flex flex-col gap-3">
                    {filmoByYear[year].map((film) => (
                      <div key={film.id} className="flex gap-3 items-start">
                        <div className="w-[50px] h-[68px] rounded-lg overflow-hidden bg-[#F5F5F5] flex-shrink-0">
                          {film.thumbnailUrl
                            ? <Image src={film.thumbnailUrl} alt={film.title} width={50} height={68} className="object-cover w-full h-full" />
                            : <div className="w-full h-full bg-[#E0E0E0]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] text-[#888888] bg-[#F5F5F5] px-2 py-0.5 rounded">
                            {(MEDIA_TYPE_MAP as any)[film.mediaType] ?? film.mediaType}
                          </span>
                          <p className="text-[14px] font-semibold text-[#1A1A1A] mt-1">{film.title}</p>
                          <p className="text-[12px] text-[#888888]">
                            {(ROLE_MAP as any)[film.role]} · {film.characterName ?? actor?.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 스킬 및 특기 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[16px] font-bold text-[#1A1A1A]">스킬 및 특기</h3>
            <Link href="/profile-edit" className="text-[13px] text-[#888888]">수정하기</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {(actor?.skills ?? []).map((skill) => (
              <span key={skill} className="px-3 py-1.5 rounded-full border border-[#E0E0E0] text-[13px] text-[#1A1A1A]">
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* 대표 영상 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[16px] font-bold text-[#1A1A1A]">대표 영상</h3>
            <Link href="/showreel/new" className="text-[13px] text-[#888888]">수정하기</Link>
          </div>
          <div className="flex flex-col gap-3">
            {(actor?.showreels ?? []).map((reel) => (
              <div key={reel.id} className="rounded-xl overflow-hidden border border-[#F0F0F0]">
                <div className="relative w-full aspect-video bg-[#1A1A1A]">
                  {reel.thumbnailUrl
                    ? <Image src={reel.thumbnailUrl} alt={reel.title} fill className="object-cover opacity-80" />
                    : <div className="absolute inset-0 bg-[#2A2A2A]" />}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-white/80 flex items-center justify-center">
                      <Play size={18} className="text-[#1A1A1A] ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="px-3 py-2">
                  <p className="text-[14px] font-medium text-[#1A1A1A]">{reel.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="h-20" />
      </div>
    </div>
  );
}
