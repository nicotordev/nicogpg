"use server";

import { cookies, headers } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Session type inferred from Better Auth server API.
 */
export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;
export type User = NonNullable<Session>["user"];

/**
 * Retrieves the authenticated session on the server.
 * Wrapped in React `cache` to deduplicate calls within the same request lifecycle.
 */
export async function getSession(): Promise<Session> {
  try {
    const cookieStore = await cookies();
    const headersList = new Headers(await headers());
    headersList.set("cookie", cookieStore.toString());
    return await auth.api.getSession({ headers: headersList });
  } catch (error) {
    console.error("[auth.actions] Error fetching session:", error);
    return null;
  }
}

/**
 * Helper to retrieve the current authenticated user on the server.
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Enforces authentication for protected server functions/actions.
 * Returns the session or throws an unauthorized error.
 */
export async function requireAuth(): Promise<NonNullable<Session>> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized: Authentication required.");
  }
  return session;
}

/**
 * Server Action export to retrieve the session.
 */
export async function getSessionAction(): Promise<Session> {
  return await getSession();
}

/**
 * Resolves an email address from either an email or a username/name.
 */
export async function resolveEmailFromIdentifier(
  identifier: string
): Promise<{ success: boolean; email?: string; error?: string }> {
  const trimmed = identifier.trim();
  if (!trimmed) {
    return { success: false, error: "Ingresa tu correo o nombre de usuario." };
  }

  // If it contains an '@', treat it directly as an email
  if (trimmed.includes("@")) {
    return { success: true, email: trimmed.toLowerCase() };
  }

  // Otherwise treat as a username and search by name (case-insensitive)
  try {
    const user = await prisma.user.findFirst({
      where: {
        name: { equals: trimmed, mode: "insensitive" },
      },
      select: { email: true },
    });

    if (!user) {
      return {
        success: false,
        error: "No encontramos ninguna cuenta con ese nombre de usuario.",
      };
    }

    return { success: true, email: user.email };
  } catch (error) {
    console.error("[auth.actions] Error resolving email from username:", error);
    return {
      success: false,
      error: "Ocurrió un error al buscar el usuario. Inténtalo de nuevo.",
    };
  }
}