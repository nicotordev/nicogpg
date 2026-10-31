"use client";

import { useState, useCallback } from "react";
import type { PrivateKey } from "openpgp";
import type { GpgKeyDto } from "@/app/actions/gpg.actions";
import {
  unlockPrivateKeyInMemory,
  signMessageInMemory,
  decryptMessageInMemory,
} from "@/lib/gpg-crypto";

export function useCryptoWorkspace() {
  // Volatile in-memory unlocked private key
  const [unlockedPrivateKey, setUnlockedPrivateKey] =
    useState<PrivateKey | null>(null);
  const [openProfileId, setOpenProfileId] = useState<string | null>(null);
  const [unlockPassphraseInput, setUnlockPassphraseInput] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  // Signing message test panel state
  const [messageToSign, setMessageToSign] = useState("");
  const [signedOutput, setSignedOutput] = useState("");
  const [isSigning, setIsSigning] = useState(false);

  // Decrypt Dialog State
  const [decryptDialogOpen, setDecryptDialogOpen] = useState(false);
  const [decryptPassphrase, setDecryptPassphrase] = useState("");
  const [decryptDialogError, setDecryptDialogError] = useState<string | null>(
    null,
  );
  const [pendingDecryptArmored, setPendingDecryptArmored] = useState<
    string | null
  >(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Clear memory and reset workspace states
  const lockKey = useCallback(() => {
    setUnlockedPrivateKey(null);
    setOpenProfileId(null);
    setUnlockError(null);
    setUnlockPassphraseInput("");
    setSignedOutput("");
  }, []);

  const enterProfile = useCallback((profileId: string) => {
    setOpenProfileId(profileId);
  }, []);

  // Unlock private key in client memory
  const handleUnlockKey = useCallback(
    async (selectedKey: GpgKeyDto | null, e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (
        !selectedKey?.encryptedPrivateKey ||
        !unlockPassphraseInput ||
        isUnlocking
      )
        return;
      setIsUnlocking(true);
      setUnlockError(null);

      try {
        const unlocked = await unlockPrivateKeyInMemory({
          encryptedPrivateKeyArmored: selectedKey.encryptedPrivateKey,
          passphrase: unlockPassphraseInput,
        });
        setUnlockedPrivateKey(unlocked);
        setOpenProfileId(selectedKey.id);
        setUnlockPassphraseInput("");
      } catch {
        setUnlockError("That passphrase does not match this private key.");
      } finally {
        setIsUnlocking(false);
      }
    },
    [unlockPassphraseInput, isUnlocking],
  );

  // Sign message in memory using unlocked key
  const handleSignMessage = useCallback(async () => {
    if (!unlockedPrivateKey || !messageToSign.trim() || isSigning) return;
    setIsSigning(true);
    try {
      const signed = await signMessageInMemory({
        unlockedPrivateKey,
        messageText: messageToSign,
      });
      setSignedOutput(signed);
    } catch (err: unknown) {
      console.error("Signing error:", err);
    } finally {
      setIsSigning(false);
    }
  }, [unlockedPrivateKey, messageToSign, isSigning]);

  // Request decryption modal for armored PGP message
  const decryptWithUnlockedKey = useCallback(
    async (armoredMessage: string): Promise<string> => {
      if (!unlockedPrivateKey) {
        throw new Error("Profile is locked.");
      }
      return decryptMessageInMemory({
        unlockedPrivateKey,
        armoredMessage,
      });
    },
    [unlockedPrivateKey],
  );

  const requestDecrypt = useCallback((armored: string) => {
    setPendingDecryptArmored(armored);
    setDecryptPassphrase("");
    setDecryptDialogError(null);
    setDecryptDialogOpen(true);
  }, []);

  const closeDecryptDialog = useCallback(() => {
    if (isDecrypting) return;
    setDecryptDialogOpen(false);
    setDecryptPassphrase("");
    setDecryptDialogError(null);
    setPendingDecryptArmored(null);
  }, [isDecrypting]);

  const handleDecryptPassphrase = useCallback(
    async (
      selectedKey: GpgKeyDto | null,
      event?: React.FormEvent,
      onSuccess?: (plaintext: string, armoredMessage: string) => void,
    ) => {
      if (event) event.preventDefault();
      if (
        !selectedKey?.encryptedPrivateKey ||
        !pendingDecryptArmored ||
        !decryptPassphrase ||
        isDecrypting
      ) {
        return;
      }

      setIsDecrypting(true);
      setDecryptDialogError(null);
      try {
        const unlocked = await unlockPrivateKeyInMemory({
          encryptedPrivateKeyArmored: selectedKey.encryptedPrivateKey,
          passphrase: decryptPassphrase,
        });
        setUnlockedPrivateKey(unlocked);
        setOpenProfileId(selectedKey.id);
        try {
          const readable = await decryptMessageInMemory({
            unlockedPrivateKey: unlocked,
            armoredMessage: pendingDecryptArmored,
          });
          const armoredMessage = pendingDecryptArmored;
          setDecryptPassphrase("");
          setPendingDecryptArmored(null);
          setDecryptDialogOpen(false);
          if (onSuccess) onSuccess(readable, armoredMessage);
        } catch (error: unknown) {
          console.error("Decrypt command error:", error);
          setDecryptDialogError("Could not decrypt this message with this key.");
        }
      } catch (error: unknown) {
        console.error("Unlock for decrypt error:", error);
        setDecryptDialogError("That passphrase does not match this private key.");
      } finally {
        setIsDecrypting(false);
      }
    },
    [pendingDecryptArmored, decryptPassphrase, isDecrypting],
  );

  return {
    unlockedPrivateKey,
    openProfileId,
    setUnlockedPrivateKey,
    unlockPassphraseInput,
    setUnlockPassphraseInput,
    isUnlocking,
    unlockError,
    setUnlockError,
    messageToSign,
    setMessageToSign,
    signedOutput,
    setSignedOutput,
    isSigning,
    decryptDialogOpen,
    setDecryptDialogOpen,
    decryptPassphrase,
    setDecryptPassphrase,
    decryptDialogError,
    setDecryptDialogError,
    pendingDecryptArmored,
    isDecrypting,
    lockKey,
    enterProfile,
    handleUnlockKey,
    decryptWithUnlockedKey,
    handleSignMessage,
    requestDecrypt,
    closeDecryptDialog,
    handleDecryptPassphrase,
  };
}
