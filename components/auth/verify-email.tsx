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
        setError("No pudimos reenviar el email. Espera un momento e inténtalo de nuevo.");
        return;
      }

      setMessage("Te enviamos un nuevo enlace de verificación.");
    } catch {
      setError("No pudimos conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthScreen title="Revisa tu email" description="Necesitamos confirmar tu dirección antes de permitir el acceso.">
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Enviamos un enlace de verificación a{" "}
          <strong className="break-all text-foreground">{email || "tu email"}</strong>.
        </p>
        {message && <p role="status" className="text-sm text-primary">{message}</p>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="button" size="lg" className="min-h-12 w-full" onClick={resendEmail} disabled={!email || pending}>
          {pending ? "Reenviando…" : "Reenviar email de verificación"}
        </Button>
        <Link href="/auth/sign-in" className="block text-center text-sm underline underline-offset-4">
          Volver a iniciar sesión
        </Link>
      </div>
    </AuthScreen>
  );
}
