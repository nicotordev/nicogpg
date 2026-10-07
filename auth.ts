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
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendVerificationEmail({
          email,
          subject: "Tu enlace de acceso a nicogpg",
          title: "Enlace de acceso directo",
          text: "Haz clic en el botón para iniciar sesión en nicogpg sin contraseña. Caduca en 5 minutos.",
          actionLabel: "Iniciar sesión",
          actionUrl: url,
        });
      },
    }),
    passkey({ rpName: "nicogpg" }),
    nextCookies(),
  ],
});
