"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  getGpgKeysAction,
  getGpgKeyByIdAction,
  deleteGpgKeyAction,
  type GpgKeyDto,
  createGpgKeyAction,
  updateGpgKeyAction,
} from "@/app/actions/gpg.actions";
import {
  generateClientGpgEnvelope,
  unlockPrivateKeyInMemory,
  signMessageInMemory,
  encryptMessageForRecipient,
  parseArmoredGpgKey,
  type ParsedGpgKey,
} from "@/lib/gpg-crypto";
import { encryptStorageData, decryptStorageData } from "@/lib/secure-storage";
import { cn } from "@/lib/utils";
import type { PrivateKey } from "openpgp";

import type { NetflixGpgSelectorProps, Contact, DeleteRequest } from "./types";
import { FileDropOverlay } from "./file-drop-overlay";
import { GpgHeader } from "./gpg-header";
import { BottomNav } from "./bottom-nav";
import { ProfileSelectorGrid } from "./profile-grid/profile-selector-grid";
import { GpgWorkspace } from "./workspace/gpg-workspace";
import { AddKeyDialog } from "./dialogs/add-key-dialog";
import { EditKeyDialog } from "./dialogs/edit-key-dialog";
import { DeleteConfirmDialog } from "./dialogs/delete-confirm-dialog";
import { AddContactSheet } from "./dialogs/add-contact-sheet";
import { UiErrorDialog } from "./dialogs/ui-error-dialog";

