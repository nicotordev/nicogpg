import type { Metadata } from "next";
import { AuthStatus } from "@/components/auth/auth-status";

export const metadata: Metadata = {
  title: "nicogpg",
  description: "Autenticación segura con contraseña y passkeys.",
};

export default function Home() {
  return (
    <main lang="es" className="flex min-h-[100svh] flex-1 items-center justify-center bg-background px-4 py-6 sm:px-6 sm:py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
            N
          </div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Bienvenido a nicogpg</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Accede de forma segura con tu contraseña o con una passkey de tu dispositivo Android.
          </p>
        </div>
        <AuthStatus />
        <p className="text-center text-xs text-muted-foreground">
          Diseñado para una experiencia rápida y cómoda en móvil.
        </p>
      </div>
    </main>
  );
}
