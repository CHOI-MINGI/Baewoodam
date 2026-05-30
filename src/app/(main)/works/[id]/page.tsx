"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ExternalLink, Trash2, Pencil, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkCredit {
  id: string;
  role: string;
  name: string;
  linkedUserId: string | null;
  linkedUser: { id: string; name: string; image: string | null } | null;
}

interface Work {
  id: string;
  youtubeUrl: string;
  videoId: string;
  title: string;
  thumbnailUrl: string | null;
  channelTitle: string | null;
  genre: string | null;
  year: number | null;
  description: string | null;
  myRole: string | null;
  isFeatured: boolean;
  isPublic: boolean;
  credits: WorkCredit[];
}

export default function WorkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editTitle, setEditTitle] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editMyRole, setEditMyRole] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editIsFeatured, setEditIsFeatured] = useState(false);

  useEffect(() => {
    fetch(`/api/works/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => setWork(data))
      .catch((e) => console.error('작품 상세 로딩 실패:', e))
      .finally(() => setLoading(false));
  }, [id]);

  const startEdit = () => {
    if (!work) return;
    setEditTitle(work.title);
    setEditGenre(work.genre ?? '');
    setEditYear(work.year ? String(work.year) : '');
    setEditMyRole(work.myRole ?? '');
    setEditDescription(work.description ?? '');
    setEditIsPublic(work.isPublic);
    setEditIsFeatured(work.isFeatured);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!work) return;
    setSaving(true);
    const res = await fetch(`/api/works/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editTitle,
        genre: editGenre || null,
        year: editYear ? Number(editYear) : null,
        myRole: editMyRole || null,
        description: editDescription || null,
        isPublic: editIsPublic,
        isFeatured: editIsFeatured,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setWork((prev) => prev ? { ...prev, ...updated, credits: prev.credits } : prev);
      setEditing(false);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('작품을 삭제하시겠어요? 연결된 필모그래피도 함께 삭제됩니다.')) return;
    setDeleting(true);
    await fetch(`/api/works/${id}`, { method: 'DELETE' });
    router.push('/works');
  };

  if (loading) return <div className="min-h-screen bg-[#F5F5F5] animate-pulse" />;
  if (!work) return <div className="min-h-screen flex items-center justify-center"><p className="text-[#888888]">작품을 찾을 수 없어요.</p></div>;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* 썸네일/영상 영역 */}
      {(() => {
        const isYouTube = work.youtubeUrl.includes('youtube.com') || work.youtubeUrl.includes('youtu.be');
        return (
          <div className="relative w-full aspect-video bg-[#1A1A1A]">
            {isYouTube ? (
              work.thumbnailUrl && (
                <Image src={work.thumbnailUrl} alt={work.title} fill className="object-cover" />
              )
            ) : (
              <video
                src={work.youtubeUrl}
                controls
                className="w-full h-full object-contain"
                playsInline
              />
            )}
            {isYouTube && <div className="absolute inset-0 bg-black/30" />}
            <button onClick={() => router.back()} className="absolute top-4 left-4 bg-black/50 rounded-full p-2 z-10">
              <X size={18} className="text-white" />
            </button>
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button onClick={startEdit} className="bg-black/50 rounded-full p-2">
                <Pencil size={18} className="text-white" />
              </button>
              <button onClick={handleDelete} disabled={deleting} className="bg-black/50 rounded-full p-2">
                <Trash2 size={18} className="text-white" />
              </button>
            </div>
            {isYouTube && (
              <a
                href={work.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-[#FF0000] text-white text-[13px] font-medium px-3 py-1.5 rounded-full z-10"
              >
                <ExternalLink size={13} />
                유튜브에서 보기
              </a>
            )}
          </div>
        );
      })()}

      {/* 작품 정보 */}
      <div className="px-5 py-5 bg-white space-y-4">
        {/* 제목 + 뱃지 */}
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-[20px] font-bold text-[#1A1A1A] flex-1 min-w-0">{work.title}</h1>
          <div className="flex gap-1.5 flex-shrink-0 mt-0.5">
            {work.isFeatured && (
              <span className="bg-[#FFF0F0] text-[#E53935] text-[11px] px-2.5 py-1 rounded-full font-medium">대표</span>
            )}
            {!work.isPublic && (
              <span className="bg-[#F0F0F0] text-[#888888] text-[11px] px-2.5 py-1 rounded-full">비공개</span>
            )}
          </div>
        </div>

        {/* 상세 필드 */}
        <div className="space-y-2.5">
          {work.genre && (
            <div className="flex gap-3">
              <span className="text-[12px] text-[#888888] w-16 flex-shrink-0 pt-0.5">장르</span>
              <span className="text-[14px] text-[#1A1A1A]">{work.genre}</span>
            </div>
          )}
          {work.year && (
            <div className="flex gap-3">
              <span className="text-[12px] text-[#888888] w-16 flex-shrink-0 pt-0.5">제작연도</span>
              <span className="text-[14px] text-[#1A1A1A]">{work.year}</span>
            </div>
          )}
          {work.myRole && (
            <div className="flex gap-3">
              <span className="text-[12px] text-[#888888] w-16 flex-shrink-0 pt-0.5">본인 역할</span>
              <span className="text-[14px] text-[#1A1A1A]">{work.myRole}</span>
            </div>
          )}
          {work.description && (
            <div className="flex gap-3">
              <span className="text-[12px] text-[#888888] w-16 flex-shrink-0 pt-0.5">설명</span>
              <p className="text-[14px] text-[#1A1A1A] leading-relaxed flex-1">{work.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* 크레딧 */}
      {work.credits.length > 0 && (
        <div className="mt-3 bg-white px-5 py-5">
          <h2 className="text-[16px] font-bold text-[#1A1A1A] mb-4">크레딧</h2>
          <div className="flex flex-col gap-3">
            {work.credits.map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="text-[12px] text-[#888888] w-14 flex-shrink-0">{c.role}</span>
                <div className="flex items-center gap-2">
                  {c.linkedUser?.image && (
                    <Image src={c.linkedUser.image} alt="" width={24} height={24} className="rounded-full" />
                  )}
                  <span className="text-[14px] text-[#1A1A1A]">{c.name}</span>
                  {c.linkedUserId && <Check size={13} className="text-[#1A1A2E]" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 편집 모달 */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full max-w-[430px] mx-auto rounded-t-2xl px-5 py-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[17px] font-bold text-[#1A1A1A]">작품 정보 수정</h2>
              <button onClick={() => setEditing(false)}><X size={20} className="text-[#888888]" /></button>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { label: '제목', value: editTitle, onChange: setEditTitle, placeholder: '작품 제목' },
                { label: '장르', value: editGenre, onChange: setEditGenre, placeholder: '장르' },
                { label: '제작연도', value: editYear, onChange: setEditYear, placeholder: '연도', type: 'number' },
                { label: '본인 역할', value: editMyRole, onChange: setEditMyRole, placeholder: '역할' },
              ].map(({ label, value, onChange, placeholder, type }) => (
                <div key={label}>
                  <label className="text-[12px] font-medium text-[#888888] mb-1 block">{label}</label>
                  <input
                    type={type ?? 'text'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full border-b border-[#E0E0E0] pb-2 text-[15px] outline-none text-[#1A1A1A] placeholder:text-[#D9D9D9] bg-transparent"
                  />
                </div>
              ))}

              <div>
                <label className="text-[12px] font-medium text-[#888888] mb-1 block">작품 설명</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full border-b border-[#E0E0E0] pb-2 text-[15px] outline-none text-[#1A1A1A] placeholder:text-[#D9D9D9] bg-transparent resize-none"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-[#F0F0F0]">
                <div>
                  <p className="text-[14px] text-[#1A1A1A]">대표작품 설정</p>
                  <p className="text-[11px] text-[#888888] mt-0.5">프로필에서 가장 먼저 노출됩니다</p>
                </div>
                <button
                  onClick={() => setEditIsFeatured(!editIsFeatured)}
                  className={cn('w-12 h-6 rounded-full transition-colors relative flex-shrink-0', editIsFeatured ? 'bg-[#E53935]' : 'bg-[#CCCCCC]')}
                >
                  <span className={cn('absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform', editIsFeatured ? 'translate-x-[22px]' : 'translate-x-0')} />
                </button>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-[14px] text-[#1A1A1A]">공개 여부</span>
                <button
                  onClick={() => setEditIsPublic(!editIsPublic)}
                  className={cn('w-12 h-6 rounded-full transition-colors relative', editIsPublic ? 'bg-[#1A1A2E]' : 'bg-[#CCCCCC]')}
                >
                  <span className={cn('absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform', editIsPublic ? 'translate-x-[22px]' : 'translate-x-0')} />
                </button>
              </div>
            </div>

            <button
              disabled={saving || !editTitle.trim()}
              onClick={handleSave}
              className="w-full mt-6 h-[52px] rounded-full bg-[#1A1A2E] text-white text-[15px] font-semibold disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
