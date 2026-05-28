"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Camera, Play } from 'lucide-react';
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
  const [actor, setActor] = useState<ActorDetail & { coverImage?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const coverRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/users/me')
      .then((r) => r.json())
      .then(async (user) => {
        if (!user?.id) { setLoading(false); return; }
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
    const url = await uploadImageFile(file, 'profiles');
    await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coverImage: url }),
    });
    setActor((prev) => prev ? { ...prev, coverImage: url } : prev);
  };

  if (loading) return <div className="min-h-screen animate-pulse bg-[#F5F5F5]" />;

  const filmoByYear = (actor?.filmographies ?? []).reduce<Record<number, ActorDetail['filmographies']>>(
    (acc, f) => { if (!acc[f.year]) acc[f.year] = []; acc[f.year].push(f); return acc; },
    {} as Record<number, ActorDetail['filmographies']>,
  );
  const sortedYears = Object.keys(filmoByYear).map(Number).sort((a, b) => b - a);

  const formatDuration = (sec: number | null) => {
    if (!sec) return '';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 배경 히어로 */}
      <div className="relative w-full h-[320px] bg-[#1A1A1A]">
        {actor?.coverImage ? (
          <Image src={actor.coverImage} alt="배경" fill className="object-cover opacity-80" />
        ) : actor?.image ? (
          <Image src={actor.image} alt="배경" fill className="object-cover opacity-70" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* 배경 사진 변경 버튼 */}
        <button
          onClick={() => coverRef.current?.click()}
          className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/40 text-white text-[12px] px-3 py-1.5 rounded-full"
        >
          <Camera size={14} />
          배경 사진
        </button>
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />

        {/* 하단 정보 */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <h2 className="text-[26px] font-bold text-white leading-tight">{actor?.name ?? '이름 없음'}</h2>
          <p className="text-[13px] text-white/70 mt-0.5">
            {actor?.ageRange ? (AGE_RANGE_MAP as any)[actor.ageRange] : ''}{actor?.ageRange ? ' · ' : ''}필모 {actor?.filmographyCount ?? 0}편
          </p>
          {actor?.bio && (
            <p className="text-[13px] text-white/60 mt-1 line-clamp-2">{actor.bio}</p>
          )}
          <div className="flex gap-2 mt-3">
            <Link
              href="/profile-edit"
              className="px-4 py-1.5 rounded-full border border-white text-white text-[13px] font-medium"
            >
              수정하기
            </Link>
            <button className="px-4 py-1.5 rounded-full bg-[#E53935] text-white text-[13px] font-medium">
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
                  <p className="text-[13px] font-semibold text-[#888888] mb-3">{year}</p>
                  <div className="flex flex-col gap-4">
                    {filmoByYear[year].map((film) => (
                      <div key={film.id} className="flex gap-3 items-start">
                        {/* 포스터 */}
                        <div className="w-[52px] h-[72px] rounded-lg overflow-hidden bg-[#F5F5F5] flex-shrink-0">
                          {film.thumbnailUrl
                            ? <Image src={film.thumbnailUrl} alt={film.title} width={52} height={72} className="object-cover w-full h-full" />
                            : <div className="w-full h-full bg-[#E0E0E0]" />}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <span className="text-[11px] text-[#888888] bg-[#F5F5F5] px-2 py-0.5 rounded">
                            {(MEDIA_TYPE_MAP as any)[film.mediaType] ?? film.mediaType}
                          </span>
                          <p className="text-[14px] font-semibold text-[#1A1A1A] mt-1.5">{film.title}</p>
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
            <Link href="/skills" className="text-[13px] text-[#888888]">수정하기</Link>
          </div>
          {(actor?.skills ?? []).length === 0 ? (
            <p className="text-[14px] text-[#888888]">등록된 스킬이 없어요.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(actor?.skills ?? []).map((skill) => (
                <span key={skill} className="px-3 py-1.5 rounded-full border border-[#E0E0E0] text-[13px] text-[#1A1A1A]">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* 대표 영상 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[16px] font-bold text-[#1A1A1A]">대표 영상</h3>
            <Link href="/showreel" className="text-[13px] text-[#888888]">수정하기</Link>
          </div>
          {(actor?.showreels ?? []).length === 0 ? (
            <p className="text-[14px] text-[#888888]">등록된 영상이 없어요.</p>
          ) : (
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
                  <div className="px-3 py-2 flex items-center justify-between">
                    <p className="text-[14px] font-medium text-[#1A1A1A]">{reel.title}</p>
                    {reel.duration && (
                      <p className="text-[12px] text-[#888888]">{formatDuration(reel.duration)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="h-8" />
      </div>
    </div>
  );
}
