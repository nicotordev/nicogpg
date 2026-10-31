import type { Metadata } from "next";
import { SignInView } from "@/components/auth/sign-in-view";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Enter your OpenPGP vault with email and password, OTP code, magic access link, or passkey.",
};

export default function SignInPage() {
  return <SignInView />;
}
