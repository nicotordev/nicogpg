"use client";

import { useState, useEffect, useCallback } from "react";
import type { GpgKeyDto } from "@/app/actions/gpg.actions";
import {
  appendMessageAction,
  createContactAction,
  deleteContactAction,
  listContactsAction,
  listMessagesAction,
} from "@/app/actions/chat.actions";
import { parseArmoredGpgKey, encryptMessageForRecipient } from "@/lib/gpg-crypto";
import { decryptStorageData } from "@/lib/secure-storage";
import { contactKind, type ChatMessage, type Contact, type ContactKind } from "../types";

const CONTACT_STORAGE_KEY = "nicogpg.contacts";

function extractArmoredPgpMessage(text: string): string | null {
  return (
    text.match(
      /-----BEGIN PGP MESSAGE-----[\s\S]*?-----END PGP MESSAGE-----/,
    )?.[0] ?? null
  );
}

function isContactKind(value: string): value is ContactKind {
  return value === "keyed" || value === "local" || value === "self";
}

function readStoredContacts(payload: string): Array<{
  name: string;
  kind: ContactKind;
  fingerprint: string;
  publicKey: string;
}> {
  try {
    const parsed: unknown = JSON.parse(payload);
    if (!Array.isArray(parsed)) return [];
    const contacts: Array<{
      name: string;
      kind: ContactKind;
      fingerprint: string;
      publicKey: string;
    }> = [];
    for (const item of parsed) {
      if (typeof item !== "object" || item === null) continue;
      const record = item as Record<string, unknown>;
      if (typeof record.name !== "string" || !record.name.trim()) continue;
      const publicKey = typeof record.publicKey === "string" ? record.publicKey : "";
      const fingerprint = typeof record.fingerprint === "string" ? record.fingerprint : "";
      const kindValue = typeof record.kind === "string" ? record.kind : "";
      const kind = isContactKind(kindValue)
        ? kindValue
        : publicKey.trim()
          ? "keyed"
          : "local";
      contacts.push({
        name: record.name.trim(),
        kind,
        fingerprint,
        publicKey,
      });
    }
    return contacts;
  } catch {
    return [];
  }
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messagesByContact, setMessagesByContact] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [contactsReady, setContactsReady] = useState(false);
  const [loadingContactId, setLoadingContactId] = useState("");
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactKeyText, setContactKeyText] = useState("");
  const [contactError, setContactError] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [messageToContact, setMessageToContact] = useState("");
  const [isEncryptingMessage, setIsEncryptingMessage] = useState(false);

  const loadMessages = useCallback(async (contactId: string) => {
    setLoadingContactId(contactId);
    const result = await listMessagesAction(contactId);
    setLoadingContactId((current) => (current === contactId ? "" : current));
    if (!result.ok) {
      setContactError(result.error);
      return;
    }
    setMessagesByContact((current) => {
      const previous = current[contactId] ?? [];
      const revealed = new Map(
        previous.flatMap((message) =>
          message.revealedText ? [[message.id, message.revealedText] as const] : [],
        ),
      );
      return {
        ...current,
        [contactId]: result.messages.map((message) => {
          const revealedText = revealed.get(message.id);
          return revealedText ? { ...message, revealedText } : message;
        }),
      };
    });
    setContacts((current) =>
      current.map((contact) =>
        contact.id === contactId
          ? { ...contact, hasMessages: result.messages.length > 0 }
          : contact,
      ),
    );
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      const result = await listContactsAction();
      if (!isMounted) return;
      if (!result.ok) {
        setContactError(result.error);
        setContactsReady(true);
        return;
      }

      let next: Contact[] = result.contacts;
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem(CONTACT_STORAGE_KEY);
        if (stored) {
          const decrypted = await decryptStorageData(stored);
          const localContacts = decrypted ? readStoredContacts(decrypted) : [];
          if (localContacts.length > 0 && next.length === 0) {
            const imported: Contact[] = [];
            for (const contact of localContacts) {
              const created = await createContactAction(contact);
              if (created.ok) imported.push(created.contact);
            }
            if (imported.length > 0) next = imported;
          }
          window.localStorage.removeItem(CONTACT_STORAGE_KEY);
        }
      }

      if (!isMounted) return;
      setContacts(next);
      setContactsReady(true);
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectContact = useCallback(
    (contactId: string) => {
      setSelectedContactId(contactId);
      setMessageToContact("");
      setContactError(null);
      void loadMessages(contactId);
    },
    [loadMessages],
  );

  const rememberContact = useCallback((contact: Contact) => {
    setContacts((current) => {
      const without = current.filter((item) => item.id !== contact.id);
      return [contact, ...without];
    });
    setSelectedContactId(contact.id);
    setContactName("");
    setContactKeyText("");
    setContactError(null);
    setMessageToContact("");
    setIsContactDialogOpen(false);
    setMessagesByContact((current) =>
      current[contact.id] ? current : { ...current, [contact.id]: [] },
    );
  }, []);

  const removeContact = useCallback(
    async (contactId: string): Promise<boolean> => {
      const result = await deleteContactAction(contactId);
      if (!result.ok) {
        setContactError(result.error);
        return false;
      }
      setContacts((current) => current.filter((contact) => contact.id !== contactId));
      setMessagesByContact((current) => {
        const next = { ...current };
        delete next[contactId];
        return next;
      });
      if (selectedContactId === contactId) {
        setSelectedContactId("");
        setMessageToContact("");
      }
      return true;
    },
    [selectedContactId],
  );

  const handleCreateSelfChat = useCallback(
    async (selectedKey: GpgKeyDto | null, fallbackKey?: GpgKeyDto | null) => {
      const key = selectedKey ?? fallbackKey;
      if (!key) {
        setContactError("Select a profile identity first.");
        setIsContactDialogOpen(true);
        return;
      }

      const existing = contacts.find(
        (contact) =>
          contactKind(contact) === "self" &&
          ((key.fingerprint && contact.fingerprint === key.fingerprint) ||
            contact.name === `Me · ${key.handle}` ||
            contact.name === `Yo · ${key.handle}`),
      );
      if (existing) {
        selectContact(existing.id);
        setContactError(null);
        setIsContactDialogOpen(false);
        return;
      }

      const created = await createContactAction({
        name: `Me · ${key.handle}`,
        kind: "self",
        fingerprint: key.fingerprint || "",
        publicKey: key.publicKey || "",
      });
      if (!created.ok) {
        setContactError(created.error);
        return;
      }
      rememberContact(created.contact);
      void loadMessages(created.contact.id);
    },
    [contacts, selectContact, rememberContact, loadMessages],
  );

  const handleAddContact = useCallback(
    async (event: React.FormEvent, mode: "local" | "keyed") => {
      event.preventDefault();
      setContactError(null);

      const name = contactName.trim();
      if (!name) {
        setContactError("Enter a name.");
        return;
      }

      if (mode === "local") {
        const created = await createContactAction({ name, kind: "local" });
        if (!created.ok) {
          setContactError(created.error);
          return;
        }
        rememberContact(created.contact);
        return;
      }

      const keyText = contactKeyText.trim();
      if (!keyText) {
        setContactError("Paste the public key or create a keyless chat.");
        return;
      }
      if (keyText.includes("BEGIN PGP MESSAGE")) {
        setContactError(
          "That is an encrypted message, not a key. Use \"Keyless\" or \"Note to self\".",
        );
        return;
      }
      if (keyText.includes("BEGIN PGP PRIVATE KEY BLOCK")) {
        setContactError("That is a private key. Paste only the public key.");
        return;
      }
      if (!keyText.includes("BEGIN PGP PUBLIC KEY BLOCK")) {
        setContactError(
          "Paste a block starting with -----BEGIN PGP PUBLIC KEY BLOCK-----.",
        );
        return;
      }

      try {
        const parsed = await parseArmoredGpgKey(keyText);
        if (parsed.isPrivateKey) {
          setContactError("That is a private key. Paste only the public key.");
          return;
        }

        const created = await createContactAction({
          name,
          kind: "keyed",
          fingerprint: parsed.fingerprint,
          publicKey: parsed.publicKeyArmored,
        });
        if (!created.ok) {
          setContactError(created.error);
          return;
        }
        rememberContact(created.contact);
      } catch (error: unknown) {
        console.error("Contact key parse error:", error);
        setContactError("The public key is not valid.");
      }
    },
    [contactName, contactKeyText, rememberContact],
  );

  const handleEncryptMessage = useCallback(
    async (
      selectedKey: GpgKeyDto | null,
      onPendingDecrypt?: (armored: string) => void,
    ) => {
      const contact = contacts.find((item) => item.id === selectedContactId);
      if (!contact || !messageToContact.trim() || isEncryptingMessage) return;

      setIsEncryptingMessage(true);
      setContactError(null);
      const plaintext = messageToContact.trim();
      const thread = messagesByContact[selectedContactId] ?? [];
      const latestCiphertext = [...thread]
        .reverse()
        .find((message) => message.ciphertext.includes("BEGIN PGP MESSAGE"))
        ?.ciphertext;

      if (/^\/(?:descifrar|decrypt)\b/i.test(plaintext)) {
        const armored = extractArmoredPgpMessage(plaintext) ?? latestCiphertext ?? null;
        setMessageToContact("");
        if (!armored) {
          setContactError("Paste the encrypted message after /decrypt.");
          setIsEncryptingMessage(false);
          return;
        }
        if (!selectedKey?.encryptedPrivateKey) {
          setContactError("This profile does not have a private key.");
          setIsEncryptingMessage(false);
          return;
        }
        if (onPendingDecrypt) onPendingDecrypt(armored);
        setIsEncryptingMessage(false);
        return;
      }

      try {
        const publicKeyArmored =
          contact.publicKey ||
          (contactKind(contact) === "local" || contactKind(contact) === "self"
            ? selectedKey?.publicKey ?? ""
            : "");
        if (!publicKeyArmored) {
          setContactError("This chat does not have an encryption key.");
          return;
        }

        const encrypted = await encryptMessageForRecipient({
          publicKeyArmored,
          messageText: plaintext,
        });
        const saved = await appendMessageAction({
          contactId: contact.id,
          ciphertext: encrypted,
          ...(selectedKey?.id ? { ownerKeyId: selectedKey.id } : {}),
        });
        if (!saved.ok) {
          setContactError(saved.error);
          return;
        }

        setMessagesByContact((current) => ({
          ...current,
          [contact.id]: [...(current[contact.id] ?? []), saved.message],
        }));
        setContacts((current) =>
          current.map((item) =>
            item.id === contact.id ? { ...item, hasMessages: true } : item,
          ),
        );
        setMessageToContact("");
      } catch (error: unknown) {
        console.error("Encrypt message error:", error);
        setContactError("Could not encrypt message.");
      } finally {
        setIsEncryptingMessage(false);
      }
    },
    [contacts, selectedContactId, messageToContact, isEncryptingMessage, messagesByContact],
  );

  const revealDecryptedMessage = useCallback((armored: string, plaintext: string) => {
    const normalized = armored.trim();
    setMessagesByContact((current) => {
      let matched = false;
      const next: Record<string, ChatMessage[]> = {};
      for (const [contactId, list] of Object.entries(current)) {
        let index = -1;
        for (let cursor = list.length - 1; cursor >= 0; cursor -= 1) {
          const message = list[cursor];
          if (message && message.ciphertext.trim() === normalized) {
            index = cursor;
            break;
          }
        }
        if (index < 0) {
          next[contactId] = list;
          continue;
        }
        matched = true;
        const copy = list.slice();
        const target = copy[index];
        if (target) copy[index] = { ...target, revealedText: plaintext };
        next[contactId] = copy;
      }
      if (!matched && selectedContactId) {
        const list = next[selectedContactId] ?? [];
        next[selectedContactId] = [
          ...list,
          {
            id: `revealed-${crypto.randomUUID()}`,
            ciphertext: normalized,
            createdAt: new Date().toISOString(),
            revealedText: plaintext,
          },
        ];
      }
      return next;
    });
  }, [selectedContactId]);

  const selectedMessages = messagesByContact[selectedContactId] ?? [];

  return {
    contacts,
    contactsReady,
    messagesByContact,
    selectedMessages,
    loadingMessages: loadingContactId === selectedContactId && loadingContactId !== "",
    isContactDialogOpen,
    setIsContactDialogOpen,
    contactName,
    setContactName,
    contactKeyText,
    setContactKeyText,
    contactError,
    setContactError,
    selectedContactId,
    setSelectedContactId,
    messageToContact,
    setMessageToContact,
    isEncryptingMessage,
    selectContact,
    rememberContact,
    removeContact,
    handleCreateSelfChat,
    handleAddContact,
    handleEncryptMessage,
    revealDecryptedMessage,
  };
}
