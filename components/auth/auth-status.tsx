"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AuthStatus() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        Cargando sesión…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link href="/auth/sign-in" className={cn(buttonVariants({ size: "lg" }), "min-h-12 flex-1")}>
          Iniciar sesión
        </Link>
        <Link href="/auth/sign-up" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "min-h-12 flex-1")}>
          Crear cuenta
        </Link>
      </div>
    );
  }

  async function signOut() {
    await authClient.signOut();
    window.location.reload();
  }

  return (
    <div className="w-full space-y-4">
      <div className="rounded-3xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Sesión iniciada como</p>
        <p className="mt-1 truncate font-medium">{session.user.name}</p>
        <p className="truncate text-sm text-muted-foreground">{session.user.email}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/auth/passkeys" className={cn(buttonVariants({ size: "lg" }), "min-h-12 flex-1")}>
          Administrar passkeys
        </Link>
        <Button type="button" size="lg" variant="outline" className="min-h-12 flex-1" onClick={signOut}>
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
