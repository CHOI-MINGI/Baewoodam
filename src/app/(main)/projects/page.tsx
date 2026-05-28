"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MEDIA_TYPE_MAP } from '@/constants';
import type { ProjectItem } from '@/types';

const STATUS_TABS = ['전체', '진행중', '기초중', '완료됨'] as const;

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
    if (tab === '진행중') return p.recruitStatus === 'IN_PROGRESS';
    if (tab === '기초중') return p.recruitStatus === 'OPEN';
    if (tab === '완료됨') return p.recruitStatus === 'CLOSED';
    return true;
  });

  return (
    <div className="flex flex-col min-h-full">
      {/* 헤더 */}
      <div className="flex items-center px-4 py-3 border-b border-[#F0F0F0]">
        <h1 className="text-[16px] font-semibold text-[#1A1A1A]">프로젝트</h1>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-[#F0F0F0]">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-3 text-[14px] font-medium transition-colors',
              tab === t
                ? 'text-[#E53935] border-b-2 border-[#E53935]'
                : 'text-[#888888]',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 프로젝트 목록 */}
      <div className="flex-1 px-4 py-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-24 bg-[#F5F5F5] rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-[15px] text-[#888888]">등록된 프로젝트가 없어요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((project) => <ProjectCard key={project.id} project={project} />)}
          </div>
        )}
      </div>

      {/* 새 프로젝트 버튼 */}
      <div className="px-4 py-3 border-t border-[#F0F0F0]">
        <Link
          href="/projects/new"
          className="flex items-center justify-center gap-2 w-full h-[48px] rounded-full border border-[#1A1A2E] text-[#1A1A2E] text-[14px] font-semibold"
        >
          <Plus size={16} />
          새 프로젝트 만들기
        </Link>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectItem }) {
  const castTotal = project.characters.length;
  const castDone = project.characters.filter((c) => c.castingStatus === 'CAST').length;
  const progress = castTotal > 0 ? Math.round((castDone / castTotal) * 100) : 0;

  return (
    <Link href={`/projects/${project.id}/characters`}>
      <div className="flex gap-3 bg-white rounded-xl p-3 border border-[#F0F0F0]">
        {/* 포스터 */}
        <div className="w-[60px] h-[80px] rounded-lg bg-[#F5F5F5] flex-shrink-0" />
        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <span className="text-[11px] text-[#888888] bg-[#F5F5F5] px-2 py-0.5 rounded">
            {(MEDIA_TYPE_MAP as any)[project.mediaType] ?? project.mediaType}
          </span>
          <p className="text-[15px] font-bold text-[#1A1A1A] mt-1">{project.title}</p>
          <p className="text-[12px] text-[#888888]">캐릭터 {castTotal}명</p>
          {castTotal > 0 && (
            <div className="mt-2">
              <div className="h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                <div className="h-full bg-[#E53935] rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[11px] text-[#888888] mt-0.5">{progress}% 완료</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
