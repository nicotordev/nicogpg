"use client";

import { useState, useEffect, useCallback } from "react";
import type { GpgKeyDto } from "@/app/actions/gpg.actions";
import { parseArmoredGpgKey, encryptMessageForRecipient } from "@/lib/gpg-crypto";
import { encryptStorageData, decryptStorageData } from "@/lib/secure-storage";
import type { Contact } from "../types";
import { contactKind } from "../types";

function extractArmoredPgpMessage(text: string): string | null {
  return (
    text.match(
      /-----BEGIN PGP MESSAGE-----[\s\S]*?-----END PGP MESSAGE-----/,
    )?.[0] ?? null
  );
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactKeyText, setContactKeyText] = useState("");
  const [contactError, setContactError] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [messageToContact, setMessageToContact] = useState("");
  const [encryptedMessage, setEncryptedMessage] = useState("");
  const [sentPlaintext, setSentPlaintext] = useState("");
  const [showingDecrypted, setShowingDecrypted] = useState(false);
  const [isEncryptingMessage, setIsEncryptingMessage] = useState(false);

  // Load encrypted contacts from localStorage on mount
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

  const rememberContact = useCallback((contact: Contact) => {
    setContacts((current) => [contact, ...current]);
    setSelectedContactId(contact.id);
    setContactName("");
    setContactKeyText("");
    setContactError(null);
    setMessageToContact("");
    setEncryptedMessage("");
    setSentPlaintext("");
    setShowingDecrypted(false);
    setIsContactDialogOpen(false);
  }, []);

  const selectContact = useCallback((contactId: string) => {
    setSelectedContactId(contactId);
    setMessageToContact("");
    setEncryptedMessage("");
    setSentPlaintext("");
    setShowingDecrypted(false);
    setContactError(null);
  }, []);

  const removeContact = useCallback(
    (contactId: string) => {
      setContacts((current) => current.filter((c) => c.id !== contactId));
      if (selectedContactId === contactId) {
        setSelectedContactId("");
        setMessageToContact("");
        setEncryptedMessage("");
        setSentPlaintext("");
        setShowingDecrypted(false);
      }
    },
    [selectedContactId],
  );

  const handleCreateSelfChat = useCallback(
    (selectedKey: GpgKeyDto | null, fallbackKey?: GpgKeyDto | null) => {
      const key = selectedKey ?? fallbackKey;
      if (!key) {
        setContactError("Selecciona una identidad de perfil primero.");
        setIsContactDialogOpen(true);
        return;
      }

      const existing = contacts.find(
        (contact) =>
          contactKind(contact) === "self" &&
          ((key.fingerprint && contact.fingerprint === key.fingerprint) ||
            contact.name === `Yo · ${key.handle}`),
      );
      if (existing) {
        selectContact(existing.id);
        setContactError(null);
        setIsContactDialogOpen(false);
        return;
      }

      rememberContact({
        id: crypto.randomUUID(),
        name: `Yo · ${key.handle}`,
        kind: "self",
        fingerprint: key.fingerprint || "",
        publicKey: key.publicKey || "",
      });
    },
    [contacts, selectContact, rememberContact],
  );

  const handleAddContact = useCallback(
    async (event: React.FormEvent, mode: "local" | "keyed") => {
      event.preventDefault();
      setContactError(null);

      const name = contactName.trim();
      if (!name) {
        setContactError("Ingresa un nombre.");
        return;
      }

      if (mode === "local") {
        rememberContact({
          id: crypto.randomUUID(),
          name,
          kind: "local",
          fingerprint: "",
          publicKey: "",
        });
        return;
      }

      const keyText = contactKeyText.trim();
      if (!keyText) {
        setContactError("Pega la clave pública o crea el chat sin clave.");
        return;
      }
      if (keyText.includes("BEGIN PGP MESSAGE")) {
        setContactError(
          "Eso es un mensaje cifrado, no una clave. Usa “Sin clave” o “Chatear conmigo”.",
        );
        return;
      }
      if (keyText.includes("BEGIN PGP PRIVATE KEY BLOCK")) {
        setContactError("Esa es una clave privada. Pega solo la clave pública.");
        return;
      }
      if (!keyText.includes("BEGIN PGP PUBLIC KEY BLOCK")) {
        setContactError(
          "Pega un bloque que empiece con -----BEGIN PGP PUBLIC KEY BLOCK-----.",
        );
        return;
      }

      try {
        const parsed = await parseArmoredGpgKey(keyText);
        if (parsed.isPrivateKey) {
          setContactError("Esa es una clave privada. Pega solo la clave pública.");
          return;
        }

        rememberContact({
          id: crypto.randomUUID(),
          name,
          kind: "keyed",
          fingerprint: parsed.fingerprint,
          publicKey: parsed.publicKeyArmored,
        });
      } catch (error: unknown) {
        console.error("Contact key parse error:", error);
        setContactError("La clave pública no es válida.");
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

      if (/^\/descifrar\b/i.test(plaintext)) {
        const armored =
          extractArmoredPgpMessage(plaintext) ??
          (encryptedMessage.includes("BEGIN PGP MESSAGE")
            ? encryptedMessage
            : null);
        setMessageToContact("");
        if (!armored) {
          setContactError("Pega el mensaje cifrado después de /descifrar.");
          setIsEncryptingMessage(false);
          return;
        }
        if (!selectedKey?.encryptedPrivateKey) {
          setContactError("Este perfil no tiene una clave privada.");
          setIsEncryptingMessage(false);
          return;
        }
        if (onPendingDecrypt) {
          onPendingDecrypt(armored);
        }
        setIsEncryptingMessage(false);
        return;
      }

      setEncryptedMessage("");
      setSentPlaintext("");
      setShowingDecrypted(false);

      try {
        if (contactKind(contact) === "local") {
          setSentPlaintext(plaintext);
          setMessageToContact("");
          return;
        }

        const publicKeyArmored =
          contact.publicKey ||
          (contactKind(contact) === "self" ? selectedKey?.publicKey ?? "" : "");
        if (!publicKeyArmored) {
          setContactError("Este chat no tiene una clave para cifrar.");
          return;
        }

        const encrypted = await encryptMessageForRecipient({
          publicKeyArmored,
          messageText: plaintext,
        });
        setEncryptedMessage(encrypted);
        setMessageToContact("");
      } catch (error: unknown) {
        console.error("Encrypt message error:", error);
        setContactError("No se pudo cifrar el mensaje.");
      } finally {
        setIsEncryptingMessage(false);
      }
    },
    [
      contacts,
      selectedContactId,
      messageToContact,
      isEncryptingMessage,
      encryptedMessage,
    ],
  );

  return {
    contacts,
    setContacts,
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
    encryptedMessage,
    setEncryptedMessage,
    sentPlaintext,
    setSentPlaintext,
    showingDecrypted,
    setShowingDecrypted,
    isEncryptingMessage,
    selectContact,
    rememberContact,
    removeContact,
    handleCreateSelfChat,
    handleAddContact,
    handleEncryptMessage,
  };
}
