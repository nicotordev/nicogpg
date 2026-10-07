import type { Metadata } from "next";
import Link from "next/link";
import { AuthScreen } from "@/components/auth/auth-screen";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Iniciar sesión | nicogpg",
};

export default function SignInPage() {
  return (
    <AuthScreen
      title="Iniciar sesión"
      description="Accede con código OTP, enlace de acceso, contraseña o passkey usando tu usuario o correo."
    >
      <SignInForm />
      <div className="mt-8 space-y-4 text-center text-sm text-muted-foreground">
        <Link href="/auth/passkeys" className="block min-h-11 py-3 underline-offset-4 hover:underline">
          Registrar una passkey
        </Link>
        <p>
          ¿No tienes una cuenta?{" "}
          <Link href="/auth/sign-up" className="underline underline-offset-4 hover:no-underline">
            Regístrate
          </Link>
        </p>
      </div>
    </AuthScreen>
  );
}
