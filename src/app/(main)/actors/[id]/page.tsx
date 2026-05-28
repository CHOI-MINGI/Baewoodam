"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Bookmark, Phone, Download, Play } from 'lucide-react';
import { AGE_RANGE_MAP, MEDIA_TYPE_MAP, ROLE_MAP } from '@/constants';
import type { ActorDetail } from '@/types';
import { cn } from '@/lib/utils';

export default function ActorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [actor, setActor] = useState<ActorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/actors/${id}`)
      .then((r) => r.json())
      .then((d) => { setActor(d); setLoading(false); });
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-[#F5F5F5] animate-pulse" />;
  }

  if (!actor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#888888]">배우를 찾을 수 없어요.</p>
      </div>
    );
  }

  // 연도별 그룹핑
  const filmoByYear = actor.filmographies.reduce<Record<number, typeof actor.filmographies>>(
    (acc, f) => {
      if (!acc[f.year]) acc[f.year] = [];
      acc[f.year].push(f);
      return acc;
    },
    {},
  );
  const sortedYears = Object.keys(filmoByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 히어로 이미지 */}
      <div className="relative w-full aspect-[3/4] bg-[#1A1A1A]">
        {actor.image && (
          <Image
            src={actor.image}
            alt={actor.name ?? ''}
            fill
            className="object-cover opacity-80"
          />
        )}
        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

        {/* 상단 버튼들 */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center"
          >
            <ArrowLeft size={18} color="white" />
          </button>
          <button className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center">
            <Bookmark size={18} color="white" />
          </button>
        </div>

        {/* 하단 배우 정보 */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h1 className="text-[26px] font-bold text-white mb-1">{actor.name}</h1>
          <p className="text-[13px] text-white/80 mb-1">
            {actor.ageRange ? (AGE_RANGE_MAP as any)[actor.ageRange] : ''}{' '}
            · 필모 {actor.filmographyCount}편
          </p>
          {actor.bio && (
            <p className="text-[13px] text-white/70">{actor.bio}</p>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div className="px-5 py-5 flex flex-col gap-8">
        {/* 필모그래피 */}
        {sortedYears.length > 0 && (
          <section>
            <h2 className="text-[16px] font-bold text-[#1A1A1A] mb-4">필모그래피</h2>
            <div className="flex flex-col gap-6">
              {sortedYears.map((year) => (
                <div key={year}>
                  <p className="text-[12px] text-[#888888] mb-3">{year}</p>
                  <div className="flex flex-col gap-3">
                    {filmoByYear[year].map((film) => (
                      <div key={film.id} className="flex gap-3 items-start">
                        {/* 타임라인 점 */}
                        <div className="flex flex-col items-center pt-1.5 flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-[#D9D9D9]" />
                        </div>
                        {/* 썸네일 */}
                        <div className="w-[50px] h-[68px] rounded-lg overflow-hidden bg-[#F5F5F5] flex-shrink-0">
                          {film.thumbnailUrl ? (
                            <Image src={film.thumbnailUrl} alt={film.title} width={50} height={68} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full bg-[#E0E0E0]" />
                          )}
                        </div>
                        {/* 정보 */}
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] text-[#888888] bg-[#F5F5F5] px-2 py-0.5 rounded">
                            {(MEDIA_TYPE_MAP as any)[film.mediaType] ?? film.mediaType}
                          </span>
                          <p className="text-[14px] font-semibold text-[#1A1A1A] mt-1">{film.title}</p>
                          <p className="text-[12px] text-[#888888]">
                            {(ROLE_MAP as any)[film.role]} · {film.characterName ?? actor.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 스킬 및 특기 */}
        {actor.skills.length > 0 && (
          <section>
            <h2 className="text-[16px] font-bold text-[#1A1A1A] mb-3">스킬 및 특기</h2>
            <div className="flex flex-wrap gap-2">
              {actor.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-full border border-[#E0E0E0] text-[13px] text-[#1A1A1A]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 대표 영상 */}
        {actor.showreels.length > 0 && (
          <section>
            <h2 className="text-[16px] font-bold text-[#1A1A1A] mb-3">대표 영상</h2>
            <div className="flex flex-col gap-3">
              {actor.showreels.map((reel) => (
                <div key={reel.id} className="rounded-xl overflow-hidden border border-[#F0F0F0]">
                  <div className="relative w-full aspect-video bg-[#1A1A1A]">
                    {reel.thumbnailUrl ? (
                      <Image src={reel.thumbnailUrl} alt={reel.title} fill className="object-cover opacity-80" />
                    ) : (
                      <div className="absolute inset-0 bg-[#2A2A2A]" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-white/80 flex items-center justify-center">
                        <Play size={18} className="text-[#1A1A1A] ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-2">
                    <p className="text-[14px] font-medium text-[#1A1A1A]">{reel.title}</p>
                    {reel.duration && (
                      <p className="text-[12px] text-[#888888]">
                        {Math.floor(reel.duration / 60)}:{String(reel.duration % 60).padStart(2, '0')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 하단 여백 */}
        <div className="h-20" />
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] flex gap-3 px-5 py-3 bg-white border-t border-[#F0F0F0]">
        {actor.publicPortfolioUrl && (
          <a
            href={actor.publicPortfolioUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 h-[48px] rounded-full border border-[#1A1A2E] text-[#1A1A2E] text-[14px] font-semibold flex items-center justify-center gap-2"
          >
            <Download size={16} />
            포트폴리오
          </a>
        )}
        <button className="flex-1 h-[48px] rounded-full bg-[#1A1A2E] text-white text-[14px] font-semibold flex items-center justify-center gap-2">
          <Phone size={16} />
          연락하기
        </button>
      </div>
    </div>
  );
}
