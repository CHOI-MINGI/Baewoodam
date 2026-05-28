"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import UploadProgress from '@/components/shared/UploadProgress';
import type { FilmographyItem } from '@/types';

interface VideoFile {
  file: File;
  progress: number;
  url?: string;
}

export default function ShowreelNewPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [relatedFilmo, setRelatedFilmo] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [filmographies, setFilmographies] = useState<FilmographyItem[]>([]);
  const [loading, setLoading] = useState(false);

  const isReady = videos.length > 0 && videos.every((v) => v.progress >= 100) && title.trim();

  useEffect(() => {
    fetch('/api/filmography')
      .then((r) => r.json())
      .then((d) => setFilmographies(d ?? []));
  }, []);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newVideos: VideoFile[] = files.map((f) => ({ file: f, progress: 0 }));
    setVideos((prev) => [...prev, ...newVideos]);

    newVideos.forEach((v, idx) => {
      simulateUpload(videos.length + idx);
    });
  };

  // 실제 업로드는 /api/showreel에서 처리하므로 여기서는 진행률 시뮬레이션
  const simulateUpload = (idx: number) => {
    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setVideos((prev) => {
        const next = [...prev];
        if (next[idx]) next[idx] = { ...next[idx], progress: Math.min(p, 100) };
        return next;
      });
      if (p >= 100) clearInterval(interval);
    }, 200);
  };

  const removeVideo = (idx: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== idx));
  };

  const addTag = () => {
    const raw = tagInput.split(/[,，\s]+/).map((t) => t.replace(/^#/, '').trim()).filter(Boolean);
    setTags((prev) => [...new Set([...prev, ...raw])]);
    setTagInput('');
  };

  const handleSubmit = async () => {
    if (!isReady) return;
    setLoading(true);

    const formData = new FormData();
    videos.forEach((v) => formData.append('files', v.file));
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', JSON.stringify(tags));
    if (relatedFilmo) formData.append('filmographyId', relatedFilmo);

    const res = await fetch('/api/showreel', { method: 'POST', body: formData });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(`업로드 실패: ${err.error ?? '서버 오류'}`);
      return;
    }
    router.refresh();
    router.push('/showreel');
  };

  return (
    <div className="flex flex-col min-h-screen px-5 pb-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 py-3 mb-4">
        <button onClick={() => router.back()} className="text-xl text-[#1A1A1A]">←</button>
        <h1 className="text-[16px] font-semibold text-[#1A1A1A]">새 쇼릴 추가</h1>
      </div>

      <div className="flex flex-col gap-5 flex-1">
        {/* 영상 업로드 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-2 block">영상 파일 업로드</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-[#E0E0E0] rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer"
          >
            <Upload size={24} className="text-[#888888]" />
            <p className="text-[14px] text-[#888888]">파일을 업로드 해주세요</p>
            <p className="text-[12px] text-[#BBBBBB]">mp4, mov 파일 형식</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/quicktime"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
        </div>

        {/* 업로드된 파일 목록 */}
        {videos.length > 0 && (
          <div className="flex flex-col gap-2">
            {videos.map((v, i) => (
              <UploadProgress
                key={i}
                filename={v.file.name}
                size={v.file.size}
                progress={v.progress}
                onRemove={() => removeVideo(i)}
              />
            ))}
          </div>
        )}

        {/* 쇼릴 제목 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">쇼릴 제목</label>
          <div className="flex items-center border-b border-[#E0E0E0] pb-2 gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력해 주세요."
              className="flex-1 text-[15px] outline-none placeholder:text-[#D9D9D9]"
            />
            {title && (
              <button onClick={() => setTitle('')}>
                <X size={16} className="text-[#888888]" />
              </button>
            )}
          </div>
        </div>

        {/* 설명 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="영상에 대한 설명을 자유롭게 작성해 주세요."
            rows={3}
            className="w-full text-[15px] outline-none border-b border-[#E0E0E0] pb-2 resize-none placeholder:text-[#D9D9D9]"
          />
        </div>

        {/* 관련 작품 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">관련 작품</label>
          <select
            value={relatedFilmo}
            onChange={(e) => setRelatedFilmo(e.target.value)}
            className="w-full text-[15px] outline-none border-b border-[#E0E0E0] pb-2 bg-transparent text-[#1A1A1A]"
          >
            <option value="">작품 선택</option>
            {filmographies.map((f) => (
              <option key={f.id} value={f.id}>{f.title} ({f.year})</option>
            ))}
          </select>
        </div>

        {/* 태그 입력 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">태그 입력</label>
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onBlur={addTag}
            onKeyDown={(e) => e.key === 'Enter' && addTag()}
            placeholder="#액션쇼릴 #감정연기 (쉼표로 구분)"
            className="w-full text-[15px] outline-none border-b border-[#E0E0E0] pb-2 placeholder:text-[#D9D9D9]"
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#E0E0E0] text-[13px] text-[#1A1A1A]"
                >
                  #{tag}
                  <button onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}>
                    <X size={12} className="text-[#888888]" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-8">
        <button
          disabled={!isReady || loading}
          onClick={handleSubmit}
          className={cn(
            'w-full h-[52px] rounded-full text-[15px] font-semibold transition-colors',
            isReady && !loading ? 'bg-[#1A1A2E] text-white' : 'bg-[#D9D9D9] text-[#999999]',
          )}
        >
          {loading ? '업로드 중...' : '추가하기'}
        </button>
      </div>
    </div>
  );
}
