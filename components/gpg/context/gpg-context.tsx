"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import type { Session } from "@/app/actions/auth.actions";
import type { GpgKeyDto } from "@/app/actions/gpg.actions";
import { useGpgKeys } from "../hooks/use-gpg-keys";
import { useCryptoWorkspace } from "../hooks/use-crypto-workspace";
import { useContacts } from "../hooks/use-contacts";
import { useKeyCreation } from "../hooks/use-key-creation";
import {
  pauseSelectedProfileFallback,
  useSelectedProfileStore,
} from "../selected-profile-store";

interface GpgContextValue {
  session: Session | null;

  // Keys & Management
  keysState: ReturnType<typeof useGpgKeys>;

  // Volatile Crypto Memory & Tools
  cryptoState: ReturnType<typeof useCryptoWorkspace>;

  // Encrypted Contacts & Messaging
  contactsState: ReturnType<typeof useContacts>;

  // Key Generation & Import Modals
  keyCreationState: ReturnType<typeof useKeyCreation>;

  // General UI state
  copiedId: string | null;
  copyText: (text: string, id: string) => void;
  completeKeySave: (key: GpgKeyDto) => void;
  handleSignOut: () => Promise<void>;
}

const GpgContext = createContext<GpgContextValue | null>(null);

interface GpgProviderProps {
  children: ReactNode;
  initialSession: Session | null;
  initialKeys?: GpgKeyDto[];
  initialNextCursor?: string | null;
  initialSelectedKey?: GpgKeyDto | null;
}

export function GpgProvider({
  children,
  initialSession,
  initialKeys,
  initialNextCursor,
  initialSelectedKey,
}: GpgProviderProps) {
  const { data: sessionData } = authClient.useSession();
  const session = (sessionData || initialSession) ?? null;

  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const cryptoState = useCryptoWorkspace();
  const contactsState = useContacts();

  const { lockKey } = cryptoState;

  const handleClearProfile = useCallback(() => {
    lockKey();
  }, [lockKey]);

  const keysState = useGpgKeys({
    initialKeys,
    initialNextCursor,
    initialSelectedKey,
    onClearProfile: handleClearProfile,
  });

  const keyCreationState = useKeyCreation();

  const copyText = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const completeKeySave = useCallback(
    (key: GpgKeyDto) => {
      keysState.setKeys((prev) => [
        key,
        ...prev.filter((item) => item.id !== key.id),
      ]);
      cryptoState.lockKey();
      useSelectedProfileStore.getState().setProfileKeyId(key.id);
      useSelectedProfileStore.getState().setPendingUnlockId(key.id);
      keysState.setSelectedKey(key);
      router.push("/");
    },
    [cryptoState, keysState, router],
  );

  const handleSignOut = useCallback(async () => {
    pauseSelectedProfileFallback();
    useSelectedProfileStore.getState().setProfileKeyId(null);
    cryptoState.lockKey();
    await authClient.signOut();
    window.location.reload();
  }, [cryptoState]);

  return (
    <GpgContext.Provider
      value={{
        session,
        keysState,
        cryptoState,
        contactsState,
        keyCreationState,
        copiedId,
        copyText,
        completeKeySave,
        handleSignOut,
      }}
    >
      {children}
    </GpgContext.Provider>
  );
}

export function useGpgContext() {
  const context = useContext(GpgContext);
  if (!context) {
    throw new Error("useGpgContext must be used within a GpgProvider");
  }
  return context;
}
