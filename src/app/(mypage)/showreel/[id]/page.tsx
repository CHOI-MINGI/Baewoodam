"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ShowreelItem } from '@/types';

export default function ShowreelEditPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [reel, setReel] = useState<ShowreelItem | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetch('/api/showreel')
      .then((r) => r.json())
      .then((items: ShowreelItem[]) => {
        const found = items.find((r) => r.id === id);
        if (found) {
          setReel(found);
          setTitle(found.title);
          setDescription(found.description ?? '');
          setTags(found.tags ?? []);
        }
        setInitialLoading(false);
      });
  }, [id]);

  const addTag = () => {
    const raw = tagInput.split(/[,，\s]+/).map((t) => t.replace(/^#/, '').trim()).filter(Boolean);
    setTags((prev) => [...new Set([...prev, ...raw])]);
    setTagInput('');
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setLoading(true);
    await fetch(`/api/showreel/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: description || null, tags }),
    });
    setLoading(false);
    router.push('/showreel');
  };

  const handleDelete = async () => {
    if (!confirm('삭제하시겠어요?')) return;
    await fetch(`/api/showreel/${id}`, { method: 'DELETE' });
    router.push('/showreel');
  };

  if (initialLoading) return <div className="min-h-screen animate-pulse bg-[#F5F5F5]" />;
  if (!reel) return <div className="flex items-center justify-center min-h-screen text-[#888888]">영상을 찾을 수 없어요.</div>;

  return (
    <div className="flex flex-col min-h-screen px-5 pb-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 py-3 mb-4">
        <button onClick={() => router.back()} className="text-xl text-[#1A1A1A]">←</button>
        <h1 className="text-[16px] font-semibold text-[#1A1A1A]">쇼릴 편집</h1>
      </div>

      {/* 영상 플레이어 */}
      {reel.videoUrl && (
        <div className="w-full rounded-xl overflow-hidden bg-black mb-6">
          <video
            src={reel.videoUrl}
            controls
            className="w-full aspect-video"
            playsInline
          />
        </div>
      )}

      <div className="flex flex-col gap-5 flex-1">
        {/* 제목 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">쇼릴 제목</label>
          <div className="flex items-center border-b border-[#E0E0E0] pb-2 gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력해 주세요."
              className="flex-1 text-[15px] outline-none text-[#1A1A1A] placeholder:text-[#D9D9D9] bg-transparent"
            />
            {title && (
              <button type="button" onClick={() => setTitle('')}>
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
            className="w-full text-[15px] outline-none border-b border-[#E0E0E0] pb-2 resize-none placeholder:text-[#D9D9D9] bg-transparent"
          />
        </div>

        {/* 태그 */}
        <div>
          <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">태그 입력</label>
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onBlur={addTag}
            onKeyDown={(e) => e.key === 'Enter' && addTag()}
            placeholder="#액션쇼릴 #감정연기 (쉼표로 구분)"
            className="w-full text-[15px] outline-none border-b border-[#E0E0E0] pb-2 placeholder:text-[#D9D9D9] bg-transparent"
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

      <div className="flex gap-3 pt-8">
        <button
          onClick={handleDelete}
          className="flex-1 h-[52px] rounded-full border border-[#E0E0E0] text-[#888888] text-[15px] font-semibold"
        >
          삭제하기
        </button>
        <button
          disabled={!title.trim() || loading}
          onClick={handleSave}
          className={cn(
            'flex-1 h-[52px] rounded-full text-[15px] font-semibold transition-colors',
            title.trim() && !loading ? 'bg-[#1A1A2E] text-white' : 'bg-[#D9D9D9] text-[#999999]',
          )}
        >
          {loading ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  );
}
