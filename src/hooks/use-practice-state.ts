
'use client';

import { create } from 'zustand';

interface PracticeState {
  activeDrill: any | null;
  setActiveDrill: (drill: any) => void;
  clearActiveDrill: () => void;
}

export const usePracticeState = create<PracticeState>((set) => ({
  activeDrill: null,
  setActiveDrill: (drill) => set({ activeDrill: drill }),
  clearActiveDrill: () => set({ activeDrill: null }),
}));
