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
    setUnlockError(null);
    setUnlockPassphraseInput("");
    setSignedOutput("");
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
        setUnlockPassphraseInput("");
      } catch {
        setUnlockError(
          "Incorrect GPG passphrase. Failed to decrypt key envelope.",
        );
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
      onSuccess?: (plaintext: string) => void,
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
        try {
          const readable = await decryptMessageInMemory({
            unlockedPrivateKey: unlocked,
            armoredMessage: pendingDecryptArmored,
          });
          setDecryptPassphrase("");
          setPendingDecryptArmored(null);
          setDecryptDialogOpen(false);
          if (onSuccess) onSuccess(readable);
        } catch (error: unknown) {
          console.error("Decrypt command error:", error);
          setDecryptDialogError("No se pudo descifrar el mensaje con esta clave.");
        }
      } catch (error: unknown) {
        console.error("Unlock for decrypt error:", error);
        setDecryptDialogError("La passphrase no coincide con la clave privada.");
      } finally {
        setIsDecrypting(false);
      }
    },
    [pendingDecryptArmored, decryptPassphrase, isDecrypting],
  );

  return {
    unlockedPrivateKey,
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
    handleUnlockKey,
    handleSignMessage,
    requestDecrypt,
    closeDecryptDialog,
    handleDecryptPassphrase,
  };
}
