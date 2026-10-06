import type { Metadata } from "next";
import Link from "next/link";
import { AuthScreen } from "@/components/auth/auth-screen";
import { RegisterPasskey } from "@/components/auth/register-passkey";

export const metadata: Metadata = { title: "Passkeys | nicogpg" };

export default function PasskeysPage() {
  return (
    <AuthScreen title="Tus passkeys" description="Accede con tu huella, rostro, PIN o llave de seguridad.">
      <RegisterPasskey />
      <Link href="/" className="mt-8 block min-h-11 py-3 text-center text-sm underline">Volver al inicio</Link>
    </AuthScreen>
  );
}
