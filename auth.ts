import { betterAuth } from "better-auth/minimal";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { passkey } from "@better-auth/passkey";
import { emailOTP, magicLink } from "better-auth/plugins";
import { sendVerificationEmail } from "@/lib/email";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
  ],
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  advanced: {
    ipAddress: {
      disableIpTracking: true,
    },
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  emailVerification: {
    sendOnSignUp: true,
    expiresIn: 60 * 60 * 24,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({
        email: user.email,
        subject: "Verify your email on nicogpg",
        title: "Verify your email",
        text: "Confirm your email address to activate your account on nicogpg.",
        actionLabel: "Verify email",
        actionUrl: url,
      });
    },
  },
  plugins: [
    emailOTP({
      sendVerificationOTP: async ({ email, otp, type }) => {
        const subject = type === "sign-in"
          ? "Your nicogpg login code"
          : "Your nicogpg verification code";
        await sendVerificationEmail({
          email,
          subject,
          title: "One-time passcode",
          text: "Use this code to complete verification. It expires in 5 minutes.",
          otp,
        });
      },
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendVerificationEmail({
          email,
          subject: "Your nicogpg login link",
          title: "Magic login link",
          text: "Click the button to sign in to nicogpg password-free. It expires in 5 minutes.",
          actionLabel: "Sign in",
          actionUrl: url,
        });
      },
    }),
    passkey({ rpName: "nicogpg" }),
    nextCookies(),
  ],
});
