import {
  MessageCircle,
  UserPlus,
  UserRound,
  Trash2,
  MoreVertical,
  LoaderCircle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { contactKind, type Contact } from "../types";
import { cn } from "@/lib/utils";

interface MessengerCardProps {
  contacts: Contact[];
  selectedContactId: string;
  messageToContact: string;
  encryptedMessage: string;
  sentPlaintext: string;
  showingDecrypted: boolean;
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
}

export function MessengerCard({
  contacts,
  selectedContactId,
  messageToContact,
  encryptedMessage,
  sentPlaintext,
  showingDecrypted,
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
}: MessengerCardProps) {
  const selectedContact = contacts.find(
    (contact) => contact.id === selectedContactId,
  );
  const selectedKind = selectedContact ? contactKind(selectedContact) : null;
  const statusLabel =
    selectedKind === "self"
      ? "Cifrado con tu clave"
      : selectedKind === "local"
        ? "Nota en este navegador"
        : selectedKind === "keyed"
          ? "Encrypted with OpenPGP"
          : "Choose a contact to begin";

  return (
    <div className="px-4">
      <Card
        className={cn(
          "flex min-h-0 flex-1 overflow-hidden rounded-xl border border-white/8 bg-[#101114] p-0 shadow-lg shadow-black/20",
          !showMessenger && "hidden",
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3 sm:px-5">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <MessageCircle className="size-4 text-blue-400" /> Messages
          </CardTitle>
          <span className="text-[10px] uppercase tracking-wider text-emerald-400">
            End-to-end encrypted
          </span>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 p-0">
          {contacts.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 border-t border-white/4 px-4 py-8 text-center w-full">
              <div className="flex size-14 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 text-blue-300">
                <MessageCircle className="size-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">
                  Your secure inbox
                </h3>
                <p className="max-w-sm text-sm text-slate-400">
                  Crea un chat sin clave pública o cifra mensajes para ti con
                  la clave de este perfil.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCreateSelfChat}
                  className="border-slate-700"
                >
                  <UserRound className="size-4 mr-2" /> Chatear conmigo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onOpenAddContactDialog}
                  className="border-slate-700"
                >
                  <UserPlus className="size-4 mr-2" /> Agregar chat
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(15rem,22rem)_1fr] w-full">
              {/* Contacts Sidebar */}
              <aside className="border-b border-slate-800 bg-slate-950/50 p-3 md:border-b-0 md:border-r">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Chats
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    title="Add contact"
                    aria-label="Add contact"
                    onClick={onOpenAddContactDialog}
                    className="text-slate-500 hover:text-blue-400"
                  >
                    <UserPlus className="size-3.5" />
                  </Button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 md:block md:space-y-1 md:overflow-visible">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={cn(
                        "flex min-w-38 items-center justify-between gap-2 rounded-xl border p-2 transition-colors md:min-w-0",
                        selectedContactId === contact.id
                          ? "border-blue-500/60 bg-blue-950/30"
                          : "border-transparent bg-transparent hover:border-slate-800 hover:bg-slate-900",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectContact(contact.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="flex items-center gap-2">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-700 text-xs font-bold text-white">
                            {contact.name.slice(0, 2).toUpperCase()}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-slate-200">
                              {contact.name}
                            </span>
                            <span className="block truncate text-[10px] text-emerald-400">
                              {contactKind(contact) === "self"
                                ? "Contigo"
                                : contactKind(contact) === "local"
                                  ? "Sin clave"
                                  : "Secure chat"}
                            </span>
                          </span>
                        </span>
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        title={`Eliminar ${contact.name}`}
                        aria-label={`Eliminar ${contact.name}`}
                        onClick={() => onDeleteContact(contact.id)}
                        className="shrink-0 text-slate-500 hover:bg-red-950/50 hover:text-red-400"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </aside>

              {/* Chat Thread Panel */}
              <section className="flex min-h-0 min-w-0 flex-col bg-slate-950/20">
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-700 text-xs font-bold text-white">
                      {selectedContact
                        ? selectedContact.name.slice(0, 2).toUpperCase()
                        : "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {selectedContact?.name ?? "Select a chat"}
                      </p>
                      <p className="truncate text-[10px] text-emerald-400">
                        {statusLabel}
                      </p>
                    </div>
                  </div>
                  <MoreVertical className="size-4 text-slate-600" />
                </div>

                <div className="flex min-h-0 flex-1 flex-col justify-end gap-3 overflow-y-auto bg-slate-950/20 p-4 sm:p-6">
                  {!selectedContact ? (
                    <p className="mx-auto max-w-xs text-center text-xs leading-relaxed text-slate-500">
                      Select a contact from your chats.
                    </p>
                  ) : sentPlaintext || encryptedMessage ? (
                    <div className="ml-auto max-w-[92%] space-y-2 sm:max-w-[80%]">
                      <div className="rounded-xl rounded-br-md bg-blue-600 px-4 py-3 text-sm text-white shadow-md shadow-blue-950/20">
                        <p className="mb-2 text-[10px] text-blue-100">
                          {showingDecrypted
                            ? "Mensaje descifrado"
                            : selectedKind === "local"
                              ? "Nota local"
                              : selectedKind === "self"
                                ? "Cifrado para ti"
                                : "Encrypted message"}
                        </p>
                        <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed">
                          {sentPlaintext || encryptedMessage}
                        </pre>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            onCopyText(
                              encryptedMessage || sentPlaintext,
                              "contact-message",
                            )
                          }
                          className="text-[11px] text-blue-400 hover:underline"
                        >
                          {copiedId === "contact-message"
                            ? "Copiado"
                            : showingDecrypted
                              ? "Copiar mensaje"
                              : encryptedMessage
                                ? "Copiar mensaje cifrado"
                                : "Copiar nota"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mx-auto max-w-xs text-center text-xs leading-relaxed text-slate-500">
                      Your encrypted message will appear here.
                    </p>
                  )}
                </div>

                <div className="border-t border-slate-800 bg-slate-900/70 p-3">
                  <div className="flex items-end gap-2 rounded-xl border border-slate-700 bg-slate-950 p-2 focus-within:border-blue-500/70">
                    <Textarea
                      value={messageToContact}
                      onChange={(event) => onMessageChange(event.target.value)}
                      placeholder={
                        selectedContact
                          ? "Mensaje, o /descifrar y el bloque cifrado"
                          : "Select a contact first"
                      }
                      rows={
                        messageToContact.includes("BEGIN PGP MESSAGE") ? 6 : 1
                      }
                      disabled={!selectedContact}
                      className="min-h-9 resize-none border-0 bg-transparent px-2 py-1.5 text-sm text-white shadow-none focus-visible:ring-0"
                    />
                    <Button
                      type="button"
                      size="icon"
                      onClick={onEncryptMessage}
                      disabled={
                        !selectedContact ||
                        !messageToContact.trim() ||
                        isEncryptingMessage
                      }
                      title={
                        selectedKind === "local" ? "Guardar nota" : "Cifrar y enviar"
                      }
                      aria-label={
                        selectedKind === "local" ? "Guardar nota" : "Cifrar y enviar"
                      }
                      className="size-9 shrink-0 rounded-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isEncryptingMessage ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <Send className="size-4" />
                      )}
                    </Button>
                  </div>
                  {contactError && (
                    <p role="alert" className="mt-2 text-xs text-red-400">
                      {contactError}
                    </p>
                  )}
                </div>
              </section>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
