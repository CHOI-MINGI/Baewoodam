"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Film } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MEDIA_TYPE_MAP } from '@/constants';
import type { ProjectItem } from '@/types';

const STATUS_TABS = ['전체', '모집중', '진행중', '완료됨'] as const;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [tab, setTab] = useState<string>('전체');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((d) => { setProjects(d ?? []); setLoading(false); });
  }, []);

  const filtered = tab === '전체' ? projects : projects.filter((p) => {
    if (tab === '모집중') return p.recruitStatus === 'OPEN';
    if (tab === '진행중') return p.recruitStatus === 'IN_PROGRESS';
    if (tab === '완료됨') return p.recruitStatus === 'CLOSED';
    return true;
  });

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-8 pt-8 pb-4">
        <h1 className="text-[22px] font-bold text-[#1A1A1A]">프로젝트</h1>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1A1A2E] text-white text-[14px] font-semibold hover:bg-[#2A2A3E] transition-colors"
        >
          <Plus size={16} />
          새 프로젝트
        </Link>
      </div>

      <div className="max-w-[1200px] mx-auto px-8 pb-12">
        {/* 탭 */}
        <div className="flex gap-2 mb-6">
          {STATUS_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-4 py-2 rounded-full text-[14px] font-medium transition-colors',
                tab === t
                  ? 'bg-[#1A1A2E] text-white'
                  : 'bg-white text-[#888888] border border-[#E0E0E0]',
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* 목록 */}
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-[180px] bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
              <Film size={28} className="text-[#BBBBBB]" />
            </div>
            <p className="text-[15px] text-[#888888]">등록된 프로젝트가 없어요</p>
            <Link
              href="/projects/new"
              className="px-6 py-3 rounded-full bg-[#1A1A2E] text-white text-[14px] font-semibold"
            >
              첫 프로젝트 만들기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((project) => <ProjectCard key={project.id} project={project} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectItem }) {
  const castTotal = project.characters.length;
  const castDone = project.characters.filter((c) => c.castingStatus === 'CAST').length;
  const progress = castTotal > 0 ? Math.round((castDone / castTotal) * 100) : 0;

  const statusLabel: Record<string, { label: string; cls: string }> = {
    OPEN: { label: '모집중', cls: 'bg-[#DCFCE7] text-[#16A34A]' },
    IN_PROGRESS: { label: '진행중', cls: 'bg-[#FEF3C7] text-[#D97706]' },
    CLOSED: { label: '완료', cls: 'bg-[#F5F5F5] text-[#888888]' },
  };
  const status = statusLabel[project.recruitStatus] ?? statusLabel.OPEN;

  return (
    <Link href={`/projects/${project.id}/characters`}>
      <div className="bg-white rounded-2xl p-5 border border-[#F0F0F0] hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] text-[#888888] bg-[#F5F5F5] px-2.5 py-1 rounded-full">
            {(MEDIA_TYPE_MAP as any)[project.mediaType] ?? project.mediaType}
          </span>
          <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${status.cls}`}>
            {status.label}
          </span>
        </div>

        <p className="text-[18px] font-bold text-[#1A1A1A] mb-1">{project.title}</p>
        {project.logline && (
          <p className="text-[13px] text-[#888888] line-clamp-2 mb-4">{project.logline}</p>
        )}

        <div className="flex items-center justify-between text-[13px] text-[#888888] mb-2">
          <span>캐릭터 {castTotal}명</span>
          <span>{progress}% 캐스팅 완료</span>
        </div>
        <div className="h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
          <div className="h-full bg-[#E53935] rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </Link>
  );
}
