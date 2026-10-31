"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";

type SelectedProfileState = {
  profileKeyId: string | null;
  pendingUnlockId: string | null;
  setProfileKeyId: (profileKeyId: string | null) => void;
  setPendingUnlockId: (pendingUnlockId: string | null) => void;
};

let pauseProfileFallback = false;

export function pauseSelectedProfileFallback(): void {
  pauseProfileFallback = true;
}

export function isSelectedProfileFallbackPaused(): boolean {
  return pauseProfileFallback;
}

export const useSelectedProfileStore = create<SelectedProfileState>()(
  persist(
    subscribeWithSelector((set) => ({
      profileKeyId: null,
      pendingUnlockId: null,
      setProfileKeyId: (profileKeyId) => set({ profileKeyId }),
      setPendingUnlockId: (pendingUnlockId) => set({ pendingUnlockId }),
    })),
    {
      name: "nicogpg.selected-profile",
      partialize: (state) => ({ profileKeyId: state.profileKeyId }),
    },
  ),
);

function subscribeHydration(onStoreChange: () => void): () => void {
  return useSelectedProfileStore.persist.onFinishHydration(() => {
    onStoreChange();
  });
}

export function useSelectedProfileHydrated(): boolean {
  return useSyncExternalStore(
    subscribeHydration,
    () => useSelectedProfileStore.persist.hasHydrated(),
    () => false,
  );
}
