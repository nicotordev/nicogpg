"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  ArrowLeft,
  Copy,
  LoaderCircle,
  Star,
  MessageCircle,
  PanelLeft,
  Send,
  Trash2,
  UserPlus,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { contactKind, type ChatMessage, type Contact, type ContactKind } from "../types";
import { cn } from "@/lib/utils";

interface MessengerCardProps {
  contacts: Contact[];
  contactsReady: boolean;
  selectedContactId: string;
  selectedMessages: ChatMessage[];
  loadingMessages: boolean;
  messageToContact: string;
  isEncryptingMessage: boolean;
  contactError: string | null;
  copiedId: string | null;
  showMessenger: boolean;
  onSelectContact: (contactId: string) => void;
  onDeleteContact: (contactId: string) => void;
  onOpenAddContactDialog: () => void;
  onCreateSelfChat: () => void;
  onMessageChange: (value: string) => void;
  onEncryptMessage: () => void;
  onCopyText: (text: string, id: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onToggleFavorite: (messageId: string) => void;
  onClearChat: () => void;
}

function kindLabel(kind: ContactKind | null): string {
  if (kind === "self") return "Note to self";
  if (kind === "local") return "Keyless";
  if (kind === "keyed") return "Encrypted chat";
  return "Choose a chat";
}

function statusLabel(kind: ContactKind | null): string {
  if (kind === "self") return "Encrypted with your key";
  if (kind === "local") return "Encrypted with this profile's key";
  if (kind === "keyed") return "Encrypted with OpenPGP";
  return "Choose a chat to start";
}

function messageTime(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

export function MessengerCard({
  contacts,
  contactsReady,
  selectedContactId,
  selectedMessages,
  loadingMessages,
  messageToContact,
  isEncryptingMessage,
  contactError,
  copiedId,
  showMessenger,
  onSelectContact,
  onDeleteContact,
  onOpenAddContactDialog,
  onCreateSelfChat,
  onMessageChange,
  onEncryptMessage,
  onCopyText,
  onDeleteMessage,
  onToggleFavorite,
  onClearChat,
}: MessengerCardProps) {
  const [mobileThread, setMobileThread] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedContactId) setMobileThread(true);
    else setMobileThread(false);
    setShowFavorites(false);
    setConfirmClear(false);
  }, [selectedContactId]);

  const selectedContact = contacts.find(
    (contact) => contact.id === selectedContactId,
  );
  const selectedKind = selectedContact ? contactKind(selectedContact) : null;
  const canSend = Boolean(
    selectedContact && messageToContact.trim() && !isEncryptingMessage,
  );
  const visibleMessages = showFavorites
    ? selectedMessages.filter((message) => message.favorite)
    : selectedMessages;

  function openChat(contactId: string) {
    onSelectContact(contactId);
    setMobileThread(true);
  }

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: "end" });
  }, [selectedContactId, selectedMessages.length]);

  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    if (canSend) onEncryptMessage();
  }

  return (
    <div
      className={cn(
        "flex min-h-0 w-full basis-0 flex-1 flex-col overflow-hidden bg-slate-950",
        !showMessenger && "hidden",
      )}
    >
      {!contactsReady ? (
        <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-slate-400">
          Loading chats…
        </div>
      ) : contacts.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-red-600/15 text-red-400">
            <MessageCircle className="size-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">Your chats</h2>
            <p className="max-w-sm text-sm text-slate-400">
              Create a keyless chat or encrypt messages for yourself with this profile&apos;s key.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" variant="outline" onClick={onCreateSelfChat} className="border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800">
              <UserRound className="mr-2 size-4" /> Note to self
            </Button>
            <Button type="button" onClick={onOpenAddContactDialog} className="bg-red-600 text-white hover:bg-red-700">
              <UserPlus className="mr-2 size-4" /> Add contact
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 min-w-0 basis-0 flex-1">
          <aside
            className={cn(
              "min-h-0 w-full shrink-0 flex-col overflow-hidden border-white/8 bg-[#080d1c] md:w-80 md:border-r lg:w-96",
              mobileThread ? "hidden md:flex" : "flex",
              sidebarHidden && "md:hidden",
            )}
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/8 px-4">
              <h2 className="text-lg font-semibold text-white">Chats</h2>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  title="Note to self"
                  aria-label="Note to self"
                  onClick={onCreateSelfChat}
                  className="text-slate-300 hover:bg-slate-900 hover:text-white"
                >
                  <UserRound className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  title="Add contact"
                  aria-label="Add contact"
                  onClick={onOpenAddContactDialog}
                  className="text-slate-300 hover:bg-slate-900 hover:text-white"
                >
                  <UserPlus className="size-4" />
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {contacts.map((contact) => {
                const active = contact.id === selectedContactId;
                const preview = contact.hasMessages
                  ? "Encrypted message"
                  : kindLabel(contactKind(contact));
                return (
                  <div
                    key={contact.id}
                    className={cn(
                      "flex items-center gap-1 border-b border-white/5 pr-2",
                      active ? "bg-red-950/50" : "hover:bg-slate-900",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => openChat(contact.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-semibold text-white">
                        {initials(contact.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-white">
                          {contact.name}
                        </span>
                        <span className="block truncate text-xs text-slate-400">
                          {preview}
                        </span>
                      </span>
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      title={`Delete ${contact.name}`}
                      aria-label={`Delete ${contact.name}`}
                      onClick={() => onDeleteContact(contact.id)}
                      className="shrink-0 text-slate-500 hover:bg-red-950/40 hover:text-red-300"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </aside>

          <section
            className={cn(
              "min-h-0 min-w-0 basis-0 flex-1 flex-col overflow-hidden bg-slate-950",
              mobileThread ? "flex" : "hidden md:flex",
            )}
          >
            <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/8 bg-[#080d1c] px-2 sm:px-3">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setMobileThread(false)}
                aria-label="Back to chats"
                className="text-slate-200 hover:bg-slate-900 md:hidden"
              >
                <ArrowLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setSidebarHidden((hidden) => !hidden)}
                aria-label={sidebarHidden ? "Show chats" : "Hide chats"}
                title={sidebarHidden ? "Show chats" : "Hide chats"}
                className="hidden text-slate-200 hover:bg-slate-900 md:inline-flex"
              >
                <PanelLeft className="size-4" />
              </Button>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white">
                {selectedContact ? initials(selectedContact.name) : "?"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {selectedContact?.name ?? "Select a chat"}
                </p>
                <p className="truncate text-xs text-red-400">
                  {showFavorites ? "Favorite messages" : statusLabel(selectedKind)}
                </p>
              </div>
              {selectedContact ? (
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-pressed={showFavorites}
                    title={showFavorites ? "Show all messages" : "Show favorite messages"}
                    aria-label={showFavorites ? "Show all messages" : "Show favorite messages"}
                    onClick={() => setShowFavorites((current) => !current)}
                    className={cn(
                      "text-slate-200 hover:bg-slate-900",
                      showFavorites && "text-amber-300",
                    )}
                  >
                    <Star className={cn("size-4", showFavorites && "fill-amber-300")} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    title="Clear chat"
                    aria-label="Clear chat"
                    disabled={selectedMessages.length === 0}
                    onClick={() => setConfirmClear(true)}
                    className="text-slate-200 hover:bg-red-950/40 hover:text-red-300"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ) : null}
            </header>
            {confirmClear ? (
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/8 bg-red-950/40 px-3 py-2 text-xs text-red-100">
                <p>Delete every message in this chat?</p>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="rounded-full px-3 py-1 text-slate-200 hover:bg-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmClear(false);
                      onClearChat();
                    }}
                    className="rounded-full bg-red-600 px-3 py-1 font-medium text-white hover:bg-red-700"
                  >
                    Clear chat
                  </button>
                </div>
              </div>
            ) : null}

            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-950 px-3 py-4 sm:px-6">
              {!selectedContact ? (
                <p className="mx-auto mt-16 max-w-xs rounded-lg border border-white/8 bg-[#0b1122] px-4 py-3 text-center text-sm text-slate-300">
                  Choose a chat from the list to get started.
                </p>
              ) : loadingMessages && selectedMessages.length === 0 ? (
                <p className="mx-auto mt-16 max-w-xs text-center text-sm text-slate-400">
                  Loading messages…
                </p>
              ) : visibleMessages.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {visibleMessages.map((message) => {
                    const revealed = message.revealedText;
                    const bubbleText = revealed || message.ciphertext;
                    const bubbleIsArmor = bubbleText.includes("BEGIN PGP");
                    const copyId = `message-${message.id}`;
                    return (
                      <div key={message.id} className="flex justify-end">
                        <div className="max-w-[min(85%,32rem)] rounded-2xl rounded-br-md bg-red-600 px-3 py-2 text-white shadow-md shadow-red-950/30">
                          <p className="mb-1 text-[11px] text-red-100/90">
                            {revealed
                              ? "Decrypted message"
                              : selectedKind === "self"
                                ? "Encrypted for you"
                                : "Encrypted message"}
                            {messageTime(message.createdAt)
                              ? ` · ${messageTime(message.createdAt)}`
                              : ""}
                          </p>
                          {bubbleIsArmor ? (
                            <pre className="max-h-48 cursor-text overflow-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed select-text! selection:bg-white! selection:text-red-950!">
                              {bubbleText}
                            </pre>
                          ) : (
                            <p className="cursor-text whitespace-pre-wrap break-words text-sm leading-relaxed select-text! selection:bg-white! selection:text-red-950!">
                              {bubbleText}
                            </p>
                          )}
                          <div className="mt-1 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => onCopyText(bubbleText, copyId)}
                              className="inline-flex items-center gap-1 text-[11px] text-red-100 hover:underline"
                            >
                              <Copy className="size-3" />
                              {copiedId === copyId ? "Copied" : "Copy"}
                            </button>
                            <button
                              type="button"
                              onClick={() => onToggleFavorite(message.id)}
                              className="inline-flex items-center gap-1 text-[11px] text-red-100 hover:underline"
                            >
                              <Star className={cn("size-3", message.favorite && "fill-amber-200")} />
                              {message.favorite ? "Favorited" : "Favorite"}
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteMessage(message.id)}
                              className="inline-flex items-center gap-1 text-[11px] text-red-100 hover:underline"
                            >
                              <Trash2 className="size-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={threadEndRef} />
                </div>
              ) : (
                <p className="mx-auto mt-16 max-w-xs rounded-lg border border-white/8 bg-[#0b1122] px-4 py-3 text-center text-sm text-slate-300">
                  {showFavorites
                    ? "No favorite messages in this chat."
                    : "Type below. Each message is encrypted with OpenPGP and added to this conversation."}
                </p>
              )}
            </div>

            <form
              className="shrink-0 border-t border-white/8 bg-[#080d1c] px-2 py-2 sm:px-3"
              onSubmit={(event) => {
                event.preventDefault();
                if (canSend) onEncryptMessage();
              }}
            >
              <div className="flex items-end gap-2">
                <Textarea
                  value={messageToContact}
                  onChange={(event) => onMessageChange(event.target.value)}
                  onKeyDown={onComposerKeyDown}
                  placeholder={
                    selectedContact
                      ? "Message or /decrypt. Enter sends."
                      : "Select a chat"
                  }
                  rows={messageToContact.includes("BEGIN PGP") ? 6 : 1}
                  disabled={!selectedContact}
                  aria-label="Message"
                  className="max-h-36 min-h-11 flex-1 resize-none rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white shadow-none placeholder:text-slate-500 focus-visible:ring-red-500/40"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!canSend}
                  title={selectedKind === "local" ? "Save note" : "Encrypt & send"}
                  aria-label={selectedKind === "local" ? "Save note" : "Encrypt & send"}
                  className="size-11 shrink-0 rounded-full bg-red-600 text-white hover:bg-red-700"
                >
                  {isEncryptingMessage ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </div>
              {contactError ? (
                <p role="alert" className="px-2 pt-2 text-xs text-red-300">
                  {contactError}
                </p>
              ) : null}
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
