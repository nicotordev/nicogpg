import { MessageCircle, Trash2, UserPlus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { contactKind, type Contact } from "./types";

interface ContactsScreenProps {
  contacts: Contact[];
  contactsReady: boolean;
  onOpenChat: (contactId: string) => void;
  onDeleteContact: (contactId: string) => void;
  onOpenAddContactDialog: () => void;
  onCreateSelfChat: () => void;
}

export function ContactsScreen({
  contacts,
  contactsReady,
  onOpenChat,
  onDeleteContact,
  onOpenAddContactDialog,
  onCreateSelfChat,
}: ContactsScreenProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-slate-950">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/8 bg-[#080d1c] px-4">
        <h1 className="text-lg font-semibold text-white">Contacts</h1>
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
      {!contactsReady ? (
        <p className="m-auto text-sm text-slate-400">Loading contacts…</p>
      ) : contacts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="max-w-sm text-sm text-slate-400">
            No contacts in this profile yet.
          </p>
          <Button type="button" onClick={onOpenAddContactDialog} className="bg-red-600 text-white hover:bg-red-700">
            <UserPlus className="mr-2 size-4" /> Add contact
          </Button>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          {contacts.map((contact) => (
            <div key={contact.id} className="flex items-center gap-1 border-b border-white/8 pr-2 hover:bg-slate-900">
              <button
                type="button"
                onClick={() => onOpenChat(contact.id)}
                className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-semibold text-white">
                  {contact.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-white">{contact.name}</span>
                  <span className="block truncate text-xs text-slate-400">
                    {contactKind(contact) === "self"
                      ? "Note to self"
                      : contactKind(contact) === "local"
                        ? "Keyless"
                        : "Encrypted chat"}
                  </span>
                </span>
                <MessageCircle className="size-4 shrink-0 text-slate-500" />
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
          ))}
        </div>
      )}
    </div>
  );
}
