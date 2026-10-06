import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/auth-screen";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Crear cuenta | nicogpg",
};

export default function SignUpPage() {
  return (
    <AuthScreen title="Crear cuenta" description="Completa los pasos para crear tu cuenta y usar passkeys.">
      <SignUpForm />
      <p className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 px-5 text-center text-sm text-muted-foreground md:static md:mt-8 md:px-0">
        ¿Ya tienes una cuenta?{" "}
        <a href="/auth/sign-in" className="underline underline-offset-4">Inicia sesión</a>
      </p>
    </AuthScreen>
  );
}
