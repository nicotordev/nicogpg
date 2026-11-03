"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NetflixPgpSelectorProps } from "./types";
import { FileDropOverlay } from "./file-drop-overlay";
import { PgpHeader } from "./pgp-header";
import { BottomNav } from "./bottom-nav";
import { ContactsScreen } from "./contacts-screen";
import { ProfileSelectorGrid } from "./profile-grid/profile-selector-grid";
import { PgpWorkspace } from "./workspace/pgp-workspace";
import { AddKeyDialog } from "./dialogs/add-key-dialog";
import { EditKeyDialog } from "./dialogs/edit-key-dialog";
import { DeleteConfirmDialog } from "./dialogs/delete-confirm-dialog";
import { AddContactSheet } from "./dialogs/add-contact-sheet";
import { UiErrorDialog } from "./dialogs/ui-error-dialog";
import { DecryptPassphraseDialog } from "./dialogs/decrypt-passphrase-dialog";
import {
  LeaveProfileDialog,
  ProfilePassphraseDialog,
} from "./dialogs/profile-session-dialogs";
import { PgpProvider, usePgpContext } from "./context/pgp-context";
import {
  isSelectedProfileFallbackPaused,
  useSelectedProfileHydrated,
  useSelectedProfileStore,
} from "./selected-profile-store";

type VaultView = "profiles" | "chat" | "profile" | "contacts";

function viewFromPath(pathname: string): VaultView {
  if (pathname.startsWith("/chat")) return "chat";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/contacts")) return "contacts";
  return "profiles";
}

