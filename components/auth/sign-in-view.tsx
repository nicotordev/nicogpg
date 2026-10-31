"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthScreen } from "@/components/auth/auth-screen";
import { SignInForm } from "@/components/auth/sign-in-form";

export function SignInView() {
  const [otpVerify, setOtpVerify] = useState(false);

  return (
    <AuthScreen
      title="Sign in"
      description={
        otpVerify
          ? ""
          : "Sign in with OTP code, magic login link, password, or passkey using your username or email."
      }
    >
      <SignInForm onOtpVerifyChange={setOtpVerify} />
      {otpVerify ? null : (
        <div className="mt-8 space-y-4 text-center text-sm text-muted-foreground">
          <Link href="/auth/passkeys" className="block min-h-11 py-3 underline-offset-4 hover:underline">
            Register a passkey
          </Link>
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="underline underline-offset-4 hover:no-underline">
              Sign up
            </Link>
          </p>
        </div>
      )}
    </AuthScreen>
  );
}
