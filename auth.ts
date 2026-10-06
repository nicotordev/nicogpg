import { betterAuth } from "better-auth/minimal";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { passkey } from "@better-auth/passkey";
import { emailOTP } from "better-auth/plugins";
import { sendVerificationEmail } from "@/lib/email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({
        email: user.email,
        subject: "Verifica tu email en nicogpg",
        title: "Verifica tu email",
        text: "Confirma tu dirección de email para activar tu cuenta en nicogpg.",
        actionLabel: "Verificar email",
        actionUrl: url,
      });
    },
  },
  plugins: [
    emailOTP({
      sendVerificationOTP: async ({ email, otp, type }) => {
        const subject = type === "sign-in"
          ? "Tu código de acceso de nicogpg"
          : "Tu código de verificación de nicogpg";
        await sendVerificationEmail({
          email,
          subject,
          title: "Código de un solo uso",
          text: "Usa este código para completar tu verificación. Caduca en 5 minutos.",
          otp,
        });
      },
    }),
    passkey({ rpName: "nicogpg" }),
    nextCookies(),
  ],
});
