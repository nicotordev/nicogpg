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
import type { PgpKeyDto } from "@/app/actions/pgp.actions";
import { usePgpKeys } from "../hooks/use-pgp-keys";
import { useCryptoWorkspace } from "../hooks/use-crypto-workspace";
import { useContacts } from "../hooks/use-contacts";
import { useKeyCreation } from "../hooks/use-key-creation";
import {
  pauseSelectedProfileFallback,
  useSelectedProfileStore,
} from "../selected-profile-store";

interface PgpContextValue {
  session: Session | null;

  // Keys & Management
  keysState: ReturnType<typeof usePgpKeys>;

  // Volatile Crypto Memory & Tools
  cryptoState: ReturnType<typeof useCryptoWorkspace>;

  // Encrypted Contacts & Messaging
  contactsState: ReturnType<typeof useContacts>;

  // Key Generation & Import Modals
  keyCreationState: ReturnType<typeof useKeyCreation>;

  // General UI state
  copiedId: string | null;
  copyText: (text: string, id: string) => void;
  completeKeySave: (key: PgpKeyDto) => void;
  handleSignOut: () => Promise<void>;
}

const PgpContext = createContext<PgpContextValue | null>(null);

interface PgpProviderProps {
  children: ReactNode;
  initialSession: Session | null;
  initialKeys?: PgpKeyDto[];
  initialNextCursor?: string | null;
  initialSelectedKey?: PgpKeyDto | null;
}

export function PgpProvider({
  children,
  initialSession,
  initialKeys,
  initialNextCursor,
  initialSelectedKey,
}: PgpProviderProps) {
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

  const keysState = usePgpKeys({
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
    (key: PgpKeyDto) => {
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
    <PgpContext.Provider
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
    </PgpContext.Provider>
  );
}

export function usePgpContext() {
  const context = useContext(PgpContext);
  if (!context) {
    throw new Error("usePgpContext must be used within a PgpProvider");
  }
  return context;
}
