"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AuthStatus() {
  const { data: session, isPending } = authClient.useSession();
  const [resending, setResending] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        Loading session…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link href="/auth/sign-in" className={cn(buttonVariants({ size: "lg" }), "min-h-12 flex-1")}>
          Sign in
        </Link>
        <Link href="/auth/sign-up" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "min-h-12 flex-1")}>
          Create account
        </Link>
      </div>
    );
  }

  async function signOut() {
    await authClient.signOut();
    window.location.reload();
  }

  async function resendVerificationEmail() {
    if (!session || resending) return;
    setResending(true);
    setVerificationMessage(null);
    setVerificationError(null);

    try {
      const result = await authClient.sendVerificationEmail({
        email: session.user.email,
        callbackURL: "/auth/email-verified",
      });

      if (result.error) {
        setVerificationError("Could not resend the email. Please wait a moment and try again.");
        return;
      }

      setVerificationMessage("A new verification link has been sent to your email.");
    } catch {
      setVerificationError("Could not connect to the server. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="w-full space-y-4">
      {!session.user.emailVerified && (
        <div className="space-y-4 rounded-3xl border border-primary/30 bg-primary/5 p-5">
          <div>
            <p className="font-medium">Verify your email</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Check your inbox to confirm {session.user.email}. You can continue using the app in the meantime.
            </p>
          </div>
          {verificationMessage && <p role="status" className="text-sm text-primary">{verificationMessage}</p>}
          {verificationError && <p role="alert" className="text-sm text-destructive">{verificationError}</p>}
          <Button type="button" variant="outline" onClick={resendVerificationEmail} disabled={resending}>
            {resending ? "Resending…" : "Resend verification email"}
          </Button>
        </div>
      )}
      <div className="rounded-3xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Account Session</p>
        <p className="mt-1 truncate font-medium">Session Active (ID: {session.user.id.slice(0, 8)})</p>
        <p className="truncate text-xs text-muted-foreground font-mono">Protected Auth Token</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/auth/passkeys" className={cn(buttonVariants({ size: "lg" }), "min-h-12 flex-1")}>
          Manage Passkeys
        </Link>
        <Button type="button" size="lg" variant="outline" className="min-h-12 flex-1" onClick={signOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}
