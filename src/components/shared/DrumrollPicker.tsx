"use client";

import { useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

const ITEM_HEIGHT = 48;
const VISIBLE_COUNT = 5;

interface DrumrollPickerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}

export default function DrumrollPicker({
  open,
  onClose,
  title,
  options,
  value,
  onChange,
}: DrumrollPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentIndex = Math.max(0, options.indexOf(value));

  const scrollToIndex = useCallback((idx: number) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = idx * ITEM_HEIGHT;
  }, []);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => scrollToIndex(currentIndex), 50);
      return () => clearTimeout(t);
    }
  }, [open, currentIndex, scrollToIndex]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(options.length - 1, idx));
    if (options[clamped] !== value) {
      onChange(options[clamped]);
    }
  };

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* 백드롭 */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* 바텀시트 */}
      <div className="relative bg-white rounded-t-2xl shadow-xl">
        {title && (
          <div className="text-center text-[15px] font-semibold text-[#1A1A1A] py-4 border-b border-[#E0E0E0]">
            {title}
          </div>
        )}

        <div className="relative" style={{ height: ITEM_HEIGHT * VISIBLE_COUNT }}>
          {/* 선택 영역 하이라이트 */}
          <div
            className="absolute left-0 right-0 pointer-events-none bg-[#F5F5F5] rounded-lg mx-4"
            style={{
              top: ITEM_HEIGHT * Math.floor(VISIBLE_COUNT / 2),
              height: ITEM_HEIGHT,
            }}
          />

          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="overflow-y-scroll h-full"
            style={{
              scrollSnapType: 'y mandatory',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            } as React.CSSProperties}
          >
            {/* 상단 패딩 */}
            {Array.from({ length: Math.floor(VISIBLE_COUNT / 2) }).map((_, i) => (
              <div key={`top-${i}`} style={{ height: ITEM_HEIGHT }} />
            ))}

            {options.map((opt) => {
              const isSelected = opt === value;
              return (
                <div
                  key={opt}
                  style={{ height: ITEM_HEIGHT, scrollSnapAlign: 'center' }}
                  className={cn(
                    'flex items-center justify-center text-[16px] transition-all cursor-pointer select-none',
                    isSelected
                      ? 'font-semibold text-[#1A1A1A]'
                      : 'text-[#BBBBBB]',
                  )}
                  onClick={() => {
                    onChange(opt);
                    scrollToIndex(options.indexOf(opt));
                  }}
                >
                  {opt}
                </div>
              );
            })}

            {/* 하단 패딩 */}
            {Array.from({ length: Math.floor(VISIBLE_COUNT / 2) }).map((_, i) => (
              <div key={`bottom-${i}`} style={{ height: ITEM_HEIGHT }} />
            ))}
          </div>
        </div>

        <div className="px-6 py-4 pb-8">
          <button
            onClick={onClose}
            className="w-full h-[52px] rounded-full bg-[#1A1A2E] text-white text-[15px] font-semibold"
          >
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
