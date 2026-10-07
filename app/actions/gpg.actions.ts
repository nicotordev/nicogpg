"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth.actions";
import { revalidatePath } from "next/cache";

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

export async function createGpgKeyAction(
  formData: FormData,
): Promise<{ ok: boolean; key?: GpgKeyDto; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, error: "No autenticado" };
  }

  try {
    const handle = String(formData.get("handle") ?? "").trim();
    const keyId = String(formData.get("keyId") ?? "");
    const fingerprint = String(formData.get("fingerprint") ?? "");
    const keyType = String(formData.get("keyType") ?? "Ed25519");
    const avatarColor = String(formData.get("avatarColor") ?? "red");
    const publicKey = String(formData.get("publicKey") ?? "");
    const encryptedPrivateKeyArmored = String(formData.get("encryptedPrivateKeyArmored") ?? "");
    const salt = String(formData.get("salt") ?? "");
    const kdfParams = String(formData.get("kdfParams") ?? "{}");

    if (!handle || !keyId || !fingerprint || !publicKey || !encryptedPrivateKeyArmored || !salt) {
      return { ok: false, error: "Datos de clave incompletos" };
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

    revalidatePath("/");
    return { ok: true, key };
  } catch (error) {
    console.error("[gpg.actions] createGpgKeyAction error:", error);
    return { ok: false, error: "No se pudo guardar la clave" };
  }
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
    const message =
      error instanceof Error ? error.message : "Failed to delete GPG key.";
    return { success: false, error: message };
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
