
'use client';

import { create } from 'zustand';

interface PracticeState {
  activeDrill: any | null;
  setActiveDrill: (drill: any) => void;
  clearActiveDrill: () => void;
}

// We are not using zustand/middleware here because we want the state
// to be reset on page refresh. A practice session is ephemeral and should
// not persist if the user reloads the page.
export const usePracticeState = create<PracticeState>((set) => ({
  activeDrill: null,
  setActiveDrill: (drill) => set({ activeDrill: drill }),
  clearActiveDrill: () => set({ activeDrill: null }),
}));
