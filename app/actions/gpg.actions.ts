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

export interface GpgKeyDto {
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

type StoredGpgKey = {
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

function toGpgKeyDto(key: StoredGpgKey): GpgKeyDto {
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

export async function createGpgKeyAction(
  formData: FormData,
): Promise<{ ok: true; key: GpgKeyDto } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, error: "No autenticado" };
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
      return { ok: false, error: "Datos de clave incompletos" };
    }

    const alreadySaved = await prisma.gpgKey.findFirst({
      where: { userId: session.user.id, fingerprint },
    });
    if (alreadySaved) {
      return { ok: true, key: toGpgKeyDto(alreadySaved) };
    }

    const existingCount = await prisma.gpgKey.count({
      where: { userId: session.user.id },
    });
    const key = await prisma.gpgKey.create({
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

    return { ok: true, key: toGpgKeyDto(key) };
  } catch (error) {
    console.error("[gpg.actions] createGpgKeyAction error:", error);
    if (isUniqueConstraint(error)) {
      const saved = await prisma.gpgKey.findFirst({
        where: { userId: session.user.id, fingerprint },
      });
      if (saved) return { ok: true, key: toGpgKeyDto(saved) };
    }
    return { ok: false, error: "No se pudo guardar la clave" };
  }
}

export async function getGpgKeyByIdAction(id: string): Promise<GpgKeyDto | null> {
  const session = await getSession();
  if (!session?.user?.id || !id) return null;

  const key = await prisma.gpgKey.findFirst({
    where: { id, userId: session.user.id },
  });
  return key ? toGpgKeyDto(key) : null;
}

/**
 * Fetch paginated GPG keys with infinite scroll support.
 */
export async function getGpgKeysAction({
  cursor,
  limit = 8,
}: {
  cursor?: string;
  limit?: number;
}): Promise<{ keys: GpgKeyDto[]; nextCursor: string | null; total: number }> {
  try {
    const session = await getSession();
    let dbKeys: GpgKeyDto[] = [];

    if (session?.user?.id) {
      const dbResult = await prisma.gpgKey.findMany({
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
    console.error("[gpg.actions] getGpgKeysAction error:", error);
    return { keys: [], nextCursor: null, total: 0 };
  }
}

/**
 * Delete a GPG Key identity.
 */
export async function deleteGpgKeyAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.gpgKey.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    console.error("[gpg.actions] deleteGpgKeyAction error:", error);
    return { success: false, error: "No se pudo eliminar el perfil." };
  }
}

export async function updateGpgKeyAction(
  id: string,
  data: { handle: string; avatarColor: string },
): Promise<{ ok: boolean; key?: GpgKeyDto; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "No autenticado" };

  const handle = data.handle.trim();
  if (!handle) return { ok: false, error: "El nombre no puede estar vacío" };

  try {
    const result = await prisma.gpgKey.updateMany({
      where: { id, userId: session.user.id },
      data: { handle, avatarColor: data.avatarColor },
    });
    if (result.count === 0) return { ok: false, error: "Perfil no encontrado" };
    const key = await prisma.gpgKey.findUniqueOrThrow({ where: { id } });
    revalidatePath("/");
    return { ok: true, key };
  } catch (error) {
    console.error("[gpg.actions] updateGpgKeyAction error:", error);
    return { ok: false, error: "No se pudo actualizar el perfil" };
  }
}
