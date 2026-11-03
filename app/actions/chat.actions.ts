"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "./auth.actions";

const contactKindSchema = z.enum(["keyed", "local", "self"]);

const createContactSchema = z.object({
  name: z.string().trim().min(1).max(80),
  kind: contactKindSchema,
  fingerprint: z.string().trim().max(128).default(""),
  publicKey: z.string().max(100_000).default(""),
});

const ciphertextSchema = z
  .string()
  .trim()
  .min(1)
  .max(500_000)
  .refine(
    (value) =>
      value.includes("-----BEGIN PGP MESSAGE-----") &&
      value.includes("-----END PGP MESSAGE-----"),
    { message: "ciphertext" },
  );

const appendMessageSchema = z.object({
  contactId: z.string().min(1).max(64),
  ciphertext: ciphertextSchema,
  ownerKeyId: z.string().min(1).max(64).optional(),
});

export interface ContactRecord {
  id: string;
  name: string;
  kind: "keyed" | "local" | "self";
  fingerprint: string;
  publicKey: string;
  hasMessages: boolean;
}

export interface MessageRecord {
  id: string;
  ciphertext: string;
  createdAt: string;
  favorite: boolean;
}

type ActionFailure = { ok: false; error: string };

function failure(error: string): ActionFailure {
  return { ok: false, error };
}

async function requireUserId(): Promise<string | ActionFailure> {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) return failure("Unauthorized");
  return userId;
}

function toContactRecord(contact: {
  id: string;
  name: string;
  kind: string;
  fingerprint: string;
  publicKey: string | null;
  conversation: { messages: { id: string }[] } | null;
}): ContactRecord | null {
  const kind = contactKindSchema.safeParse(contact.kind);
  if (!kind.success) return null;
  return {
    id: contact.id,
    name: contact.name,
    kind: kind.data,
    fingerprint: contact.fingerprint,
    publicKey: contact.publicKey ?? "",
    hasMessages: (contact.conversation?.messages.length ?? 0) > 0,
  };
}

export async function listContactsAction(): Promise<
  { ok: true; contacts: ContactRecord[] } | ActionFailure
> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  try {
    const rows = await prisma.contact.findMany({
      where: { userId },
      include: {
        conversation: {
          select: {
            updatedAt: true,
            messages: {
              select: { id: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    const contacts = rows
      .map((row) => ({
        record: toContactRecord(row),
        updatedAt: row.conversation?.updatedAt ?? row.createdAt,
      }))
      .filter((row): row is { record: ContactRecord; updatedAt: Date } => row.record !== null)
      .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime())
      .map((row) => row.record);

    return { ok: true, contacts };
  } catch (error: unknown) {
    console.error("[chat.actions] listContactsAction error:", error);
    return failure("Could not load chats.");
  }
}

export async function createContactAction(input: {
  name: string;
  kind: "keyed" | "local" | "self";
  fingerprint?: string;
  publicKey?: string;
}): Promise<{ ok: true; contact: ContactRecord } | ActionFailure> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  const parsed = createContactSchema.safeParse(input);
  if (!parsed.success) return failure("Invalid contact.");

  const { name, kind, fingerprint, publicKey } = parsed.data;
  if (kind === "keyed" && !publicKey.includes("BEGIN PGP PUBLIC KEY BLOCK")) {
    return failure("Paste an OpenPGP public key.");
  }
  if (kind === "self" && !fingerprint) {
    return failure("This profile has no fingerprint for note to self.");
  }

  try {
    if (kind === "self") {
      const existing = await prisma.contact.findFirst({
        where: { userId, kind: "self", fingerprint },
        include: {
          conversation: {
            select: { messages: { select: { id: true }, take: 1 } },
          },
        },
      });
      const existingRecord = existing ? toContactRecord(existing) : null;
      if (existingRecord) return { ok: true, contact: existingRecord };
    }

    const created = await prisma.contact.create({
      data: {
        userId,
        name,
        kind,
        fingerprint,
        publicKey: publicKey || null,
        conversation: { create: { userId } },
      },
      include: {
        conversation: {
          select: { messages: { select: { id: true }, take: 1 } },
        },
      },
    });

    const record = toContactRecord(created);
    if (!record) return failure("Could not save contact.");
    return { ok: true, contact: record };
  } catch (error: unknown) {
    console.error("[chat.actions] createContactAction error:", error);
    return failure("Could not save contact.");
  }
}

export async function deleteContactAction(
  contactId: string,
): Promise<{ ok: true } | ActionFailure> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;
  if (!contactId) return failure("Could not delete contact.");

  try {
    const deleted = await prisma.contact.deleteMany({
      where: { id: contactId, userId },
    });
    if (deleted.count === 0) return failure("Could not delete contact.");
    return { ok: true };
  } catch (error: unknown) {
    console.error("[chat.actions] deleteContactAction error:", error);
    return failure("Could not delete contact.");
  }
}

export async function listMessagesAction(
  contactId: string,
): Promise<{ ok: true; messages: MessageRecord[] } | ActionFailure> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  try {
    const conversation = await prisma.conversation.findFirst({
      where: { contactId, userId },
      select: { id: true },
    });
    if (!conversation) return { ok: true, messages: [] };

    const rows = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, ciphertext: true, createdAt: true, favorite: true },
    });

    return {
      ok: true,
      messages: rows.reverse().map((row) => ({
        id: row.id,
        ciphertext: row.ciphertext,
        createdAt: row.createdAt.toISOString(),
        favorite: row.favorite,
      })),
    };
  } catch (error: unknown) {
    console.error("[chat.actions] listMessagesAction error:", error);
    return failure("Could not load messages.");
  }
}

