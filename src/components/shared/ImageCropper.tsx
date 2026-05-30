"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { getCroppedImg } from '@/lib/cropImage';

interface ImageCropperProps {
  imageSrc: string;
  aspect?: number;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropper({ imageSrc, aspect = 3 / 4, onConfirm, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);
  const cropAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cropAreaRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setZoom((z) => Math.min(3, Math.max(1, z + delta)));
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const handleCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setLoading(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onConfirm(blob);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* 상단 바 */}
      <div className="flex items-center justify-between px-5 py-3 bg-black/80">
        <button
          onClick={onCancel}
          className="text-white text-[15px] px-1 py-1"
        >
          취소
        </button>
        <span className="text-white text-[15px] font-semibold">사진 편집</span>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="text-[#E53935] text-[15px] font-semibold px-1 py-1 disabled:opacity-50"
        >
          {loading ? '처리 중...' : '확인'}
        </button>
      </div>

      {/* 크롭 영역 */}
      <div ref={cropAreaRef} className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
          cropShape="rect"
          showGrid={false}
          style={{
            containerStyle: { background: '#111' },
            cropAreaStyle: { border: '2px solid rgba(255,255,255,0.8)', borderRadius: '8px' },
            mediaStyle: {},
          }}
        />
      </div>

      {/* 줌 슬라이더 */}
      <div className="px-8 py-5 bg-black/80">
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full accent-[#E53935] h-1"
        />
        <p className="text-center text-[12px] text-white/40 mt-2">
          드래그로 위치 조절 · 마우스 휠 또는 슬라이더로 크기 조절
        </p>
      </div>
    </div>
  );
}
