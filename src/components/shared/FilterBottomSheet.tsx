"use client";

import { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import DrumrollPicker from './DrumrollPicker';
import { cn } from '@/lib/utils';
import { AGE_RANGE_OPTIONS, GENDER_OPTIONS, LOCATION_OPTIONS } from '@/constants';

export type FilterType = 'ageRange' | 'gender' | 'location' | 'filmCount';

export interface FilterValues {
  ageRange: string;
  gender: string;
  location: string;
  minFilmo: number;
  maxFilmo: number;
}

interface FilterBottomSheetProps {
  filterType: FilterType | null;
  values: FilterValues;
  onClose: () => void;
  onChange: (values: Partial<FilterValues>) => void;
}

export default function FilterBottomSheet({
  filterType,
  values,
  onClose,
  onChange,
}: FilterBottomSheetProps) {
  const [localFilmo, setLocalFilmo] = useState<[number, number]>([values.minFilmo, values.maxFilmo]);

  if (filterType === 'ageRange') {
    return (
      <DrumrollPicker
        open
        onClose={onClose}
        title="나이대를 선택해 주세요"
        options={['전체', ...AGE_RANGE_OPTIONS]}
        value={values.ageRange || '전체'}
        onChange={(v) => onChange({ ageRange: v === '전체' ? '' : v })}
      />
    );
  }

  if (filterType === 'gender') {
    return (
      <DrumrollPicker
        open
        onClose={onClose}
        title="나이대를 선택해 주세요"
        options={['전체', ...GENDER_OPTIONS]}
        value={values.gender || '전체'}
        onChange={(v) => onChange({ gender: v === '전체' ? '' : v })}
      />
    );
  }

  return (
    <Sheet open={!!filterType} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl px-6 pb-0">
        <div className="py-4 border-b border-[#E0E0E0]">
          <h3 className="text-[15px] font-semibold text-center text-[#1A1A1A]">
            {filterType === 'location' ? '활동 지역' : '필모 수'}
          </h3>
        </div>

        {filterType === 'location' && (
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {['전체', ...LOCATION_OPTIONS].map((loc) => (
              <button
                key={loc}
                onClick={() => onChange({ location: loc === '전체' ? '' : loc })}
                className={cn(
                  'w-full text-left py-3 px-2 text-[15px] border-b border-[#F0F0F0]',
                  values.location === loc || (!values.location && loc === '전체')
                    ? 'text-[#E53935] font-semibold'
                    : 'text-[#1A1A1A]',
                )}
              >
                {loc}
              </button>
            ))}
          </div>
        )}

        {filterType === 'filmCount' && (
          <div className="py-6">
            <div className="flex justify-between text-[13px] text-[#888888] mb-4">
              <span>{localFilmo[0]}개</span>
              <span>{localFilmo[1]}개</span>
            </div>
            <Slider
              min={0}
              max={30}
              step={1}
              value={localFilmo}
              onValueChange={(v) => setLocalFilmo(v as [number, number])}
              className="[&_[role=slider]]:bg-[#E53935] [&_.bg-primary]:bg-[#E53935]"
            />
          </div>
        )}

        <div className="py-4">
          <button
            onClick={() => {
              if (filterType === 'filmCount') {
                onChange({ minFilmo: localFilmo[0], maxFilmo: localFilmo[1] });
              }
              onClose();
            }}
            className="w-full h-[52px] rounded-full bg-[#1A1A2E] text-white text-[15px] font-semibold"
          >
            확인
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
