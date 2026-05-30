"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Phone, Download, Play, ExternalLink, X } from 'lucide-react';
import { AGE_RANGE_MAP, MEDIA_TYPE_MAP, ROLE_MAP } from '@/constants';
import type { ActorDetail } from '@/types';

interface FeaturedWork {
  id: string;
  title: string;
  youtubeUrl: string;
  thumbnailUrl: string | null;
  genre: string | null;
  year: number | null;
  myRole: string | null;
}

interface FilmoDetail {
  id: string;
  title: string;
  mediaType: string;
  role: string;
  characterName: string | null;
  genre: string | null;
  year: number;
  thumbnailUrl: string | null;
  youtubeUrl: string | null;
  description: string | null;
}

export default function ActorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [actor, setActor] = useState<(ActorDetail & { coverImage?: string | null; featuredWorks?: FeaturedWork[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilmo, setSelectedFilmo] = useState<FilmoDetail | null>(null);

  useEffect(() => {
    fetch(`/api/actors/${id}`)
      .then((r) => r.json())
      .then((d) => { setActor(d); setLoading(false); });
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#F5F5F5] animate-pulse" />;
  if (!actor) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-[#888888]">배우를 찾을 수 없어요.</p>
    </div>
  );

  const filmoByYear = actor.filmographies.reduce<Record<number, typeof actor.filmographies>>(
    (acc, f) => { if (!acc[f.year]) acc[f.year] = []; acc[f.year].push(f); return acc; },
    {},
  );
  const sortedYears = Object.keys(filmoByYear).map(Number).sort((a, b) => b - a);
  const featuredWorks = actor.featuredWorks ?? [];
  const hasRepVideo = featuredWorks.length > 0 || actor.showreels.length > 0;

  return (
    <div className="bg-[#F5F5F5] min-h-screen pb-24">

      {/* 히어로 카드 (16:9, 마이페이지 스타일) */}
      <section className="relative w-full bg-[#1A1A1A]" style={{ aspectRatio: '16/9' }}>
        {actor.coverImage ? (
          <Image src={actor.coverImage} alt="" fill className="object-cover object-center" />
        ) : actor.image ? (
          <Image src={actor.image} alt="" fill className="object-cover object-center" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* 뒤로 가기 */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/30 flex items-center justify-center z-10"
        >
          <ArrowLeft size={18} color="white" />
        </button>

        {/* 배우 정보 */}
        <div className="absolute bottom-0 left-0 p-8 text-white">
          <h1 className="text-[40px] font-bold leading-tight">{actor.name ?? '이름 없음'}</h1>
          <p className="mt-1.5 text-white/70 text-[14px]">
            {[
              actor.ageRange ? (AGE_RANGE_MAP as any)[actor.ageRange] : null,
              actor.location ?? '한국',
              actor.height ? `${actor.height}cm` : null,
            ].filter(Boolean).join(' · ')}
          </p>
          {actor.bio && (
            <p className="mt-2 text-white/60 text-[13px] max-w-[400px] line-clamp-2">{actor.bio}</p>
          )}
        </div>
      </section>

      <div className="px-5 py-5 space-y-4">

        {/* 필모그래피 */}
        {sortedYears.length > 0 && (
          <section className="bg-white rounded-2xl p-5">
            <h2 className="text-[17px] font-bold text-[#1A1A1A] mb-5">필모그래피</h2>
            <div className="space-y-5">
              {sortedYears.map((year) => (
                <div key={year}>
                  <p className="text-[13px] font-semibold text-[#888888] mb-3">{year}</p>
                  <div className="flex flex-col gap-3">
                    {filmoByYear[year].map((film) => (
                      <button
                        key={film.id}
                        onClick={() => setSelectedFilmo(film as any)}
                        className="flex gap-3 items-start text-left hover:bg-[#F8F8F8] rounded-xl p-1.5 -mx-1.5 transition-colors"
                      >
                        <div className="w-2 h-2 rounded-full border-2 border-[#E53935] mt-2 flex-shrink-0" />
                        <div className="w-[50px] h-[68px] rounded-lg overflow-hidden bg-[#F5F5F5] flex-shrink-0">
                          {film.thumbnailUrl ? (
                            <Image src={film.thumbnailUrl} alt={film.title} width={50} height={68} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full bg-[#E0E0E0]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <span className="text-[11px] text-[#888888] bg-[#F5F5F5] px-2 py-0.5 rounded">
                            {(MEDIA_TYPE_MAP as any)[film.mediaType] ?? film.mediaType}
                          </span>
                          <p className="text-[14px] font-semibold text-[#1A1A1A] mt-1">{film.title}</p>
                          <p className="text-[12px] text-[#888888]">
                            {(ROLE_MAP as any)[film.role]}{film.characterName ? ` · ${film.characterName}` : ''}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 스킬 */}
        {actor.skills.length > 0 && (
          <section className="bg-white rounded-2xl p-5">
            <h2 className="text-[17px] font-bold text-[#1A1A1A] mb-4">스킬 및 특기</h2>
            <div className="flex flex-wrap gap-2">
              {actor.skills.map((skill) => (
                <span key={skill} className="px-3 py-1.5 rounded-full bg-[#F0F0F0] text-[13px] text-[#1A1A1A]">{skill}</span>
              ))}
            </div>
          </section>
        )}

        {/* 대표 영상 */}
        {hasRepVideo && (
          <section className="bg-white rounded-2xl p-5">
            <h2 className="text-[17px] font-bold text-[#1A1A1A] mb-4">대표 영상</h2>
            <div className="grid grid-cols-2 gap-3">
              {/* 대표 작품 (YouTube) */}
              {featuredWorks.map((work) => (
                <div key={work.id} className="group">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#1A1A1A]">
                    {work.thumbnailUrl && (
                      <Image src={work.thumbnailUrl} alt={work.title} fill className="object-cover opacity-90" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                        <Play size={16} className="text-[#1A1A1A] ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute top-2 left-2 bg-[#E53935] text-white text-[10px] px-2 py-0.5 rounded-full font-medium">대표</span>
                  </div>
                  <div className="mt-1.5 px-0.5 flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#1A1A1A] truncate">{work.title}</p>
                      <p className="text-[11px] text-[#888888]">{[work.genre, work.year].filter(Boolean).join(' · ')}</p>
                    </div>
                    <a href={work.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 mt-0.5">
                      <ExternalLink size={13} className="text-[#888888] hover:text-[#E53935]" />
                    </a>
                  </div>
                </div>
              ))}

              {/* 쇼릴 */}
              {actor.showreels.map((reel) => (
                <div key={reel.id} className="group">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#1A1A1A]">
                    {reel.thumbnailUrl && (
                      <Image src={reel.thumbnailUrl} alt={reel.title} fill className="object-cover opacity-80" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                        <Play size={16} className="text-[#1A1A1A] ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-1.5 px-0.5">
                    <p className="text-[13px] font-semibold text-[#1A1A1A] truncate">{reel.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 하단 고정 액션 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] flex gap-3 px-5 py-3 bg-white border-t border-[#F0F0F0] z-40">
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
          캐스팅 제안
        </button>
      </div>

      {/* 필모그래피 상세 모달 (읽기 전용) */}
      {selectedFilmo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setSelectedFilmo(null)}>
          <div
            className="bg-white w-full max-w-[430px] mx-auto rounded-t-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedFilmo.thumbnailUrl ? (
              <div className="relative w-full h-[180px]">
                <Image src={selectedFilmo.thumbnailUrl} alt={selectedFilmo.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5 text-white">
                  <p className="text-[11px] text-white/70">
                    {(MEDIA_TYPE_MAP as any)[selectedFilmo.mediaType]} · {selectedFilmo.year}
                  </p>
                  <h3 className="text-[18px] font-bold mt-0.5">{selectedFilmo.title}</h3>
                  <p className="text-[12px] text-white/80 mt-0.5">
                    {(ROLE_MAP as any)[selectedFilmo.role]}{selectedFilmo.characterName ? ` · ${selectedFilmo.characterName}` : ''}
                  </p>
                </div>
                <button onClick={() => setSelectedFilmo(null)} className="absolute top-4 right-4 bg-black/40 rounded-full p-1.5">
                  <X size={16} className="text-white" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-5 py-5">
                <div>
                  <p className="text-[11px] text-[#888888]">
                    {(MEDIA_TYPE_MAP as any)[selectedFilmo.mediaType]} · {selectedFilmo.year}
                  </p>
                  <h3 className="text-[18px] font-bold text-[#1A1A1A] mt-0.5">{selectedFilmo.title}</h3>
                  <p className="text-[12px] text-[#888888] mt-0.5">
                    {(ROLE_MAP as any)[selectedFilmo.role]}{selectedFilmo.characterName ? ` · ${selectedFilmo.characterName}` : ''}
                  </p>
                </div>
                <button onClick={() => setSelectedFilmo(null)}><X size={20} className="text-[#888888]" /></button>
              </div>
            )}

            {/* YouTube 링크 버튼 */}
            {selectedFilmo.youtubeUrl && (
              <a
                href={selectedFilmo.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mx-5 mt-3 flex items-center justify-center gap-2 h-[44px] rounded-xl bg-[#FF0000] text-white text-[14px] font-semibold"
              >
                <ExternalLink size={15} />
                유튜브에서 보기
              </a>
            )}

            <div className="px-5 py-4 space-y-3">
              {selectedFilmo.genre && (
                <div className="flex gap-3">
                  <span className="text-[12px] text-[#888888] w-16 flex-shrink-0 pt-0.5">장르</span>
                  <span className="text-[14px] text-[#1A1A1A]">{selectedFilmo.genre}</span>
                </div>
              )}
              {selectedFilmo.description && (
                <div className="flex gap-3">
                  <span className="text-[12px] text-[#888888] w-16 flex-shrink-0 pt-0.5">설명</span>
                  <p className="text-[14px] text-[#1A1A1A] leading-relaxed flex-1">{selectedFilmo.description}</p>
                </div>
              )}
            </div>
            <div className="h-4" />
          </div>
        </div>
      )}
    </div>
  );
}
