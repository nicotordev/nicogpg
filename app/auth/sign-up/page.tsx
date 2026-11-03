import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/auth-screen";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create a NicoPGP account to store encrypted OpenPGP key profiles and use them from your browser.",
};

export default function SignUpPage() {
  return (
    <AuthScreen title="Create account" description="Complete the steps to create your account and use passkeys.">
      <SignUpForm />
      <p className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 px-5 text-center text-sm text-muted-foreground md:static md:mt-8 md:px-0">
        Already have an account?{" "}
        <a href="/auth/sign-in" className="underline underline-offset-4">Sign in</a>
      </p>
    </AuthScreen>
  );
}