function NetflixPgpSelectorContent() {
  const {
    session,
    keysState,
    cryptoState,
    contactsState,
    keyCreationState,
    copiedId,
    copyText,
    completeKeySave,
    handleSignOut,
  } = usePgpContext();
  const pathname = usePathname();
  const router = useRouter();
  const profileKeyId = useSelectedProfileStore((state) => state.profileKeyId);
  const setProfileKeyId = useSelectedProfileStore((state) => state.setProfileKeyId);
  const pendingUnlockId = useSelectedProfileStore((state) => state.pendingUnlockId);
  const setPendingUnlockId = useSelectedProfileStore((state) => state.setPendingUnlockId);
  const profileHydrated = useSelectedProfileHydrated();
  const view = viewFromPath(pathname);
  const showMessenger = view === "chat";
  const [unlockKeyId, setUnlockKeyId] = useState<string | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const insidePath = useRef("/chat");
  const skipLeaveRedirect = useRef(false);
  const profileSessionOpen =
    cryptoState.openProfileId !== null && cryptoState.openProfileId === profileKeyId;

  useEffect(() => {
    if (view !== "profiles") insidePath.current = pathname;
  }, [view, pathname]);

  useEffect(() => {
    if (!profileHydrated || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const keyFromUrl = params.get("key");
    if (!keyFromUrl) return;
    setProfileKeyId(keyFromUrl);
    params.delete("key");
    const search = params.toString();
    const path = window.location.pathname;
    router.replace(search ? `${path}?${search}` : path);
  }, [profileHydrated, pathname, router, setProfileKeyId]);

  useEffect(() => {
    if (!pendingUnlockId) return;
    setUnlockKeyId(pendingUnlockId);
    setPendingUnlockId(null);
  }, [pendingUnlockId, setPendingUnlockId]);

  useEffect(() => {
    if (!profileHydrated || view === "profiles") return;
    if (profileSessionOpen) return;
    if (isSelectedProfileFallbackPaused()) return;
    if (!profileKeyId) {
      router.replace("/");
      return;
    }
    const key =
      keysState.selectedKey?.id === profileKeyId
        ? keysState.selectedKey
        : keysState.keys.find((item) => item.id === profileKeyId);
    if (!key) return;
    if (!key.encryptedPrivateKey) {
      cryptoState.enterProfile(key.id);
      return;
    }
    setUnlockKeyId(key.id);
    router.replace("/");
  }, [
    profileHydrated,
    view,
    profileSessionOpen,
    profileKeyId,
    keysState.selectedKey,
    keysState.keys,
    cryptoState,
    router,
  ]);

  useEffect(() => {
    if (view !== "profiles") skipLeaveRedirect.current = false;
  }, [view]);

  useEffect(() => {
    if (!unlockKeyId || cryptoState.openProfileId !== unlockKeyId) return;
    skipLeaveRedirect.current = true;
    setUnlockKeyId(null);
    if (view !== "chat") router.push("/chat");
  }, [cryptoState.openProfileId, unlockKeyId, view, router]);

  useEffect(() => {
    if (!profileHydrated || view !== "profiles" || !cryptoState.openProfileId) return;
    if (skipLeaveRedirect.current) return;
    setLeaveOpen(true);
    router.replace(insidePath.current);
  }, [profileHydrated, view, cryptoState.openProfileId, router]);

  function requestLeaveProfile() {
    if (!cryptoState.openProfileId) {
      router.push("/");
      return;
    }
    setLeaveOpen(true);
  }

  function confirmLeaveProfile() {
    cryptoState.lockKey();
    setProfileKeyId(null);
    keysState.setSelectedKey(null);
    setUnlockKeyId(null);
    setLeaveOpen(false);
    router.push("/");
  }

  function selectProfile(keyId: string) {
    const key = keysState.keys.find((item) => item.id === keyId);
    if (!key) return;
    if (cryptoState.openProfileId === keyId) {
      router.push("/chat");
      return;
    }
    if (cryptoState.openProfileId) cryptoState.lockKey();
    keysState.handleSelectKey(keyId);
    if (!key.encryptedPrivateKey) {
      skipLeaveRedirect.current = true;
      cryptoState.enterProfile(keyId);
      router.push("/chat");
      return;
    }
    cryptoState.setUnlockPassphraseInput("");
    cryptoState.setUnlockError(null);
    setUnlockKeyId(keyId);
  }

  const isProfileActive = Boolean(keysState.selectedKey);

  return (
    <div
      onDragOver={keyCreationState.handleDragOver}
      onDragLeave={keyCreationState.handleDragLeave}
      onDrop={keyCreationState.handleDropFile}
      className={cn(
        "relative w-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white",
        view === "chat"
          ? "fixed inset-0 z-40 h-dvh max-h-dvh overflow-hidden"
          : "min-h-screen",
      )}
      style={
        view === "chat"
          ? { height: "100dvh", maxHeight: "100dvh" }
          : undefined
      }
    >
      {/* Full-Screen Drag & Drop File Hover Overlay */}
      <FileDropOverlay isDraggingFile={keyCreationState.isDraggingFile} />

      {view === "chat" ? null : (
      <PgpHeader
        session={session}
        onOpenImportModal={() => {
          keyCreationState.setModalMode("import");
          keyCreationState.setIsAddModalOpen(true);
        }}
        onOpenGenerateModal={() => {
          keyCreationState.setModalMode("generate");
          keyCreationState.setIsAddModalOpen(true);
        }}
        onSignOut={handleSignOut}
      />
      )}

      {/* Main Content Area */}
      <main
        className={cn(
          "flex-1 flex w-full",
          view === "profiles"
            ? "mx-auto max-w-7xl flex-col items-center justify-center p-3 sm:p-6 md:p-12"
            : cn(
                "flex-col",
                view === "chat"
                  ? "min-h-0 basis-0 flex-1 overflow-hidden p-0"
                  : view === "contacts"
                    ? "min-h-0 overflow-hidden p-0 pb-0"
                    : "min-h-0 flex-1 bg-[#060914] p-0",
              ),
        )}
      >
        {view === "profiles" ? (
          <ProfileSelectorGrid
            keys={keysState.keys}
            isLoadingMore={keysState.isLoadingMore}
            observerTarget={keysState.observerTarget}
            draggingKeyId={keysState.draggingKeyId}
            openKeyMenuId={keysState.openKeyMenuId}
            didDragKeyRef={keysState.didDragKey}
            onSelectKey={selectProfile}
            onToggleKeyMenu={(keyId) =>
              keysState.setOpenKeyMenuId((curr) =>
                curr === keyId ? null : keyId,
              )
            }
            onEditKey={keysState.openEditKey}
            onMoveKey={keysState.moveKey}
            onDeleteKey={keysState.handleDeleteKey}
            onOpenAddModal={() => {
              keyCreationState.setModalMode("generate");
              keyCreationState.setIsAddModalOpen(true);
            }}
            onDragStart={(keyId) => {
              keysState.setDraggingKeyId(keyId);
            }}
            onDragEnter={(targetKeyId) => {
              if (
                !keysState.draggingKeyId ||
                keysState.draggingKeyId === targetKeyId
              )
                return;
              const fromIndex = keysState.keys.findIndex(
                (i) => i.id === keysState.draggingKeyId,
              );
              const targetIndex = keysState.keys.findIndex(
                (i) => i.id === targetKeyId,
              );
              if (fromIndex < targetIndex) keysState.swapKeys(keysState.draggingKeyId, 1);
              if (fromIndex > targetIndex) keysState.swapKeys(keysState.draggingKeyId, -1);
            }}
            onDragEnd={() => {
              keysState.setDraggingKeyId(null);
            }}
            onPointerDown={keysState.handleKeyPointerDown}
            onPointerMove={keysState.handleKeyPointerMove}
            onPointerUp={keysState.handleKeyPointerUp}
            onContextMenu={keysState.handleKeyContextMenu}
          />
        ) : view === "contacts" && keysState.selectedKey ? (
          <ContactsScreen
            contacts={contactsState.contacts}
            contactsReady={contactsState.contactsReady}
            onOpenChat={(contactId) => {
              contactsState.selectContact(contactId);
              router.push("/chat");
            }}
            onDeleteContact={(contactId) => {
              const contact = contactsState.contacts.find((item) => item.id === contactId);
              if (contact) keysState.requestDeleteContact(contactId, contact.name);
            }}
            onOpenAddContactDialog={() => {
              contactsState.setContactError(null);
              contactsState.setIsContactDialogOpen(true);
            }}
            onCreateSelfChat={() => {
              contactsState.handleCreateSelfChat(keysState.selectedKey);
              router.push("/chat");
            }}
          />
        ) : isProfileActive && keysState.selectedKey ? (
          <PgpWorkspace
            selectedKey={keysState.selectedKey}
            unlockedPrivateKey={cryptoState.unlockedPrivateKey}
            messageToSign={cryptoState.messageToSign}
            signedOutput={cryptoState.signedOutput}
            isSigning={cryptoState.isSigning}
            copiedId={copiedId}
            contacts={contactsState.contacts}
            contactsReady={contactsState.contactsReady}
            selectedContactId={contactsState.selectedContactId}
            selectedMessages={contactsState.selectedMessages}
            loadingMessages={contactsState.loadingMessages}
            messageToContact={contactsState.messageToContact}
            isEncryptingMessage={contactsState.isEncryptingMessage}
            contactError={contactsState.contactError}
            showMessenger={showMessenger}
            onLeaveProfile={requestLeaveProfile}
            onDeleteProfile={(e) =>
              keysState.handleDeleteKey(keysState.selectedKey!.id, e)
            }
            onCopyText={copyText}
            onSelectContact={contactsState.selectContact}
            onCreateSelfChat={() => {
              const activeKey = keysState.selectedKey ?? keysState.keys[0];
              if (!activeKey) return;
              if (!keysState.selectedKey) {
                setProfileKeyId(activeKey.id);
                keysState.setSelectedKey(activeKey);
              }
              contactsState.handleCreateSelfChat(activeKey);
              router.push("/chat");
            }}
            onDeleteContact={(contactId) => {
              const contact = contactsState.contacts.find(
                (c) => c.id === contactId,
              );
              if (contact) {
                keysState.requestDeleteContact(contactId, contact.name);
              }
            }}
            onOpenAddContactDialog={() => {
              contactsState.setContactError(null);
              contactsState.setIsContactDialogOpen(true);
            }}
            onMessageToContactChange={contactsState.setMessageToContact}
            onDeleteMessage={(messageId) => {
              void contactsState.deleteMessage(messageId);
            }}
            onToggleFavorite={(messageId) => {
              void contactsState.toggleMessageFavorite(messageId);
            }}
            onClearChat={() => {
              void contactsState.clearSelectedChat();
            }}
            onEncryptMessage={() =>
              contactsState.handleEncryptMessage(
                keysState.selectedKey,
                (armored) => {
                  void cryptoState.decryptWithUnlockedKey(armored).then(
                    (readable) => {
                      contactsState.revealDecryptedMessage(armored, readable);
                    },
                    (error: unknown) => {
                      console.error("Decrypt command error:", error);
                      contactsState.setContactError(
                        "Could not decrypt this message with the open profile.",
                      );
                    },
                  );
                },
              )
            }
            onMessageToSignChange={cryptoState.setMessageToSign}
            onSignMessage={cryptoState.handleSignMessage}
          />
        ) : (
          <p className="m-auto max-w-sm px-6 text-center text-sm text-slate-400">
            Choose a profile to continue.
          </p>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      {view !== "profiles" && (
        <BottomNav
          docked={view === "chat" || view === "contacts"}
          onLeaveProfile={requestLeaveProfile}
        />
      )}

      {/* Setup / Import Dialog */}
      <AddKeyDialog
        isOpen={keyCreationState.isAddModalOpen}
        onOpenChange={keyCreationState.setIsAddModalOpen}
        modalMode={keyCreationState.modalMode}
        onModalModeChange={keyCreationState.setModalMode}
        newHandle={keyCreationState.newHandle}
        onNewHandleChange={keyCreationState.setNewHandle}
        newPassphrase={keyCreationState.newPassphrase}
        onNewPassphraseChange={keyCreationState.setNewPassphrase}
        showPassphrase={keyCreationState.showPassphrase}
        onToggleShowPassphrase={() =>
          keyCreationState.setShowPassphrase(
            !keyCreationState.showPassphrase,
          )
        }
        newKeyType={keyCreationState.newKeyType}
        onNewKeyTypeChange={keyCreationState.setNewKeyType}
        newAvatarColor={keyCreationState.newAvatarColor}
        onNewAvatarColorChange={keyCreationState.setNewAvatarColor}
        armoredInputText={keyCreationState.armoredInputText}
        onArmoredTextChange={keyCreationState.handleArmoredTextChange}
        parsedKeyInfo={keyCreationState.parsedKeyInfo}
        parseError={keyCreationState.parseError}
        isParsingKey={keyCreationState.isParsingKey}
        importPassphrase={keyCreationState.importPassphrase}
        onImportPassphraseChange={(val) => {
          keyCreationState.setImportPassphrase(val);
          if (keyCreationState.parseError)
            keyCreationState.setParseError(null);
        }}
        showImportPassphrase={keyCreationState.showImportPassphrase}
        onToggleShowImportPassphrase={() =>
          keyCreationState.setShowImportPassphrase((v) => !v)
        }
        isCreatingKey={keyCreationState.isCreatingKey}
        creationStatusText={keyCreationState.creationStatusText}
        onSubmit={(e) =>
          keyCreationState.handleCreateKey(e, {
            onSuccess: completeKeySave,
            onError: (err) => keysState.setUiError(err),
          })
        }
      />

      {/* Edit Profile Dialog */}
      <EditKeyDialog
        editingKey={keysState.editingKey}
        editHandle={keysState.editHandle}
        editAvatarColor={keysState.editAvatarColor}
        isUpdatingKey={keysState.isUpdatingKey}
        onClose={() => keysState.setEditingKey(null)}
        onEditHandleChange={keysState.setEditHandle}
        onEditAvatarColorChange={keysState.setEditAvatarColor}
        onSubmit={keysState.handleUpdateKey}
      />

      {/* Deletion Confirmation Dialog */}
      <DeleteConfirmDialog
        deleteRequest={keysState.deleteRequest}
        onCancel={() => keysState.setDeleteRequest(null)}
        onConfirm={() =>
          void keysState.confirmDeleteRequest({
            onDeleteKey: (deletedId) => {
              if (keysState.selectedKey?.id === deletedId) {
                cryptoState.lockKey();
              }
            },
            onDeleteContact: (deletedId) => contactsState.removeContact(deletedId),
          })
        }
      />

      {/* UI Error Alert Dialog */}
      <UiErrorDialog
        uiError={keysState.uiError}
        onDismiss={() => keysState.setUiError(null)}
      />

      <ProfilePassphraseDialog
        open={unlockKeyId !== null}
        profileName={
          keysState.keys.find((item) => item.id === unlockKeyId)?.handle ??
          keysState.selectedKey?.handle ??
          ""
        }
        passphrase={cryptoState.unlockPassphraseInput}
        error={cryptoState.unlockError}
        isUnlocking={cryptoState.isUnlocking}
        onOpenChange={(open) => {
          if (open) return;
          setUnlockKeyId(null);
          cryptoState.setUnlockPassphraseInput("");
          cryptoState.setUnlockError(null);
        }}
        onPassphraseChange={(value) => {
          cryptoState.setUnlockPassphraseInput(value);
          if (cryptoState.unlockError) cryptoState.setUnlockError(null);
        }}
        onSubmit={(event) => {
          const key =
            keysState.keys.find((item) => item.id === unlockKeyId) ??
            (keysState.selectedKey?.id === unlockKeyId ? keysState.selectedKey : null);
          void cryptoState.handleUnlockKey(key, event);
        }}
      />

      <LeaveProfileDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        onConfirm={confirmLeaveProfile}
      />

      {/* Decrypt Dialog */}
      <DecryptPassphraseDialog
        open={cryptoState.decryptDialogOpen}
        passphrase={cryptoState.decryptPassphrase}
        error={cryptoState.decryptDialogError}
        isDecrypting={cryptoState.isDecrypting}
        onOpenChange={(open) => {
          if (!open) cryptoState.closeDecryptDialog();
        }}
        onPassphraseChange={(value) => {
          cryptoState.setDecryptPassphrase(value);
          if (cryptoState.decryptDialogError)
            cryptoState.setDecryptDialogError(null);
        }}
        onSubmit={(e) =>
          cryptoState.handleDecryptPassphrase(
            keysState.selectedKey,
            e,
            (readable, armored) => {
              contactsState.revealDecryptedMessage(armored, readable);
            },
          )
        }
      />

      {/* Add Contact Sheet */}
      <AddContactSheet
        isOpen={contactsState.isContactDialogOpen}
        onOpenChange={(open) => {
          contactsState.setIsContactDialogOpen(open);
          if (!open) contactsState.setContactError(null);
        }}
        contactName={contactsState.contactName}
        onContactNameChange={contactsState.setContactName}
        contactKeyText={contactsState.contactKeyText}
        onContactKeyTextChange={contactsState.setContactKeyText}
        contactError={contactsState.contactError}
        onSubmit={contactsState.handleAddContact}
        onCreateSelfChat={() => {
          const activeKey = keysState.selectedKey ?? keysState.keys[0];
          if (!keysState.selectedKey && activeKey) {
            setProfileKeyId(activeKey.id);
            keysState.setSelectedKey(activeKey);
          }
          contactsState.handleCreateSelfChat(activeKey);
          if (activeKey) router.push("/chat");
        }}
      />
    </div>
  );
}

export function NetflixPgpSelector({
  initialSession,
  initialKeys,
  initialNextCursor,
  initialSelectedKey,
  children,
}: NetflixPgpSelectorProps & { children?: ReactNode }) {
  return (
    <PgpProvider
      initialSession={initialSession}
      initialKeys={initialKeys}
      initialNextCursor={initialNextCursor}
      initialSelectedKey={initialSelectedKey}
    >
      <NetflixPgpSelectorContent />
      {children}
    </PgpProvider>
  );
}

export { usePgpContext } from "./context/pgp-context";
