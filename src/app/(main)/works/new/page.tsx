"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, Search, Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OEmbedData {
  title: string;
  thumbnail_url: string;
  author_name: string;
}

interface Credit {
  role: string;
  name: string;
  linkedUserId?: string | null;
  linkedUser?: { id: string; name: string; image: string | null } | null;
}

interface UserSearchResult {
  id: string;
  name: string;
  image: string | null;
}

const CREDIT_ROLES = ['감독', '배우', '촬영', '편집', '음악', '기타'];

function extractVideoId(url: string): string | null {
  const patterns = [
    /[?&]v=([^&#]+)/,
    /youtu\.be\/([^?&#]+)/,
    /embed\/([^?&#]+)/,
    /shorts\/([^?&#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function WorksNewPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1
  const [urlInput, setUrlInput] = useState('');
  const [oembedData, setOembedData] = useState<OEmbedData | null>(null);
  const [videoId, setVideoId] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState('');

  // Step 2
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [myRole, setMyRole] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  // Step 3
  const [credits, setCredits] = useState<Credit[]>([]);
  const [creditRole, setCreditRole] = useState('');
  const [creditName, setCreditName] = useState('');
  const [linkedUser, setLinkedUser] = useState<UserSearchResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCheckUrl = async () => {
    const vid = extractVideoId(urlInput.trim());
    if (!vid) { setUrlError('유효한 유튜브 URL을 입력해주세요.'); return; }
    setUrlLoading(true);
    setUrlError('');
    try {
      const res = await fetch(`/api/works/oembed?url=${encodeURIComponent(urlInput.trim())}`);
      if (!res.ok) throw new Error('영상 정보를 가져올 수 없습니다.');
      const data: OEmbedData = await res.json();
      setOembedData(data);
      setVideoId(vid);
      setTitle(data.title);
    } catch (e: any) {
      setUrlError(e.message);
    } finally {
      setUrlLoading(false);
    }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
    if (res.ok) setSearchResults(await res.json());
  };

  const addCredit = () => {
    if (!creditRole || !creditName.trim()) return;
    setCredits((prev) => [...prev, { role: creditRole, name: creditName.trim(), linkedUserId: linkedUser?.id ?? null, linkedUser }]);
    setCreditRole('');
    setCreditName('');
    setLinkedUser(null);
  };

  const removeCredit = (idx: number) => setCredits((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/works', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeUrl: urlInput.trim(),
          videoId,
          title,
          thumbnailUrl: oembedData?.thumbnail_url ?? null,
          channelTitle: oembedData?.author_name ?? null,
          genre: genre || null,
          year: year ? Number(year) : null,
          description: description || null,
          myRole: myRole || null,
          isPublic,
          credits: credits.map(({ role, name, linkedUserId }) => ({ role, name, linkedUserId })),
        }),
      });
      if (!res.ok) throw new Error('저장 실패');
      router.push('/works');
    } catch {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[#F0F0F0]">
        <button onClick={() => (step > 1 ? setStep(step - 1) : router.back())} className="text-xl text-[#1A1A1A]">←</button>
        <div className="flex-1">
          <h1 className="text-[16px] font-semibold text-[#1A1A1A]">작품 등록</h1>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div key={s} className={cn('w-2 h-2 rounded-full', s === step ? 'bg-[#1A1A2E]' : s < step ? 'bg-[#1A1A2E]/40' : 'bg-[#E0E0E0]')} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 py-6">
        {/* Step 1: URL 입력 */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-1">유튜브 URL 입력</h2>
              <p className="text-[13px] text-[#888888]">등록할 작품의 유튜브 링크를 붙여넣어 주세요</p>
            </div>

            <div className="flex gap-2">
              <input
                value={urlInput}
                onChange={(e) => { setUrlInput(e.target.value); setOembedData(null); }}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 border border-[#E0E0E0] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#1A1A2E]"
              />
              <button
                onClick={handleCheckUrl}
                disabled={!urlInput.trim() || urlLoading}
                className="bg-[#1A1A2E] text-white px-4 py-3 rounded-xl text-[14px] font-medium disabled:opacity-40"
              >
                {urlLoading ? '...' : '확인'}
              </button>
            </div>

            {urlError && <p className="text-[13px] text-[#E53935]">{urlError}</p>}

            {oembedData && (
              <div className="border border-[#E0E0E0] rounded-xl overflow-hidden">
                <div className="relative w-full aspect-video">
                  <Image src={oembedData.thumbnail_url} alt={oembedData.title} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <p className="text-[15px] font-semibold text-[#1A1A1A]">{oembedData.title}</p>
                  <p className="text-[13px] text-[#888888] mt-0.5">{oembedData.author_name}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: 작품 정보 */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-1">작품 정보 입력</h2>

            {[
              { label: '제목', value: title, onChange: setTitle, placeholder: '작품 제목', required: true },
              { label: '장르', value: genre, onChange: setGenre, placeholder: '예: 드라마, 로맨스' },
              { label: '제작연도', value: year, onChange: setYear, placeholder: String(new Date().getFullYear()), type: 'number' },
              { label: '본인 역할', value: myRole, onChange: setMyRole, placeholder: '예: 주연, 감독' },
            ].map(({ label, value, onChange, placeholder, required, type }) => (
              <div key={label}>
                <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">
                  {label}{required && <span className="text-[#E53935] ml-0.5">*</span>}
                </label>
                <div className="flex items-center border-b border-[#E0E0E0] pb-2 gap-2">
                  <input
                    type={type ?? 'text'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 text-[15px] outline-none text-[#1A1A1A] placeholder:text-[#D9D9D9] bg-transparent"
                  />
                  {value && <button type="button" onClick={() => onChange('')}><X size={16} className="text-[#888888]" /></button>}
                </div>
              </div>
            ))}

            <div>
              <label className="text-[13px] font-medium text-[#1A1A1A] mb-1 block">작품 설명</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="작품에 대한 설명을 입력해주세요"
                rows={3}
                className="w-full border-b border-[#E0E0E0] pb-2 text-[15px] outline-none text-[#1A1A1A] placeholder:text-[#D9D9D9] bg-transparent resize-none"
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-[#E0E0E0]">
              <div>
                <p className="text-[14px] font-medium text-[#1A1A1A]">공개 여부</p>
                <p className="text-[12px] text-[#888888]">{isPublic ? '다른 사람에게 공개됩니다' : '나만 볼 수 있습니다'}</p>
              </div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={cn('w-12 h-6 rounded-full transition-colors relative', isPublic ? 'bg-[#1A1A2E]' : 'bg-[#CCCCCC]')}
              >
                <span className={cn('absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform', isPublic ? 'translate-x-[22px]' : 'translate-x-0')} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 크레딧 */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-1">크레딧 등록</h2>
              <p className="text-[13px] text-[#888888]">함께한 크루를 등록하세요 (선택사항)</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {CREDIT_ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setCreditRole(r)}
                  className={cn(
                    'px-3 py-1.5 rounded-full border text-[13px] transition-colors',
                    creditRole === r ? 'border-[#1A1A2E] bg-[#1A1A2E] text-white' : 'border-[#E0E0E0] text-[#1A1A1A]',
                  )}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={creditName}
                onChange={(e) => setCreditName(e.target.value)}
                placeholder="이름"
                className="flex-1 border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-[#1A1A2E]"
              />
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-1 border border-[#E0E0E0] rounded-xl px-3 py-2.5 text-[13px] text-[#888888]"
              >
                <Search size={14} />
                연결
              </button>
            </div>

            {linkedUser && (
              <div className="flex items-center gap-2 bg-[#F5F5F5] rounded-xl px-4 py-2.5">
                {linkedUser.image && <Image src={linkedUser.image} alt="" width={24} height={24} className="rounded-full" />}
                <span className="text-[13px] text-[#1A1A1A]">{linkedUser.name}</span>
                <button onClick={() => setLinkedUser(null)} className="ml-auto"><X size={14} className="text-[#888888]" /></button>
              </div>
            )}

            <button
              onClick={addCredit}
              disabled={!creditRole || !creditName.trim()}
              className="w-full border border-dashed border-[#BBBBBB] rounded-xl py-2.5 text-[14px] text-[#888888] disabled:opacity-40"
            >
              + 크레딧 추가
            </button>

            {credits.length > 0 && (
              <div className="flex flex-col gap-2">
                {credits.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#F5F5F5] rounded-xl px-4 py-3">
                    <span className="text-[12px] font-medium text-[#888888] w-12">{c.role}</span>
                    <span className="text-[14px] text-[#1A1A1A] flex-1">{c.name}</span>
                    {c.linkedUser && <Check size={14} className="text-[#1A1A2E]" />}
                    <button onClick={() => removeCredit(i)}><X size={14} className="text-[#888888]" /></button>
                  </div>
                ))}
              </div>
            )}

            {showSearch && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
                <div className="bg-white w-full max-w-[430px] mx-auto rounded-t-2xl p-5">
                  <div className="flex items-center gap-2 border border-[#E0E0E0] rounded-xl px-4 py-2.5 mb-4">
                    <Search size={16} className="text-[#888888]" />
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="이름으로 검색"
                      className="flex-1 text-[14px] outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                    {searchResults.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => { setLinkedUser(u); setCreditName(u.name ?? ''); setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}
                        className="flex items-center gap-3 px-2 py-2 hover:bg-[#F5F5F5] rounded-xl text-left"
                      >
                        {u.image ? (
                          <Image src={u.image} alt="" width={32} height={32} className="rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#E0E0E0]" />
                        )}
                        <span className="text-[14px] text-[#1A1A1A]">{u.name}</span>
                      </button>
                    ))}
                    {searchQuery && searchResults.length === 0 && (
                      <p className="text-[13px] text-[#888888] text-center py-4">검색 결과가 없어요</p>
                    )}
                  </div>
                  <button onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }} className="w-full mt-4 py-3 text-[14px] text-[#888888]">
                    닫기
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="px-5 py-4 border-t border-[#F0F0F0]">
        {step < 3 ? (
          <button
            disabled={step === 1 ? !oembedData : !title.trim()}
            onClick={() => setStep(step + 1)}
            className={cn(
              'w-full h-[52px] rounded-full text-[15px] font-semibold flex items-center justify-center gap-2 transition-colors',
              (step === 1 ? oembedData : title.trim()) ? 'bg-[#1A1A2E] text-white' : 'bg-[#D9D9D9] text-[#999999]',
            )}
          >
            다음 <ChevronRight size={18} />
          </button>
        ) : (
          <button
            disabled={saving}
            onClick={handleSave}
            className="w-full h-[52px] rounded-full bg-[#1A1A2E] text-white text-[15px] font-semibold disabled:opacity-60"
          >
            {saving ? '저장 중...' : '저장하기'}
          </button>
        )}
      </div>
    </div>
  );
}
