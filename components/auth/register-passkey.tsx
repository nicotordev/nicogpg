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
      setError("Este navegador no admite passkeys. Prueba con un navegador compatible.");
      return;
    }
    setPending(true);
    try {
      const result = await authClient.passkey.addPasskey();
      if (result.error) {
        setError("No se pudo registrar la passkey. Inténtalo de nuevo.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("No se completó el registro. Puedes volver a intentarlo.");
    } finally {
      setPending(false);
    }
  }

  if (isPending) return <p role="status">Cargando tu sesión…</p>;
  if (sessionError) return <p role="alert">No pudimos comprobar tu sesión. Recarga la página.</p>;
  if (!session) {
    return <p className="text-sm text-muted-foreground"><Link href="/auth/sign-in" className="underline">Inicia sesión con tu contraseña</Link> y vuelve a esta página para registrar tu primera passkey.</p>;
  }

  return (
    <div className="space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <p className="text-sm text-muted-foreground">Registra una passkey para {session.user.email}. Tu dispositivo te pedirá confirmar tu identidad.</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {success && <p role="status" className="text-sm">Passkey registrada. Ya puedes usarla para iniciar sesión.</p>}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:static md:mt-8 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div className="mx-auto w-full max-w-md">
          <Button onClick={register} size="lg" disabled={pending} className="min-h-12 w-full">
            {pending ? "Registrando passkey…" : "Añadir passkey"}
          </Button>
        </div>
      </div>
    </div>
  );
}