export async function appendMessageAction(input: {
  contactId: string;
  ciphertext: string;
  ownerKeyId?: string;
}): Promise<{ ok: true; message: MessageRecord } | ActionFailure> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  const parsed = appendMessageSchema.safeParse(input);
  if (!parsed.success) {
    return failure("Only OpenPGP encrypted messages can be saved.");
  }

  try {
    const conversation = await prisma.conversation.findFirst({
      where: { contactId: parsed.data.contactId, userId },
      select: { id: true },
    });
    if (!conversation) return failure("That chat does not exist.");

    if (parsed.data.ownerKeyId) {
      const owner = await prisma.pgpKey.findFirst({
        where: { id: parsed.data.ownerKeyId, userId },
        select: { id: true },
      });
      if (!owner) return failure("The profile sending the message does not exist.");
    }

    const created = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        ciphertext: parsed.data.ciphertext,
        ...(parsed.data.ownerKeyId ? { ownerKeyId: parsed.data.ownerKeyId } : {}),
      },
      select: { id: true, ciphertext: true, createdAt: true, favorite: true },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return {
      ok: true,
      message: {
        id: created.id,
        ciphertext: created.ciphertext,
        createdAt: created.createdAt.toISOString(),
        favorite: created.favorite,
      },
    };
  } catch (error: unknown) {
    console.error("[chat.actions] appendMessageAction error:", error);
    return failure("Could not save message.");
  }
}

async function ownedMessage(userId: string, messageId: string) {
  return prisma.message.findFirst({
    where: { id: messageId, conversation: { userId } },
    select: { id: true, conversationId: true },
  });
}

export async function deleteMessageAction(
  messageId: string,
): Promise<{ ok: true } | ActionFailure> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;
  if (!messageId) return failure("Could not delete the message.");

  try {
    const message = await ownedMessage(userId, messageId);
    if (!message) return failure("Could not delete the message.");
    await prisma.message.delete({ where: { id: message.id } });
    await prisma.conversation.update({
      where: { id: message.conversationId },
      data: { updatedAt: new Date() },
    });
    return { ok: true };
  } catch (error: unknown) {
    console.error("[chat.actions] deleteMessageAction error:", error);
    return failure("Could not delete the message.");
  }
}

export async function clearConversationAction(
  contactId: string,
): Promise<{ ok: true } | ActionFailure> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  try {
    const conversation = await prisma.conversation.findFirst({
      where: { contactId, userId },
      select: { id: true },
    });
    if (!conversation) return failure("That chat does not exist.");
    await prisma.message.deleteMany({ where: { conversationId: conversation.id } });
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });
    return { ok: true };
  } catch (error: unknown) {
    console.error("[chat.actions] clearConversationAction error:", error);
    return failure("Could not clear the chat.");
  }
}

export async function setMessageFavoriteAction(input: {
  messageId: string;
  favorite: boolean;
}): Promise<{ ok: true } | ActionFailure> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  const parsed = z
    .object({
      messageId: z.string().min(1).max(64),
      favorite: z.boolean(),
    })
    .safeParse(input);
  if (!parsed.success) return failure("Could not update the favorite.");

  try {
    const message = await ownedMessage(userId, parsed.data.messageId);
    if (!message) return failure("Could not update the favorite.");
    await prisma.message.update({
      where: { id: message.id },
      data: { favorite: parsed.data.favorite },
    });
    return { ok: true };
  } catch (error: unknown) {
    console.error("[chat.actions] setMessageFavoriteAction error:", error);
    return failure("Could not update the favorite.");
  }
}
