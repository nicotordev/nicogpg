import type { Metadata } from "next";
import Link from "next/link";
import { AuthScreen } from "@/components/auth/auth-screen";
import { RegisterPasskey } from "@/components/auth/register-passkey";

export const metadata: Metadata = {
  title: "Passkeys",
  description:
    "Register a passkey to access nicogpg with fingerprint, face, PIN, or security key.",
};

export default function PasskeysPage() {
  return (
    <AuthScreen title="Your passkeys" description="Sign in with your fingerprint, face, PIN, or security key.">
      <RegisterPasskey />
      <Link href="/" className="mt-8 block min-h-11 py-3 text-center text-sm underline">Return home</Link>
    </AuthScreen>
  );
}
