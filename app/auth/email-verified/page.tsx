import type { Metadata } from "next";
import Link from "next/link";
import { AuthScreen } from "@/components/auth/auth-screen";

export const metadata: Metadata = {
  title: "Email verified",
  description:
    "Your email has been verified. You can now sign in and open your OpenPGP keys in nicogpg.",
};

export default function EmailVerifiedPage() {
  return (
    <AuthScreen title="Email verified" description="Your account is now active.">
      <div className="space-y-6 text-center">
        <p className="text-sm text-muted-foreground">
          You can now sign in with your email and password.
        </p>
        <Link
          href="/auth/sign-in"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Sign in
        </Link>
      </div>
    </AuthScreen>
  );
}
