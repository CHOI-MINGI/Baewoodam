"use client";

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import UploadProgress from '@/components/shared/UploadProgress';

interface VideoFile {
  file: File;
  progress: number;
}

export default function CastingAcceptPage() {
  const { id: offerId } = useParams<{ id: string }>();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const allUploaded = videos.length > 0 && videos.every((v) => v.progress >= 100);
  const isReady = allUploaded;

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newVideos = files.map((f) => ({ file: f, progress: 0 }));
    setVideos((prev) => [...prev, ...newVideos]);
    newVideos.forEach((_, idx) => simulateUpload(videos.length + idx));
  };

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

  const removeVideo = (idx: number) => setVideos((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!isReady) return;
    setLoading(true);

    const formData = new FormData();
    videos.forEach((v) => formData.append('files', v.file));
    formData.append('note', note);

    await fetch(`/api/casting/${offerId}/audition`, { method: 'POST', body: formData });
    setLoading(false);
    router.push('/casting');
  };

  return (
    <div className="flex flex-col min-h-screen px-5 pb-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 py-3 mb-4">
        <button onClick={() => router.back()} className="text-xl text-[#1A1A1A]">←</button>
        <h1 className="text-[16px] font-semibold text-[#1A1A1A]">캐스팅 제안 수락</h1>
      </div>

      <div className="flex flex-col gap-6 flex-1">
        {/* 오디션 영상 제출 */}
        <section>
          <h2 className="text-[15px] font-bold text-[#1A1A1A] mb-3">오디션 영상 제출</h2>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-[#E0E0E0] rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer mb-3"
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
        </section>

        {/* 기타 정보 */}
        <section>
          <h2 className="text-[15px] font-bold text-[#1A1A1A] mb-3">기타 정보</h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="추가로 전달하고 싶은 내용을 자유롭게 작성해 주세요&#10;(ex. 스케줄 관련 참고 사항, 기타 코멘트 등)"
            rows={5}
            className="w-full text-[15px] outline-none border border-[#E0E0E0] rounded-xl p-3 resize-none placeholder:text-[#D9D9D9] bg-[#F5F5F5]"
          />
        </section>
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
          {loading ? '제출 중...' : '제출하기'}
        </button>
      </div>
    </div>
  );
}
