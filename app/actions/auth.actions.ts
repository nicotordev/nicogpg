"use server";

import { cookies, headers } from "next/headers";
import { auth } from "@/auth";

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