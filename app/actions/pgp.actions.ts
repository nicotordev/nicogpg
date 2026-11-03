"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth.actions";
import { revalidatePath } from "next/cache";

function isUniqueConstraint(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

export interface PgpKeyDto {
  id: string;
  handle: string;
  keyId: string;
  fingerprint: string;
  keyType: string;
  avatarColor: string;
  publicKey?: string | null;
  encryptedPrivateKey?: string | null;
  kdfSalt?: string | null;
  kdfParams?: string | null;
  isPrimary: boolean;
  createdAt: Date | string;
}

type StoredPgpKey = {
  id: string;
  handle: string;
  keyId: string;
  fingerprint: string;
  keyType: string;
  avatarColor: string;
  publicKey: string | null;
  encryptedPrivateKey: string | null;
  kdfSalt: string | null;
  kdfParams: string | null;
  isPrimary: boolean;
  createdAt: Date;
};

function toPgpKeyDto(key: StoredPgpKey): PgpKeyDto {
  return {
    id: key.id,
    handle: key.handle,
    keyId: key.keyId,
    fingerprint: key.fingerprint,
    keyType: key.keyType,
    avatarColor: key.avatarColor,
    publicKey: key.publicKey,
    encryptedPrivateKey: key.encryptedPrivateKey,
    kdfSalt: key.kdfSalt,
    kdfParams: key.kdfParams,
    isPrimary: key.isPrimary,
    createdAt: key.createdAt.toISOString(),
  };
}

export async function createPgpKeyAction(
  formData: FormData,
): Promise<{ ok: true; key: PgpKeyDto } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const fingerprint = String(formData.get("fingerprint") ?? "");

  try {
    const handle = String(formData.get("handle") ?? "").trim();
    const keyId = String(formData.get("keyId") ?? "");
    const keyType = String(formData.get("keyType") ?? "Ed25519");
    const avatarColor = String(formData.get("avatarColor") ?? "red");
    const publicKey = String(formData.get("publicKey") ?? "");
    const encryptedPrivateKeyArmored = String(formData.get("encryptedPrivateKeyArmored") ?? "");
    const salt = String(formData.get("salt") ?? "");
    const kdfParams = String(formData.get("kdfParams") ?? "{}");

    if (!handle || !keyId || !fingerprint || !publicKey || !encryptedPrivateKeyArmored || !salt) {
      return { ok: false, error: "Incomplete key data" };
    }

    const alreadySaved = await prisma.pgpKey.findFirst({
      where: { userId: session.user.id, fingerprint },
    });
    if (alreadySaved) {
      return { ok: true, key: toPgpKeyDto(alreadySaved) };
    }

    const existingCount = await prisma.pgpKey.count({
      where: { userId: session.user.id },
    });
    const key = await prisma.pgpKey.create({
      data: {
        userId: session.user.id,
        handle: handle.trim(),
        keyId,
        fingerprint,
        keyType,
        avatarColor,
        publicKey,
        encryptedPrivateKey: encryptedPrivateKeyArmored,
        kdfSalt: salt,
        kdfParams,
        isPrimary: existingCount === 0,
      },
    });

    return { ok: true, key: toPgpKeyDto(key) };
  } catch (error) {
    console.error("[pgp.actions] createPgpKeyAction error:", error);
    if (isUniqueConstraint(error)) {
      const saved = await prisma.pgpKey.findFirst({
        where: { userId: session.user.id, fingerprint },
      });
      if (saved) return { ok: true, key: toPgpKeyDto(saved) };
    }
    return { ok: false, error: "Could not save key" };
  }
}

export async function getPgpKeyByIdAction(id: string): Promise<PgpKeyDto | null> {
  const session = await getSession();
  if (!session?.user?.id || !id) return null;

  const key = await prisma.pgpKey.findFirst({
    where: { id, userId: session.user.id },
  });
  return key ? toPgpKeyDto(key) : null;
}

/**
 * Fetch paginated OpenPGP keys with infinite scroll support.
 */
export async function getPgpKeysAction({
  cursor,
  limit = 8,
}: {
  cursor?: string;
  limit?: number;
}): Promise<{ keys: PgpKeyDto[]; nextCursor: string | null; total: number }> {
  try {
    const session = await getSession();
    let dbKeys: PgpKeyDto[] = [];

    if (session?.user?.id) {
      const dbResult = await prisma.pgpKey.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      });
      dbKeys = dbResult.map((k) => ({
        ...k,
        createdAt: k.createdAt,
      }));
    }

    const pageIndex = cursor ? parseInt(cursor, 10) : 0;
    const startIndex = pageIndex * limit;

    const sliced = dbKeys.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < dbKeys.length;
    const nextCursor = hasMore ? (pageIndex + 1).toString() : null;

    return {
      keys: sliced,
      nextCursor,
      total: dbKeys.length,
    };
  } catch (error) {
    console.error("[pgp.actions] getPgpKeysAction error:", error);
    return { keys: [], nextCursor: null, total: 0 };
  }
}

/**
 * Delete an OpenPGP key identity.
 */
export async function deletePgpKeyAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.pgpKey.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    console.error("[pgp.actions] deletePgpKeyAction error:", error);
    return { success: false, error: "Could not delete profile." };
  }
}

export async function updatePgpKeyAction(
  id: string,
  data: { handle: string; avatarColor: string },
): Promise<{ ok: boolean; key?: PgpKeyDto; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "Unauthorized" };

  const handle = data.handle.trim();
  if (!handle) return { ok: false, error: "Name cannot be empty" };

  try {
    const result = await prisma.pgpKey.updateMany({
      where: { id, userId: session.user.id },
      data: { handle, avatarColor: data.avatarColor },
    });
    if (result.count === 0) return { ok: false, error: "Profile not found" };
    const key = await prisma.pgpKey.findUniqueOrThrow({ where: { id } });
    revalidatePath("/");
    return { ok: true, key };
  } catch (error) {
    console.error("[pgp.actions] updatePgpKeyAction error:", error);
    return { ok: false, error: "Could not update profile" };
  }
}
