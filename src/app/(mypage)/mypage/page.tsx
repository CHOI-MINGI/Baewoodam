"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Pencil, Play, Settings, ExternalLink, X } from 'lucide-react';
import { AGE_RANGE_MAP, MEDIA_TYPE_MAP, ROLE_MAP } from '@/constants';
import ImageCropper from '@/components/shared/ImageCropper';
import type { ActorDetail, FilmographyItem, FeaturedWork } from '@/types';

async function uploadImageFile(file: File, bucket: string): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('bucket', bucket);
  const res = await fetch('/api/upload/image', { method: 'POST', body: form });
  if (!res.ok) throw new Error('upload failed');
  return (await res.json()).url;
}

export default function MypagePage() {
  const [actor, setActor] = useState<ActorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [selectedFilmo, setSelectedFilmo] = useState<FilmographyItem | null>(null);
  const [coverCropSrc, setCoverCropSrc] = useState<string | null>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/users/me')
      .then((r) => r.json())
      .then(async (user) => {
        if (!user?.id) return setLoading(false);
        setIsPublic(user.isPublic ?? true);
        const res = await fetch(`/api/actors/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setActor({ ...data, coverImage: user.coverImage ?? null });
        }
        setLoading(false);
      });
  }, []);

  const handleTogglePublic = async () => {
    const next = !isPublic;
    setIsPublic(next);
    await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic: next }),
    });
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setCoverCropSrc(URL.createObjectURL(file));
  };

  const handleCoverCropConfirm = async (blob: Blob) => {
    setCoverCropSrc(null);
    if (!actor) return;
    try {
      const croppedFile = new File([blob], 'cover.jpg', { type: 'image/jpeg' });
      const url = await uploadImageFile(croppedFile, 'profiles');
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

  const filmoByYear = (actor?.filmographies ?? []).reduce<Record<number, ActorDetail['filmographies']>>(
    (acc, f) => { if (!acc[f.year]) acc[f.year] = []; acc[f.year].push(f); return acc; },
    {} as Record<number, ActorDetail['filmographies']>,
  );
  const sortedYears = Object.keys(filmoByYear).map(Number).sort((a, b) => b - a);

  const featuredWorks: FeaturedWork[] = actor?.featuredWorks ?? [];
  const showreels = actor?.showreels ?? [];
  const hasRepVideo = featuredWorks.length > 0 || showreels.length > 0;

  if (loading) return <div className="min-h-screen bg-[#F5F5F5]" />;

  if (coverCropSrc) {
    return (
      <ImageCropper
        imageSrc={coverCropSrc}
        aspect={16 / 9}
        onConfirm={handleCoverCropConfirm}
        onCancel={() => setCoverCropSrc(null)}
      />
    );
  }

  return (
    <div className="bg-[#F5F5F5] min-h-screen">

      {/* 상단 타이틀 */}
      <div className="flex items-center justify-between px-8 pt-8 pb-2">
        <h1 className="text-[20px] font-bold text-[#1A1A1A]">프로필/포트폴리오</h1>
        <Link href="/settings">
          <Settings size={22} className="text-[#1A1A1A]" />
        </Link>
      </div>

      {/* 공개/비공개 토글 */}
      <div className="mx-8 mb-3 flex items-center justify-between bg-white rounded-2xl px-5 py-3">
        <div>
          <p className="text-[13px] font-medium text-[#1A1A1A]">
            {isPublic ? '포트폴리오가 공개되어 있습니다' : '포트폴리오가 비공개 상태입니다'}
          </p>
          <p className="text-[11px] text-[#888888] mt-0.5">
            {isPublic ? '다른 사람이 내 프로필을 볼 수 있어요' : '나만 볼 수 있어요'}
          </p>
        </div>
        <button
          onClick={handleTogglePublic}
          className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${isPublic ? 'bg-[#1A1A2E]' : 'bg-[#CCCCCC]'}`}
        >
          <span className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform ${isPublic ? 'translate-x-[22px]' : 'translate-x-0'}`} />
        </button>
      </div>

      <div className="max-w-[1200px] mx-auto px-8 pb-12 space-y-5">

        {/* 히어로 카드 */}
        <section className="relative w-full rounded-[16px] overflow-hidden bg-[#1A1A1A]" style={{ aspectRatio: '16/9' }}>
          {actor?.coverImage && (
            <Image src={actor.coverImage} alt="" fill className="object-cover object-center" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <button
            onClick={() => coverRef.current?.click()}
            className="absolute top-5 right-5 flex items-center gap-1.5 bg-black/40 text-white text-[12px] px-3 py-1.5 rounded-sm backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <Pencil size={12} />
            배경 사진
          </button>
          <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />

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
                      <button
                        key={film.id}
                        onClick={() => setSelectedFilmo(film)}
                        className="flex gap-4 items-start text-left hover:bg-[#FAFAFA] rounded-xl p-1 -m-1 transition-colors"
                      >
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
                      </button>
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
                <span key={skill} className="px-4 py-2 rounded-full bg-[#EEEEEE] text-[14px] text-[#1A1A1A]">{skill}</span>
              ))}
            </div>
          )}
        </section>

        {/* 대표 영상 */}
        <section className="bg-white rounded-[32px] p-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[20px] font-bold text-[#1A1A1A]">대표 영상</h2>
            <Link href="/works" className="flex items-center gap-1.5 text-[14px] text-[#888888] hover:text-[#1A1A1A] transition-colors">
              <Pencil size={13} />
              수정하기
            </Link>
          </div>

          {!hasRepVideo ? (
            <p className="text-[#888888]">등록된 영상이 없어요.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {/* 대표작품 (isFeatured=true Works) */}
              {featuredWorks.map((work) => {
                const isYouTube = work.youtubeUrl.includes('youtube.com') || work.youtubeUrl.includes('youtu.be');
                return (
                  <div key={work.id} className="group">
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#1A1A1A]">
                      {work.thumbnailUrl && (
                        <Image src={work.thumbnailUrl} alt={work.title} fill className="object-cover opacity-90" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <Play size={18} className="text-[#1A1A1A] ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute top-2 left-2 bg-[#E53935] text-white text-[10px] px-2 py-0.5 rounded-full font-medium">대표</span>
                    </div>
                    <div className="mt-2 px-0.5 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[15px] font-medium text-[#1A1A1A] truncate">{work.title}</p>
                        <p className="text-[13px] text-[#888888]">{[work.genre, work.year].filter(Boolean).join(' · ')}</p>
                      </div>
                      {isYouTube && (
                        <a href={work.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 mt-0.5">
                          <ExternalLink size={15} className="text-[#888888] hover:text-[#E53935]" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* 쇼릴 */}
              {showreels.map((reel) => (
                <Link key={reel.id} href={`/showreel/${reel.id}`} className="block group">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#1A1A1A]">
                    {reel.thumbnailUrl && (
                      <Image src={reel.thumbnailUrl} alt={reel.title} fill className="object-cover opacity-90" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Play size={18} className="text-[#1A1A1A] ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 px-0.5">
                    <p className="text-[15px] font-medium text-[#1A1A1A]">{reel.title}</p>
                    {reel.duration && <p className="text-[13px] text-[#888888]">{formatDuration(reel.duration)}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* 필모그래피 상세 모달 */}
      {selectedFilmo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setSelectedFilmo(null)}>
          <div
            className="bg-white w-full max-w-[430px] mx-auto rounded-t-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 포스터 + 헤더 */}
            <div className="relative">
              {selectedFilmo.thumbnailUrl ? (
                <div className="relative w-full h-[200px]">
                  <Image src={selectedFilmo.thumbnailUrl} alt={selectedFilmo.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5 text-white">
                    <p className="text-[12px] text-white/70">
                      {(MEDIA_TYPE_MAP as any)[selectedFilmo.mediaType]} · {selectedFilmo.year}
                    </p>
                    <h3 className="text-[20px] font-bold mt-0.5">{selectedFilmo.title}</h3>
                    <p className="text-[13px] text-white/80 mt-0.5">
                      {(ROLE_MAP as any)[selectedFilmo.role]}{selectedFilmo.characterName ? ` · ${selectedFilmo.characterName}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFilmo(null)}
                    className="absolute top-4 right-4 bg-black/40 rounded-full p-1.5"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-5 py-5">
                  <div>
                    <p className="text-[12px] text-[#888888]">
                      {(MEDIA_TYPE_MAP as any)[selectedFilmo.mediaType]} · {selectedFilmo.year}
                    </p>
                    <h3 className="text-[20px] font-bold text-[#1A1A1A] mt-0.5">{selectedFilmo.title}</h3>
                    <p className="text-[13px] text-[#888888] mt-0.5">
                      {(ROLE_MAP as any)[selectedFilmo.role]}{selectedFilmo.characterName ? ` · ${selectedFilmo.characterName}` : ''}
                    </p>
                  </div>
                  <button onClick={() => setSelectedFilmo(null)}>
                    <X size={20} className="text-[#888888]" />
                  </button>
                </div>
              )}
            </div>

            {/* 영상 (youtubeUrl이 있을 때) */}
            {selectedFilmo.youtubeUrl && (() => {
              const isYT = selectedFilmo.youtubeUrl!.includes('youtube.com') || selectedFilmo.youtubeUrl!.includes('youtu.be');
              return isYT ? (
                <a
                  href={selectedFilmo.youtubeUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-5 mt-3 flex items-center justify-center gap-2 h-[44px] rounded-xl bg-[#FF0000] text-white text-[14px] font-semibold"
                >
                  <ExternalLink size={15} />
                  유튜브에서 보기
                </a>
              ) : (
                <div className="mx-5 mt-3 rounded-xl overflow-hidden bg-[#1A1A1A] aspect-video">
                  <video src={selectedFilmo.youtubeUrl!} controls className="w-full h-full" playsInline />
                </div>
              );
            })()}

            {/* 상세 정보 */}
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

            {/* 편집 버튼 */}
            <div className="px-5 pb-6">
              <Link
                href={`/filmography/${selectedFilmo.id}`}
                onClick={() => setSelectedFilmo(null)}
                className="w-full h-[48px] flex items-center justify-center rounded-full border border-[#E0E0E0] text-[14px] font-medium text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors"
              >
                <Pencil size={14} className="mr-2" />
                수정하기
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
