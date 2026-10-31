"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { AuthScreen } from "@/components/auth/auth-screen";
import { Button } from "@/components/ui/button";

type VerifyEmailProps = {
  email: string;
};

export function VerifyEmail({ email }: VerifyEmailProps) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function resendEmail() {
    if (!email || pending) return;
    setPending(true);
    setMessage(null);
    setError(null);

    try {
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/auth/email-verified",
      });

      if (result.error) {
        setError("Could not resend the email. Please wait a moment and try again.");
        return;
      }

      setMessage("A new verification link has been sent to your email.");
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthScreen title="Check your email" description="We need to confirm your email address before granting access.">
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          We sent a verification link to{" "}
          <strong className="break-all text-foreground">{email || "your email"}</strong>.
        </p>
        {message && <p role="status" className="text-sm text-primary">{message}</p>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="button" size="lg" className="min-h-12 w-full" onClick={resendEmail} disabled={!email || pending}>
          {pending ? "Resending…" : "Resend verification email"}
        </Button>
        <Link href="/auth/sign-in" className="block text-center text-sm underline underline-offset-4">
          Back to sign in
        </Link>
      </div>
    </AuthScreen>
  );
}
