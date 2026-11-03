import type { PgpKeyDto } from "@/app/actions/pgp.actions";
import type { PrivateKey } from "openpgp";
import type { ChatMessage, Contact } from "../types";
import { cn } from "@/lib/utils";
import { WorkspaceHeader } from "./workspace-header";
import { ProfileOverviewCard } from "./profile-overview-card";
import { MessengerCard } from "./messenger-card";
import { SecurityNoticeCard } from "./security-notice-card";
import { SignMessageCard } from "./sign-message-card";

interface PgpWorkspaceProps {
  selectedKey: PgpKeyDto;
  unlockedPrivateKey: PrivateKey | null;
  messageToSign: string;
  signedOutput: string;
  isSigning: boolean;
  copiedId: string | null;
  contacts: Contact[];
  contactsReady: boolean;
  selectedContactId: string;
  selectedMessages: ChatMessage[];
  loadingMessages: boolean;
  messageToContact: string;
  isEncryptingMessage: boolean;
  contactError: string | null;
  showMessenger: boolean;
  onDeleteProfile: (e: React.MouseEvent) => void;
  onLeaveProfile: () => void;
  onCopyText: (text: string, id: string) => void;
  onSelectContact: (contactId: string) => void;
  onDeleteContact: (contactId: string) => void;
  onOpenAddContactDialog: () => void;
  onCreateSelfChat: () => void;
  onMessageToContactChange: (val: string) => void;
  onEncryptMessage: () => void;
  onDeleteMessage: (messageId: string) => void;
  onToggleFavorite: (messageId: string) => void;
  onClearChat: () => void;
  onMessageToSignChange: (val: string) => void;
  onSignMessage: () => void;
}

export function PgpWorkspace({
  selectedKey,
  unlockedPrivateKey,
  messageToSign,
  signedOutput,
  isSigning,
  copiedId,
  contacts,
  contactsReady,
  selectedContactId,
  selectedMessages,
  loadingMessages,
  messageToContact,
  isEncryptingMessage,
  contactError,
  showMessenger,
  onDeleteProfile,
  onLeaveProfile,
  onCopyText,
  onSelectContact,
  onDeleteContact,
  onOpenAddContactDialog,
  onCreateSelfChat,
  onMessageToContactChange,
  onEncryptMessage,
  onDeleteMessage,
  onToggleFavorite,
  onClearChat,
  onMessageToSignChange,
  onSignMessage,
}: PgpWorkspaceProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-1 animate-in fade-in duration-300 flex-col",
        showMessenger
          ? "min-h-0 basis-0 flex-1 overflow-hidden"
          : "min-h-0 bg-[#060914] pb-24",
      )}
    >
      {showMessenger ? null : (
      <WorkspaceHeader
        selectedKey={selectedKey}
        onDeleteProfile={onDeleteProfile}
        onLeaveProfile={onLeaveProfile}
      />
      )}

      {showMessenger ? null : (
      <ProfileOverviewCard
        selectedKey={selectedKey}
        unlockedPrivateKey={unlockedPrivateKey}
        copiedId={copiedId}
        showMessenger={showMessenger}
        onCopyText={onCopyText}
        onDeleteProfile={onDeleteProfile}
      />
      )}

      {showMessenger ? (
      <MessengerCard
        contacts={contacts}
        contactsReady={contactsReady}
        selectedContactId={selectedContactId}
        selectedMessages={selectedMessages}
        loadingMessages={loadingMessages}
        messageToContact={messageToContact}
        isEncryptingMessage={isEncryptingMessage}
        contactError={contactError}
        copiedId={copiedId}
        showMessenger={showMessenger}
        onSelectContact={onSelectContact}
        onDeleteContact={onDeleteContact}
        onOpenAddContactDialog={onOpenAddContactDialog}
        onCreateSelfChat={onCreateSelfChat}
        onMessageChange={onMessageToContactChange}
        onEncryptMessage={onEncryptMessage}
        onCopyText={onCopyText}
        onDeleteMessage={onDeleteMessage}
        onToggleFavorite={onToggleFavorite}
        onClearChat={onClearChat}
      />
      ) : null}

      {showMessenger ? null : <SecurityNoticeCard showMessenger={showMessenger} />}

      {showMessenger ? null : <div className="px-4 md:px-2">
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
      </div>}
    </div>
  );
}
