"use client";

import { cn } from "@/lib/utils";
import type { NetflixGpgSelectorProps } from "./types";
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
import { DecryptPassphraseDialog } from "./dialogs/decrypt-passphrase-dialog";
import { GpgProvider, useGpgContext } from "./context/gpg-context";

function NetflixGpgSelectorContent() {
  const {
    session,
    pageMode,
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
  } = useGpgContext();

  const isProfileActive = Boolean(keysState.selectedKey);

  return (
    <div
      onDragOver={keyCreationState.handleDragOver}
      onDragLeave={keyCreationState.handleDragLeave}
      onDrop={keyCreationState.handleDropFile}
      className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white"
    >
      {/* Full-Screen Drag & Drop File Hover Overlay */}
      <FileDropOverlay isDraggingFile={keyCreationState.isDraggingFile} />

      {/* Top Navigation Header */}
      <GpgHeader
        session={session}
        onOpenImportModal={() => {
          keyCreationState.setModalMode("import");
          keyCreationState.setIsAddModalOpen(true);
        }}
        onOpenContactsDialog={() => {
          contactsState.setContactError(null);
          contactsState.setIsContactDialogOpen(true);
        }}
        onOpenGenerateModal={() => {
          keyCreationState.setModalMode("generate");
          keyCreationState.setIsAddModalOpen(true);
        }}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main
        className={cn(
          "flex-1 flex w-full",
          keysState.selectedKey
            ? cn(
                "min-h-[calc(100vh-4.5rem)] flex-col",
                pageMode === "profile"
                  ? "bg-[#060914] px-6 pb-24 pt-5 sm:px-10 sm:pb-24 sm:pt-7 lg:px-16 lg:pb-24 lg:pt-10"
                  : "p-0 pb-20",
              )
            : "mx-auto max-w-7xl flex-col items-center justify-center p-3 sm:p-6 md:p-12",
        )}
      >
        {isProfileActive && keysState.selectedKey ? (
          <GpgWorkspace
            selectedKey={keysState.selectedKey}
            pageMode={pageMode}
            unlockedPrivateKey={cryptoState.unlockedPrivateKey}
            unlockPassphraseInput={cryptoState.unlockPassphraseInput}
            isUnlocking={cryptoState.isUnlocking}
            unlockError={cryptoState.unlockError}
            messageToSign={cryptoState.messageToSign}
            signedOutput={cryptoState.signedOutput}
            isSigning={cryptoState.isSigning}
            copiedId={copiedId}
            contacts={contactsState.contacts}
            selectedContactId={contactsState.selectedContactId}
            messageToContact={contactsState.messageToContact}
            encryptedMessage={contactsState.encryptedMessage}
            sentPlaintext={contactsState.sentPlaintext}
            showingDecrypted={contactsState.showingDecrypted}
            isEncryptingMessage={contactsState.isEncryptingMessage}
            contactError={contactsState.contactError}
            showMessenger={showMessenger}
            onBackToProfiles={keysState.handleBackToProfiles}
            onDeleteProfile={(e) =>
              keysState.handleDeleteKey(keysState.selectedKey!.id, e)
            }
            onCopyText={copyText}
            onSelectContact={contactsState.selectContact}
            onCreateSelfChat={() => {
              const activeKey = keysState.selectedKey ?? keysState.keys[0];
              if (!keysState.selectedKey && activeKey) {
                keysState.setSelectedKey(activeKey);
              }
              contactsState.handleCreateSelfChat(activeKey);
              setShowMessenger(true);
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
            onEncryptMessage={() =>
              contactsState.handleEncryptMessage(
                keysState.selectedKey,
                (armored) => cryptoState.requestDecrypt(armored),
              )
            }
            onUnlockPassphraseChange={cryptoState.setUnlockPassphraseInput}
            onUnlockKeySubmit={(e) =>
              cryptoState.handleUnlockKey(keysState.selectedKey, e)
            }
            onMessageToSignChange={cryptoState.setMessageToSign}
            onSignMessage={cryptoState.handleSignMessage}
            onToggleMessenger={setShowMessenger}
          />
        ) : (
          <ProfileSelectorGrid
            keys={keysState.keys}
            isLoadingMore={keysState.isLoadingMore}
            observerTarget={keysState.observerTarget}
            draggingKeyId={keysState.draggingKeyId}
            openKeyMenuId={keysState.openKeyMenuId}
            didDragKeyRef={keysState.didDragKey}
            onSelectKey={keysState.handleSelectKey}
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
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      {isProfileActive && keysState.selectedKey && (
        <BottomNav
          selectedKeyId={keysState.selectedKey.id}
          pageMode={pageMode}
          showMessenger={showMessenger}
          onOpenContacts={() => contactsState.setIsContactDialogOpen(true)}
          onShowSecurity={() => setShowMessenger(false)}
          onShowChat={() => setShowMessenger(true)}
          onBackToProfiles={keysState.handleBackToProfiles}
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
            onDeleteContact: (deletedId) => {
              contactsState.removeContact(deletedId);
            },
          })
        }
      />

      {/* UI Error Alert Dialog */}
      <UiErrorDialog
        uiError={keysState.uiError}
        onDismiss={() => keysState.setUiError(null)}
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
            (readable) => {
              contactsState.setSentPlaintext(readable);
              contactsState.setEncryptedMessage("");
              contactsState.setShowingDecrypted(true);
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
            keysState.setSelectedKey(activeKey);
          }
          contactsState.handleCreateSelfChat(activeKey);
          setShowMessenger(true);
        }}
      />
    </div>
  );
}

export function NetflixGpgSelector({
  initialSession,
  pageMode = "dashboard",
  profileKeyId,
}: NetflixGpgSelectorProps) {
  return (
    <GpgProvider
      initialSession={initialSession}
      pageMode={pageMode}
      profileKeyId={profileKeyId}
    >
      <NetflixGpgSelectorContent />
    </GpgProvider>
  );
}

export { useGpgContext } from "./context/gpg-context";
