import type { Metadata } from "next";
import Link from "next/link";
import { AuthScreen } from "@/components/auth/auth-screen";

export const metadata: Metadata = {
  title: "Email verificado | nicogpg",
};

export default function EmailVerifiedPage() {
  return (
    <AuthScreen title="Email verificado" description="Tu cuenta ya está activa.">
      <div className="space-y-6 text-center">
        <p className="text-sm text-muted-foreground">
          Ya puedes iniciar sesión con tu correo y contraseña.
        </p>
        <Link
          href="/auth/sign-in"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Iniciar sesión
        </Link>
      </div>
    </AuthScreen>
  );
}
