"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Pencil, Play, Settings } from 'lucide-react';
import { AGE_RANGE_MAP, MEDIA_TYPE_MAP, ROLE_MAP } from '@/constants';
import type { ActorDetail } from '@/types';

async function uploadImageFile(file: File, bucket: string): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('bucket', bucket);
  const res = await fetch('/api/upload/image', { method: 'POST', body: form });
  if (!res.ok) throw new Error('upload failed');
  return (await res.json()).url;
}

export default function MypagePage() {
  const [actor, setActor] = useState<(ActorDetail & { coverImage?: string | null }) | null>(null);
  const [loading, setLoading] = useState(true);
  const coverRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/users/me')
      .then((r) => r.json())
      .then(async (user) => {
        if (!user?.id) return setLoading(false);
        const res = await fetch(`/api/actors/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setActor({ ...data, coverImage: user.coverImage ?? null });
        }
        setLoading(false);
      });
  }, []);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !actor) return;
    try {
      const url = await uploadImageFile(file, 'profiles');
      await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverImage: url }),
      });
      setActor((prev) => prev ? { ...prev, coverImage: url } : prev);
    } catch (err: any) {
      alert(`이미지 업로드 실패: ${err.message}`);
    }
  };

  const formatDuration = (sec: number | null) => {
    if (!sec) return '';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // 필모그래피 연도별 그룹화
  const filmoByYear = (actor?.filmographies ?? []).reduce<Record<number, ActorDetail['filmographies']>>(
    (acc, f) => { if (!acc[f.year]) acc[f.year] = []; acc[f.year].push(f); return acc; },
    {} as Record<number, ActorDetail['filmographies']>,
  );
  const sortedYears = Object.keys(filmoByYear).map(Number).sort((a, b) => b - a);

  if (loading) return <div className="min-h-screen bg-[#F5F5F5]" />;

  return (
    <div className="bg-[#F5F5F5] min-h-screen">

      {/* 상단 타이틀 */}
      <div className="flex items-center justify-between px-8 pt-8 pb-2">
        <h1 className="text-[20px] font-bold text-[#1A1A1A]">마이페이지</h1>
        <Link href="/settings">
          <Settings size={22} className="text-[#1A1A1A]" />
        </Link>
      </div>

      <div className="max-w-[1200px] mx-auto px-8 pb-12 space-y-5">

        {/* 히어로 카드 */}
        <section className="relative w-full rounded-[16px] overflow-hidden bg-[#1A1A1A]"
           style={{ aspectRatio: '16/9' }}>
          {actor?.coverImage ? (
            <Image src={actor.coverImage} alt="" fill className="object-cover object-center" />
          ) : actor?.image ? (
            <Image src={actor.image} alt="" fill className="object-cover object-center" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* 배경 사진 변경 */}
          <button
            onClick={() => coverRef.current?.click()}
            className="absolute top-5 right-5 flex items-center gap-1.5 bg-black/40 text-white text-[12px] px-3 py-1.5 rounded-sm backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <Pencil size={12} />
            배경 사진
          </button>
          <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />

          {/* 정보 */}
          <div className="absolute bottom-0 left-0 p-10 text-white">
            <h2 className="text-[48px] font-bold leading-tight">{actor?.name ?? '이름 없음'}</h2>
            <p className="mt-2 text-white/70 text-[15px]">
              {[
                actor?.ageRange ? (AGE_RANGE_MAP as any)[actor.ageRange] : null,
                actor?.location ?? '한국',
                actor?.height ? `${actor.height}cm` : null,
              ].filter(Boolean).join(' · ')}
            </p>
            {actor?.bio && (
              <p className="mt-2 text-white/60 text-[14px] max-w-[500px]">{actor.bio}</p>
            )}
            <div className="flex gap-3 mt-5">
              <Link
                href="/profile-edit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-sm border border-white/60 text-white text-[14px] font-medium hover:bg-white/10 transition-colors"
              >
                <Pencil size={13} />
                수정하기
              </Link>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#E53935] text-white text-[14px] font-medium hover:bg-[#C62828] transition-colors">
                ♥ 팬하기 추가하기
              </button>
            </div>
          </div>
        </section>

        {/* 필모그래피 */}
        <section className="bg-white rounded-[16px] p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[20px] font-bold text-[#1A1A1A]">필모그래피</h2>
            <Link href="/filmography" className="flex items-center gap-1.5 text-[14px] text-[#888888] hover:text-[#1A1A1A] transition-colors">
              <Pencil size={13} />
              수정하기
            </Link>
          </div>

          {sortedYears.length === 0 ? (
            <p className="text-[#888888]">등록된 필모그래피가 없어요.</p>
          ) : (
            <div className="space-y-6">
              {sortedYears.map((year) => (
                <div key={year}>
                  <p className="text-[14px] font-semibold text-[#888888] mb-4">{year}</p>
                  <div className="grid md:grid-cols-2 gap-5">
                    {filmoByYear[year].map((film) => (
                      <div key={film.id} className="flex gap-4 items-start">
                        <div className="w-2 h-2 rounded-full border-2 border-[#E53935] mt-2 flex-shrink-0" />
                        <div className="w-[72px] h-[96px] rounded-xl overflow-hidden bg-[#F5F5F5] flex-shrink-0">
                          {film.thumbnailUrl
                            ? <Image src={film.thumbnailUrl} alt={film.title} width={72} height={96} className="object-cover w-full h-full" />
                            : <div className="w-full h-full bg-[#E0E0E0]" />}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <span className="text-[12px] text-[#888888]">
                            {(MEDIA_TYPE_MAP as any)[film.mediaType] ?? film.mediaType}
                          </span>
                          <p className="text-[15px] font-semibold text-[#1A1A1A] mt-0.5">{film.title}</p>
                          <p className="text-[13px] text-[#888888]">
                            {(ROLE_MAP as any)[film.role]}{film.characterName ? ` · ${film.characterName}` : ''}
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
        <section className="bg-white rounded-[32px] p-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[20px] font-bold text-[#1A1A1A]">스킬 및 특기</h2>
            <Link href="/skills" className="flex items-center gap-1.5 text-[14px] text-[#888888] hover:text-[#1A1A1A] transition-colors">
              <Pencil size={13} />
              수정하기
            </Link>
          </div>
          {(actor?.skills ?? []).length === 0 ? (
            <p className="text-[#888888]">등록된 스킬이 없어요.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(actor?.skills ?? []).map((skill) => (
                <span key={skill} className="px-4 py-2 rounded-full bg-[#EEEEEE] text-[14px] text-[#1A1A1A]">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* 대표 영상 */}
        <section className="bg-white rounded-[32px] p-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[20px] font-bold text-[#1A1A1A]">대표 영상</h2>
            <Link href="/showreel" className="flex items-center gap-1.5 text-[14px] text-[#888888] hover:text-[#1A1A1A] transition-colors">
              <Pencil size={13} />
              수정하기
            </Link>
          </div>
          {(actor?.showreels ?? []).length === 0 ? (
            <p className="text-[#888888]">등록된 영상이 없어요.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {(actor?.showreels ?? []).map((reel) => (
                <Link key={reel.id} href={`/showreel/${reel.id}`} className="block group">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#1A1A1A]">
                    <video
                      src={reel.videoUrl}
                      preload="metadata"
                      className="w-full h-full object-cover"
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Play size={18} className="text-[#1A1A1A] ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 px-0.5">
                    <p className="text-[15px] font-medium text-[#1A1A1A]">{reel.title}</p>
                    {reel.duration && (
                      <p className="text-[13px] text-[#888888]">{formatDuration(reel.duration)}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 하단 배너 */}
        <section className="bg-white rounded-[32px] overflow-hidden">
          <div className="flex items-center gap-4 px-8 py-5 border-b border-[#F5F5F5] hover:bg-[#FAFAFA] cursor-pointer transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#FFF0F0] flex items-center justify-center flex-shrink-0">
              <Pencil size={16} className="text-[#E53935]" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#1A1A1A]">프리미엄 포트폴리오 꾸미기</p>
              <p className="text-[13px] text-[#888888]">템플릿 디자인에서 각 섹션별로 포트폴리오를 꾸며보세요</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-8 py-5 hover:bg-[#FAFAFA] cursor-pointer transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#FFF0F0] flex items-center justify-center flex-shrink-0">
              <Play size={16} className="text-[#E53935]" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#1A1A1A]">프로필 상담 논옴</p>
              <p className="text-[13px] text-[#888888]">광고로 출연 시설이 다바여서 나를 함께 보세요</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
