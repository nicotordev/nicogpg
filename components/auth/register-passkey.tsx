"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function RegisterPasskey() {
  const { data: session, isPending, error: sessionError } = authClient.useSession();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function register() {
    if (pending) return;
    setError(null);
    setSuccess(false);
    if (!window.PublicKeyCredential || !window.isSecureContext) {
      setError("This browser does not support passkeys. Please try a supported browser.");
      return;
    }
    setPending(true);
    try {
      const result = await authClient.passkey.addPasskey();
      if (result.error) {
        setError("Could not register passkey. Please try again.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Registration could not be completed. You can try again.");
    } finally {
      setPending(false);
    }
  }

  if (isPending) return <p role="status">Loading session…</p>;
  if (sessionError) return <p role="alert">Could not verify your session. Please reload the page.</p>;
  if (!session) {
    return <p className="text-sm text-muted-foreground"><Link href="/auth/sign-in" className="underline">Sign in with your password</Link> and return to this page to register your first passkey.</p>;
  }

  return (
    <div className="space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <p className="text-sm text-muted-foreground">Register a passkey for {session.user.email}. Your device will prompt you to confirm your identity.</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {success && <p role="status" className="text-sm">Passkey registered. You can now use it to sign in.</p>}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:static md:mt-8 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div className="mx-auto w-full max-w-md">
          <Button onClick={register} size="lg" disabled={pending} className="min-h-12 w-full">
            {pending ? "Registering passkey…" : "Add passkey"}
          </Button>
        </div>
      </div>
    </div>
  );
}
