import type { GpgKeyDto } from "@/app/actions/gpg.actions";
import type { PrivateKey } from "openpgp";
import type { Contact } from "../types";
import { cn } from "@/lib/utils";
import { WorkspaceHeader } from "./workspace-header";
import { ProfileOverviewCard } from "./profile-overview-card";
import { MessengerCard } from "./messenger-card";
import { SecurityNoticeCard } from "./security-notice-card";
import { UnlockKeyCard } from "./unlock-key-card";
import { SignMessageCard } from "./sign-message-card";

interface GpgWorkspaceProps {
  selectedKey: GpgKeyDto;
  pageMode?: "dashboard" | "profile";
  unlockedPrivateKey: PrivateKey | null;
  unlockPassphraseInput: string;
  isUnlocking: boolean;
  unlockError: string | null;
  messageToSign: string;
  signedOutput: string;
  isSigning: boolean;
  copiedId: string | null;
  contacts: Contact[];
  selectedContactId: string;
  messageToContact: string;
  encryptedMessage: string;
  isEncryptingMessage: boolean;
  contactError: string | null;
  showMessenger: boolean;
  onBackToProfiles: () => void;
  onDeleteProfile: (e: React.MouseEvent) => void;
  onCopyText: (text: string, id: string) => void;
  onSelectContact: (contactId: string) => void;
  onDeleteContact: (contactId: string) => void;
  onOpenAddContactDialog: () => void;
  onMessageToContactChange: (val: string) => void;
  onEncryptMessage: () => void;
  onUnlockPassphraseChange: (val: string) => void;
  onUnlockKeySubmit: (e: React.FormEvent) => void;
  onMessageToSignChange: (val: string) => void;
  onSignMessage: () => void;
}

export function GpgWorkspace({
  selectedKey,
  pageMode = "dashboard",
  unlockedPrivateKey,
  unlockPassphraseInput,
  isUnlocking,
  unlockError,
  messageToSign,
  signedOutput,
  isSigning,
  copiedId,
  contacts,
  selectedContactId,
  messageToContact,
  encryptedMessage,
  isEncryptingMessage,
  contactError,
  showMessenger,
  onBackToProfiles,
  onDeleteProfile,
  onCopyText,
  onSelectContact,
  onDeleteContact,
  onOpenAddContactDialog,
  onMessageToContactChange,
  onEncryptMessage,
  onUnlockPassphraseChange,
  onUnlockKeySubmit,
  onMessageToSignChange,
  onSignMessage,
}: GpgWorkspaceProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-1 animate-in fade-in duration-300 flex-col",
        pageMode === "profile"
          ? "min-h-0 space-y-8 bg-[#060914] sm:space-y-10"
          : "min-h-[calc(100vh-4.5rem)]",
      )}
    >
      <WorkspaceHeader
        selectedKey={selectedKey}
        pageMode={pageMode}
        onBackToProfiles={onBackToProfiles}
        onDeleteProfile={onDeleteProfile}
      />

      <ProfileOverviewCard
        selectedKey={selectedKey}
        unlockedPrivateKey={unlockedPrivateKey}
        copiedId={copiedId}
        showMessenger={showMessenger}
        onCopyText={onCopyText}
        onDeleteProfile={onDeleteProfile}
      />

      <MessengerCard
        contacts={contacts}
        selectedContactId={selectedContactId}
        messageToContact={messageToContact}
        encryptedMessage={encryptedMessage}
        isEncryptingMessage={isEncryptingMessage}
        contactError={contactError}
        copiedId={copiedId}
        showMessenger={showMessenger}
        onSelectContact={onSelectContact}
        onDeleteContact={onDeleteContact}
        onOpenAddContactDialog={onOpenAddContactDialog}
        onMessageChange={onMessageToContactChange}
        onEncryptMessage={onEncryptMessage}
        onCopyText={onCopyText}
      />

      <SecurityNoticeCard showMessenger={showMessenger} />

      <UnlockKeyCard
        showMessenger={showMessenger}
        hasEncryptedPrivateKey={Boolean(selectedKey.encryptedPrivateKey)}
        isUnlocked={Boolean(unlockedPrivateKey)}
        passphraseInput={unlockPassphraseInput}
        isUnlocking={isUnlocking}
        unlockError={unlockError}
        onPassphraseChange={onUnlockPassphraseChange}
        onSubmit={onUnlockKeySubmit}
      />

      <div className="px-4 md:px-2">
        <SignMessageCard
          showMessenger={showMessenger}
          isUnlocked={Boolean(unlockedPrivateKey)}
          messageToSign={messageToSign}
          signedOutput={signedOutput}
          isSigning={isSigning}
          copiedId={copiedId}
          onMessageChange={onMessageToSignChange}
          onSignMessage={onSignMessage}
          onCopyText={onCopyText}
        />
      </div>
    </div>
  );
}
