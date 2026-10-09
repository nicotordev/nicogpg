"use client";

import { useState, useEffect, useCallback } from "react";
import {
  generateClientGpgEnvelope,
  unlockPrivateKeyInMemory,
  parseArmoredGpgKey,
  type ParsedGpgKey,
} from "@/lib/gpg-crypto";
import {
  createGpgKeyAction,
  type GpgKeyDto,
} from "@/app/actions/gpg.actions";

export function useKeyCreation() {
  // Modal Mode: "generate" | "import"
  const [modalMode, setModalMode] = useState<"generate" | "import">("generate");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Generate Key Form State
  const [newHandle, setNewHandle] = useState("");
  const [newPassphrase, setNewPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [newKeyType, setNewKeyType] = useState("Ed25519");
  const [newAvatarColor, setNewAvatarColor] = useState("red");
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [creationStatusText, setCreationStatusText] = useState("");

  // Import Key Form State
  const [armoredInputText, setArmoredInputText] = useState("");
  const [parsedKeyInfo, setParsedKeyInfo] = useState<ParsedGpgKey | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isParsingKey, setIsParsingKey] = useState(false);
  const [importPassphrase, setImportPassphrase] = useState("");
  const [showImportPassphrase, setShowImportPassphrase] = useState(false);

  // Drag & Drop File Hover State
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const resetForm = useCallback(() => {
    setIsAddModalOpen(false);
    setNewHandle("");
    setNewPassphrase("");
    setArmoredInputText("");
    setParsedKeyInfo(null);
    setImportPassphrase("");
    setShowImportPassphrase(false);
    setParseError(null);
    setCreationStatusText("");
  }, []);

  // Global Paste Sensitivity Handler
  const handleIncomingKeyText = useCallback(async (text: string) => {
    const cleanText = text.trim();
    if (
      cleanText.includes("-----BEGIN PGP PUBLIC KEY BLOCK-----") ||
      cleanText.includes("-----BEGIN PGP PRIVATE KEY BLOCK-----") ||
      cleanText.includes("-----BEGIN PGP ARMORED FILE-----")
    ) {
      setIsParsingKey(true);
      setParseError(null);
      setArmoredInputText(cleanText);
      setModalMode("import");
      setIsAddModalOpen(true);

      try {
        const parsed = await parseArmoredGpgKey(cleanText);
        setParsedKeyInfo(parsed);
        if (parsed.handle) setNewHandle(parsed.handle);
      } catch (error: unknown) {
        console.error("OpenPGP parse error:", error);
        setParseError("No se pudo leer la clave OpenPGP. Revisa el bloque exportado.");
        setParsedKeyInfo(null);
      } finally {
        setIsParsingKey(false);
      }
    }
  }, []);

  // Window Paste Event Listener
  useEffect(() => {
    function onWindowPaste(e: ClipboardEvent) {
      const pastedData = e.clipboardData?.getData("text");
      if (pastedData) {
        handleIncomingKeyText(pastedData);
      }
    }

    window.addEventListener("paste", onWindowPaste);
    return () => window.removeEventListener("paste", onWindowPaste);
  }, [handleIncomingKeyText]);

  // Window Drag & Drop Event Handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDraggingFile(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDraggingFile(false);
    }
  }, []);

  const handleDropFile = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingFile(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
              handleIncomingKeyText(content);
            }
          };
          reader.readAsText(file);
        }
      }
    },
    [handleIncomingKeyText],
  );

  // Parse Armored Text Input directly in Import Tab
  async function handleArmoredTextChange(text: string) {
    setArmoredInputText(text);
    if (
      text.includes("-----BEGIN PGP PUBLIC KEY BLOCK-----") ||
      text.includes("-----BEGIN PGP PRIVATE KEY BLOCK-----")
    ) {
      setIsParsingKey(true);
      setParseError(null);
      try {
        const parsed = await parseArmoredGpgKey(text);
        setParsedKeyInfo(parsed);
        if (parsed.handle) setNewHandle(parsed.handle);
      } catch (error: unknown) {
        console.error("OpenPGP parse error:", error);
        setParseError("No se pudo leer la clave OpenPGP. Revisa el bloque exportado.");
        setParsedKeyInfo(null);
      } finally {
        setIsParsingKey(false);
      }
    } else {
      setParsedKeyInfo(null);
    }
  }

  // Client-Side Zero-Knowledge Key Generation / Import submit handler
  async function handleCreateKey(
    e: React.FormEvent,
    callbacks: {
      onSuccess: (key: GpgKeyDto) => void;
      onError: (err: string) => void;
    },
  ) {
    e.preventDefault();
    if (!newHandle.trim() || isCreatingKey) return;
    setIsCreatingKey(true);

    try {
      if (modalMode === "generate") {
        if (!newPassphrase) return;
        setCreationStatusText("Generating OpenPGP key pair in browser...");

        const envelope = await generateClientGpgEnvelope({
          handle: newHandle.trim(),
          passphrase: newPassphrase,
          keyType: newKeyType,
        });

        setCreationStatusText("Uploading encrypted envelope blob to server...");

        const formData = new FormData();
        formData.set("handle", envelope.handle);
        formData.set("keyId", envelope.keyId);
        formData.set("fingerprint", envelope.fingerprint);
        formData.set("keyType", newKeyType);
        formData.set("avatarColor", newAvatarColor);
        formData.set("publicKey", envelope.publicKeyArmored);
        formData.set(
          "encryptedPrivateKeyArmored",
          envelope.encryptedPrivateKeyArmored,
        );
        formData.set("salt", envelope.salt);
        formData.set("kdfParams", envelope.kdfParams);
        const res = await createGpgKeyAction(formData);

        if (res.ok) {
          resetForm();
          callbacks.onSuccess(res.key);
        } else {
          callbacks.onError(res.error);
        }
      } else {
        if (!parsedKeyInfo) return;

        if (parsedKeyInfo.isPrivateKey) {
          if (!importPassphrase) {
            setParseError(
              "Ingresa la passphrase de la clave privada para continuar.",
            );
            return;
          }

          try {
            await unlockPrivateKeyInMemory({
              encryptedPrivateKeyArmored:
                parsedKeyInfo.encryptedPrivateKeyArmored ?? armoredInputText,
              passphrase: importPassphrase,
            });
          } catch {
            setParseError("La passphrase no coincide con la clave privada.");
            return;
          }
        }

        setCreationStatusText("Registering imported GPG identity envelope...");

        const formData = new FormData();
        formData.set("handle", newHandle.trim() || parsedKeyInfo.handle);
        formData.set("keyId", parsedKeyInfo.keyId);
        formData.set("fingerprint", parsedKeyInfo.fingerprint);
        formData.set("keyType", parsedKeyInfo.keyType);
        formData.set("avatarColor", newAvatarColor);
        formData.set("publicKey", parsedKeyInfo.publicKeyArmored);
        formData.set(
          "encryptedPrivateKeyArmored",
          parsedKeyInfo.encryptedPrivateKeyArmored ?? armoredInputText,
        );
        formData.set("salt", parsedKeyInfo.salt);
        formData.set("kdfParams", parsedKeyInfo.kdfParams);
        const res = await createGpgKeyAction(formData);

        if (res.ok) {
          resetForm();
          callbacks.onSuccess(res.key);
        } else {
          setParseError(res.error);
        }
      }
    } catch (err: unknown) {
      console.error("Key operation error:", err);
      callbacks.onError("No se pudo guardar la clave");
    } finally {
      setIsCreatingKey(false);
      setCreationStatusText("");
    }
  }

  return {
    modalMode,
    setModalMode,
    isAddModalOpen,
    setIsAddModalOpen,
    newHandle,
    setNewHandle,
    newPassphrase,
    setNewPassphrase,
    showPassphrase,
    setShowPassphrase,
    newKeyType,
    setNewKeyType,
    newAvatarColor,
    setNewAvatarColor,
    isCreatingKey,
    creationStatusText,
    armoredInputText,
    parsedKeyInfo,
    parseError,
    setParseError,
    isParsingKey,
    importPassphrase,
    setImportPassphrase,
    showImportPassphrase,
    setShowImportPassphrase,
    isDraggingFile,
    resetForm,
    handleDragOver,
    handleDragLeave,
    handleDropFile,
    handleArmoredTextChange,
    handleIncomingKeyText,
    handleCreateKey,
  };
}
