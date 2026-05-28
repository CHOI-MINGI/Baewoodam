"use client";

import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadProgressProps {
  filename: string;
  size: number;
  progress: number;
  onRemove: () => void;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export default function UploadProgress({
  filename,
  size,
  progress,
  onRemove,
}: UploadProgressProps) {
  const done = progress >= 100;

  return (
    <div className="flex items-center gap-3 p-3 bg-[#F5F5F5] rounded-xl">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#1A1A1A] truncate">{filename}</p>
        <p className="text-[11px] text-[#888888]">{formatBytes(size)}</p>
        {!done && (
          <div className="mt-1.5 h-1.5 bg-[#E0E0E0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E53935] rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {done ? (
        <div className="w-6 h-6 rounded-full bg-[#E53935] flex items-center justify-center flex-shrink-0">
          <Check size={12} color="white" strokeWidth={3} />
        </div>
      ) : (
        <button onClick={onRemove} className="flex-shrink-0">
          <X size={18} className="text-[#888888]" />
        </button>
      )}
    </div>
  );
}
