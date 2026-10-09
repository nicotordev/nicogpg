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

interface GpgContextValue {
  session: Session | null;
  pageMode: "dashboard" | "profile";
  profileKeyId?: string;

  // Keys & Management
  keysState: ReturnType<typeof useGpgKeys>;

  // Volatile Crypto Memory & Tools
  cryptoState: ReturnType<typeof useCryptoWorkspace>;

  // Encrypted Contacts & Messaging
  contactsState: ReturnType<typeof useContacts>;

  // Key Generation & Import Modals
  keyCreationState: ReturnType<typeof useKeyCreation>;

  // General UI state
  showMessenger: boolean;
  setShowMessenger: (show: boolean) => void;
  copiedId: string | null;
  copyText: (text: string, id: string) => void;
  completeKeySave: (key: GpgKeyDto) => void;
  handleSignOut: () => Promise<void>;
}

const GpgContext = createContext<GpgContextValue | null>(null);

interface GpgProviderProps {
  children: ReactNode;
  initialSession: Session | null;
  pageMode?: "dashboard" | "profile";
  profileKeyId?: string;
}

export function GpgProvider({
  children,
  initialSession,
  pageMode = "dashboard",
  profileKeyId,
}: GpgProviderProps) {
  const router = useRouter();
  const { data: sessionData } = authClient.useSession();
  const session = (sessionData || initialSession) ?? null;

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showMessenger, setShowMessenger] = useState(pageMode !== "profile");

  const cryptoState = useCryptoWorkspace();
  const contactsState = useContacts();

  const { lockKey } = cryptoState;

  const handleProfileSelected = useCallback(() => {
    lockKey();
    setShowMessenger(pageMode !== "profile");
  }, [lockKey, pageMode]);

  const handleClearProfile = useCallback(() => {
    lockKey();
    setShowMessenger(true);
  }, [lockKey]);

  const keysState = useGpgKeys({
    pageMode,
    profileKeyId,
    onProfileSelected: handleProfileSelected,
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
      keysState.setSelectedKey(key);
      setShowMessenger(pageMode !== "profile");
      const targetUrl =
        pageMode === "profile" ? `/profile?key=${key.id}` : `/?key=${key.id}`;
      router.push(targetUrl);
    },
    [cryptoState, keysState, pageMode, router],
  );

  const handleSignOut = useCallback(async () => {
    cryptoState.lockKey();
    await authClient.signOut();
    window.location.reload();
  }, [cryptoState]);

  return (
    <GpgContext.Provider
      value={{
        session,
        pageMode,
        profileKeyId,
        keysState,
        cryptoState,
        contactsState,
        keyCreationState,
        showMessenger,
        setShowMessenger,
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