export function NetflixGpgSelector({
  initialSession,
  pageMode = "dashboard",
  profileKeyId,
}: NetflixGpgSelectorProps) {
  const router = useRouter();
  const { data: sessionData } = authClient.useSession();
  const session = sessionData || initialSession;

  // Keys list & pagination state
  const [keys, setKeys] = useState<GpgKeyDto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Selected Active Profile
  const [selectedKey, setSelectedKey] = useState<GpgKeyDto | null>(null);

  // Unlocked Private Key held ONLY in volatile client memory
  const [unlockedPrivateKey, setUnlockedPrivateKey] =
    useState<PrivateKey | null>(null);
  const [unlockPassphraseInput, setUnlockPassphraseInput] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

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

  // Signing message test panel state
  const [messageToSign, setMessageToSign] = useState("");
  const [signedOutput, setSignedOutput] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Contacts & Messaging State (Encrypted at rest)
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactKeyText, setContactKeyText] = useState("");
  const [contactError, setContactError] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [messageToContact, setMessageToContact] = useState("");
  const [encryptedMessage, setEncryptedMessage] = useState("");
  const [isEncryptingMessage, setIsEncryptingMessage] = useState(false);
  const [showMessenger, setShowMessenger] = useState(pageMode !== "profile");

  // Profile Menu, Edit & Reorder State
  const [openKeyMenuId, setOpenKeyMenuId] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<GpgKeyDto | null>(null);
  const [editHandle, setEditHandle] = useState("");
  const [editAvatarColor, setEditAvatarColor] = useState("red");
  const [isUpdatingKey, setIsUpdatingKey] = useState(false);
  const [draggingKeyId, setDraggingKeyId] = useState<string | null>(null);
  const dragStartX = useRef<number | null>(null);
  const didDragKey = useRef(false);

  // Delete Confirmations and Errors
  const [deleteRequest, setDeleteRequest] = useState<DeleteRequest>(null);
  const [uiError, setUiError] = useState<string | null>(null);

  // Observer sentinel reference for infinite scroll
  const observerTarget = useRef<HTMLDivElement | null>(null);

  // Load encrypted contacts on mount
  useEffect(() => {
    let isMounted = true;
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("nicogpg.contacts");
      if (stored) {
        decryptStorageData(stored).then((decrypted) => {
          if (isMounted && decrypted) {
            try {
              setContacts(JSON.parse(decrypted) as Contact[]);
            } catch {
              // Ignore corrupted payload
            }
          }
        });
      }
    }
    return () => {
      isMounted = false;
    };
  }, []);

  // Save contacts encrypted with AES-256-GCM
  useEffect(() => {
    if (typeof window !== "undefined") {
      encryptStorageData(JSON.stringify(contacts)).then((encrypted) => {
        window.localStorage.setItem("nicogpg.contacts", encrypted);
      });
    }
  }, [contacts]);

  useEffect(() => {
    let isMounted = true;
    getGpgKeysAction({ cursor: undefined, limit: 8 }).then(async (res) => {
      if (!isMounted) return;
      setKeys(res.keys);
      setNextCursor(res.nextCursor);

      const listed =
        res.keys.find((key) => key.id === profileKeyId) ??
        (pageMode === "profile" && !profileKeyId ? res.keys[0] : undefined);
      const profile = listed ?? (profileKeyId ? await getGpgKeyByIdAction(profileKeyId) : null);
      if (!isMounted || !profile) return;

      setUnlockedPrivateKey(null);
      setUnlockError(null);
      setUnlockPassphraseInput("");
      setSignedOutput("");
      setSelectedKey(profile);
      setShowMessenger(pageMode !== "profile");
    });
    return () => {
      isMounted = false;
    };
  }, [pageMode, profileKeyId]);

  // Infinite Scroll Trigger
  const fetchMoreKeys = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    const res = await getGpgKeysAction({ cursor: nextCursor, limit: 8 });
    setKeys((prev) => [...prev, ...res.keys]);
    setNextCursor(res.nextCursor);
    setIsLoadingMore(false);
  }, [nextCursor, isLoadingMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && nextCursor && !isLoadingMore) {
          fetchMoreKeys();
        }
      },
      { threshold: 0.5 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [fetchMoreKeys, nextCursor, isLoadingMore]);

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

  function completeKeySave(key: GpgKeyDto) {
    setKeys((prev) => [key, ...prev.filter((item) => item.id !== key.id)]);
    setUnlockedPrivateKey(null);
    setUnlockError(null);
    setUnlockPassphraseInput("");
    setSignedOutput("");
    setSelectedKey(key);
    setShowMessenger(pageMode !== "profile");
    setIsAddModalOpen(false);
    setNewHandle("");
    setNewPassphrase("");
    setArmoredInputText("");
    setParsedKeyInfo(null);
    setImportPassphrase("");
    setShowImportPassphrase(false);
    setParseError(null);
    const targetUrl =
      pageMode === "profile" ? `/profile?key=${key.id}` : `/?key=${key.id}`;
    router.push(targetUrl);
  }

  // Client-Side Zero-Knowledge Key Generation / Import
  async function handleCreateKey(e: React.FormEvent) {
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
          completeKeySave(res.key);
        } else {
          setUiError(res.error);
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
          completeKeySave(res.key);
        } else {
          setParseError(res.error);
        }
      }
    } catch (err: unknown) {
      console.error("Key operation error:", err);
      setUiError("No se pudo guardar la clave");
    } finally {
      setIsCreatingKey(false);
      setCreationStatusText("");
    }
  }

  // Unlock private key in client memory
  async function handleUnlockKey(e: React.FormEvent) {
    e.preventDefault();
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
  }

  // Sign message in memory using unlocked key
  async function handleSignMessage() {
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
  }

  // Handle Key Deletion
  async function handleDeleteKey(keyIdToDelete: string, e: React.MouseEvent) {
    e.stopPropagation();

    const keyToDelete = keys.find((key) => key.id === keyIdToDelete);
    if (!keyToDelete) return;
    setDeleteRequest({
      type: "key",
      id: keyIdToDelete,
      name: keyToDelete.handle,
      step: 1,
    });
  }

  async function confirmDeleteRequest() {
    if (!deleteRequest) return;
    if (deleteRequest.type === "key" && deleteRequest.step === 1) {
      setDeleteRequest({ ...deleteRequest, step: 2 });
      return;
    }

    if (deleteRequest.type === "key") {
      const result = await deleteGpgKeyAction(deleteRequest.id);
      if (!result.success) {
        setUiError(result.error ?? "No se pudo eliminar el perfil.");
      } else {
        setKeys((prev) => prev.filter((key) => key.id !== deleteRequest.id));
        if (selectedKey?.id === deleteRequest.id) {
          setSelectedKey(null);
          setUnlockedPrivateKey(null);
        }
      }
    } else {
      setContacts((current) =>
        current.filter((contact) => contact.id !== deleteRequest.id),
      );
      if (selectedContactId === deleteRequest.id) {
        setSelectedContactId("");
        setMessageToContact("");
        setEncryptedMessage("");
      }
    }
    setDeleteRequest(null);
  }

  // Handle Sign Out
  async function handleSignOut() {
    setUnlockedPrivateKey(null);
    await authClient.signOut();
    window.location.reload();
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleAddContact(event: React.FormEvent) {
    event.preventDefault();
    setContactError(null);

    if (!contactName.trim() || !contactKeyText.trim()) {
      setContactError("Ingresa un nombre y una clave pública.");
      return;
    }

    try {
      const parsed = await parseArmoredGpgKey(contactKeyText);
      if (parsed.isPrivateKey) {
        setContactError(
          "Por seguridad, agrega solo la clave pública del contacto.",
        );
        return;
      }

      const contact: Contact = {
        id: crypto.randomUUID(),
        name: contactName.trim(),
        fingerprint: parsed.fingerprint,
        publicKey: parsed.publicKeyArmored,
      };
      setContacts((current) => [...current, contact]);
      setSelectedContactId(contact.id);
      setContactName("");
      setContactKeyText("");
      setIsContactDialogOpen(false);
    } catch (error: unknown) {
      console.error("Contact key parse error:", error);
      setContactError("La clave pública no es válida.");
    }
  }

  async function handleEncryptMessage() {
    const contact = contacts.find((item) => item.id === selectedContactId);
    if (!contact || !messageToContact.trim() || isEncryptingMessage) return;

    setIsEncryptingMessage(true);
    setEncryptedMessage("");
    try {
      const encrypted = await encryptMessageForRecipient({
        publicKeyArmored: contact.publicKey,
        messageText: messageToContact,
      });
      setEncryptedMessage(encrypted);
    } catch (error: unknown) {
      console.error("Encrypt message error:", error);
      setContactError("No se pudo cifrar el mensaje con la clave del contacto.");
    } finally {
      setIsEncryptingMessage(false);
    }
  }

  function handleDeleteContact(contactId: string) {
    const contact = contacts.find((item) => item.id === contactId);
    if (!contact) return;

    setDeleteRequest({
      type: "contact",
      id: contactId,
      name: contact.name,
      step: 1,
    });
  }

  function openEditKey(key: GpgKeyDto) {
    setOpenKeyMenuId(null);
    setEditingKey(key);
    setEditHandle(key.handle);
    setEditAvatarColor(key.avatarColor);
  }

  async function handleUpdateKey(event: React.FormEvent) {
    event.preventDefault();
    if (!editingKey || isUpdatingKey) return;

    setIsUpdatingKey(true);
    const result = await updateGpgKeyAction(editingKey.id, {
      handle: editHandle,
      avatarColor: editAvatarColor,
    });
    if (result.ok && result.key) {
      setKeys((current) =>
        current.map((key) => (key.id === result.key!.id ? result.key! : key)),
      );
      if (selectedKey?.id === result.key.id) setSelectedKey(result.key);
      setEditingKey(null);
    } else if (result.error) {
      setUiError(result.error);
    }
    setIsUpdatingKey(false);
  }

  function moveKey(keyId: string, direction: -1 | 1) {
    setOpenKeyMenuId(null);
    setKeys((current) => {
      const index = current.findIndex((key) => key.id === keyId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function swapKeys(keyId: string, direction: -1 | 1) {
    setKeys((current) => {
      const index = current.findIndex((key) => key.id === keyId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  const handleSelectKey = useCallback(
    (keyId: string) => {
      const profile = keys.find((key) => key.id === keyId);
      if (profile) {
        setUnlockedPrivateKey(null);
        setUnlockError(null);
        setUnlockPassphraseInput("");
        setSignedOutput("");
        setSelectedKey(profile);
        setShowMessenger(pageMode !== "profile");
      }
      const targetUrl =
        pageMode === "profile" ? `/profile?key=${keyId}` : `/?key=${keyId}`;
      router.push(targetUrl);
    },
    [keys, pageMode, router],
  );

  const handleBackToProfiles = useCallback(() => {
    setSelectedKey(null);
    setUnlockedPrivateKey(null);
    setShowMessenger(true);
    router.push(pageMode === "profile" ? "/profile" : "/");
  }, [pageMode, router]);

  function handleKeyPointerDown(
    event: React.PointerEvent<HTMLDivElement>,
    keyId: string,
  ) {
    if (event.pointerType === "mouse") {
      if (event.button !== 0) return;
      dragStartX.current = event.clientX;
      didDragKey.current = false;
      return;
    }
    dragStartX.current = event.clientX;
    didDragKey.current = false;
    setDraggingKeyId(keyId);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Ignore
    }
  }

  function handleKeyPointerMove(
    event: React.PointerEvent<HTMLDivElement>,
    keyId: string,
  ) {
    if (draggingKeyId !== keyId || dragStartX.current === null) return;
    const distance = event.clientX - dragStartX.current;
    if (Math.abs(distance) < 55) return;

    didDragKey.current = true;
    swapKeys(keyId, distance > 0 ? 1 : -1);
    dragStartX.current = event.clientX;
  }

  function handleKeyPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    dragStartX.current = null;
    setDraggingKeyId(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleKeyContextMenu(
    event: React.MouseEvent<HTMLDivElement>,
    keyId: string,
  ) {
    event.preventDefault();
    event.stopPropagation();
    setOpenKeyMenuId(keyId);
  }

  const isProfileActive = Boolean(selectedKey);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDropFile}
      className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white"
    >
      {/* Full-Screen Drag & Drop File Hover Overlay */}
      <FileDropOverlay isDraggingFile={isDraggingFile} />

      {/* Top Navigation Header */}
      <GpgHeader
        session={session}
        onOpenImportModal={() => {
          setModalMode("import");
          setIsAddModalOpen(true);
        }}
        onOpenContactsDialog={() => {
          setContactError(null);
          setIsContactDialogOpen(true);
        }}
        onOpenGenerateModal={() => {
          setModalMode("generate");
          setIsAddModalOpen(true);
        }}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main
        className={cn(
          "flex-1 flex w-full",
          selectedKey
            ? cn(
                "min-h-[calc(100vh-4.5rem)] flex-col",
                pageMode === "profile"
                  ? "bg-[#060914] px-6 pb-24 pt-5 sm:px-10 sm:pb-24 sm:pt-7 lg:px-16 lg:pb-24 lg:pt-10"
                  : "p-0 pb-20",
              )
            : "mx-auto max-w-7xl flex-col items-center justify-center p-3 sm:p-6 md:p-12",
        )}
      >
        {isProfileActive && selectedKey ? (
          <GpgWorkspace
            selectedKey={selectedKey}
            pageMode={pageMode}
            unlockedPrivateKey={unlockedPrivateKey}
            unlockPassphraseInput={unlockPassphraseInput}
            isUnlocking={isUnlocking}
            unlockError={unlockError}
            messageToSign={messageToSign}
            signedOutput={signedOutput}
            isSigning={isSigning}
            copiedId={copiedId}
            contacts={contacts}
            selectedContactId={selectedContactId}
            messageToContact={messageToContact}
            encryptedMessage={encryptedMessage}
            isEncryptingMessage={isEncryptingMessage}
            contactError={contactError}
            showMessenger={showMessenger}
            onBackToProfiles={handleBackToProfiles}
            onDeleteProfile={(e) => handleDeleteKey(selectedKey.id, e)}
            onCopyText={copyText}
            onSelectContact={setSelectedContactId}
            onDeleteContact={handleDeleteContact}
            onOpenAddContactDialog={() => {
              setContactError(null);
              setIsContactDialogOpen(true);
            }}
            onMessageToContactChange={setMessageToContact}
            onEncryptMessage={handleEncryptMessage}
            onUnlockPassphraseChange={setUnlockPassphraseInput}
            onUnlockKeySubmit={handleUnlockKey}
            onMessageToSignChange={setMessageToSign}
            onSignMessage={handleSignMessage}
          />
        ) : (
          <ProfileSelectorGrid
            keys={keys}
            isLoadingMore={isLoadingMore}
            observerTarget={observerTarget}
            draggingKeyId={draggingKeyId}
            openKeyMenuId={openKeyMenuId}
            didDragKeyRef={didDragKey}
            onSelectKey={handleSelectKey}
            onToggleKeyMenu={(keyId) =>
              setOpenKeyMenuId((curr) => (curr === keyId ? null : keyId))
            }
            onEditKey={openEditKey}
            onMoveKey={moveKey}
            onDeleteKey={handleDeleteKey}
            onOpenAddModal={() => {
              setModalMode("generate");
              setIsAddModalOpen(true);
            }}
            onDragStart={(keyId) => {
              setDraggingKeyId(keyId);
            }}
            onDragEnter={(targetKeyId) => {
              if (!draggingKeyId || draggingKeyId === targetKeyId) return;
              const fromIndex = keys.findIndex((i) => i.id === draggingKeyId);
              const targetIndex = keys.findIndex((i) => i.id === targetKeyId);
              if (fromIndex < targetIndex) swapKeys(draggingKeyId, 1);
              if (fromIndex > targetIndex) swapKeys(draggingKeyId, -1);
            }}
            onDragEnd={() => {
              setDraggingKeyId(null);
              dragStartX.current = null;
            }}
            onPointerDown={handleKeyPointerDown}
            onPointerMove={handleKeyPointerMove}
            onPointerUp={handleKeyPointerUp}
            onContextMenu={handleKeyContextMenu}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      {isProfileActive && selectedKey && (
        <BottomNav
          selectedKeyId={selectedKey.id}
          pageMode={pageMode}
          onOpenContacts={() => setIsContactDialogOpen(true)}
          onShowSecurity={() => setShowMessenger(false)}
        />
      )}

      {/* Setup / Import Dialog */}
      <AddKeyDialog
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        modalMode={modalMode}
        onModalModeChange={setModalMode}
        newHandle={newHandle}
        onNewHandleChange={setNewHandle}
        newPassphrase={newPassphrase}
        onNewPassphraseChange={setNewPassphrase}
        showPassphrase={showPassphrase}
        onToggleShowPassphrase={() => setShowPassphrase(!showPassphrase)}
        newKeyType={newKeyType}
        onNewKeyTypeChange={setNewKeyType}
        newAvatarColor={newAvatarColor}
        onNewAvatarColorChange={setNewAvatarColor}
        armoredInputText={armoredInputText}
        onArmoredTextChange={handleArmoredTextChange}
        parsedKeyInfo={parsedKeyInfo}
        parseError={parseError}
        isParsingKey={isParsingKey}
        importPassphrase={importPassphrase}
        onImportPassphraseChange={(val) => {
          setImportPassphrase(val);
          if (parseError) setParseError(null);
        }}
        showImportPassphrase={showImportPassphrase}
        onToggleShowImportPassphrase={() =>
          setShowImportPassphrase((v) => !v)
        }
        isCreatingKey={isCreatingKey}
        creationStatusText={creationStatusText}
        onSubmit={handleCreateKey}
      />

      {/* Edit Profile Dialog */}
      <EditKeyDialog
        editingKey={editingKey}
        editHandle={editHandle}
        editAvatarColor={editAvatarColor}
        isUpdatingKey={isUpdatingKey}
        onClose={() => setEditingKey(null)}
        onEditHandleChange={setEditHandle}
        onEditAvatarColorChange={setEditAvatarColor}
        onSubmit={handleUpdateKey}
      />

      {/* Deletion Confirmation Dialog */}
      <DeleteConfirmDialog
        deleteRequest={deleteRequest}
        onCancel={() => setDeleteRequest(null)}
        onConfirm={() => void confirmDeleteRequest()}
      />

      {/* UI Error Alert Dialog */}
      <UiErrorDialog uiError={uiError} onDismiss={() => setUiError(null)} />

      {/* Add Contact Sheet */}
      <AddContactSheet
        isOpen={isContactDialogOpen}
        onOpenChange={(open) => {
          setIsContactDialogOpen(open);
          if (!open) setContactError(null);
        }}
        contactName={contactName}
        onContactNameChange={setContactName}
        contactKeyText={contactKeyText}
        onContactKeyTextChange={setContactKeyText}
        contactError={contactError}
        onSubmit={handleAddContact}
      />
    </div>
  );
}
