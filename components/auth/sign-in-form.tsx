"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, LoaderCircle, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const signInSchema = z.object({
  email: z.string().trim().pipe(z.email("Ingresa un correo electrónico válido.")),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

type SignInValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const router = useRouter();
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });
  const [passkeyPending, setPasskeyPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { isSubmitting, errors } = form.formState;
  const pending = isSubmitting || passkeyPending;

  async function signInWithPasskey() {
    if (pending) return;
    form.clearErrors("root");
    if (!window.PublicKeyCredential || !window.isSecureContext) {
      form.setError("root", { message: "Este navegador no admite passkeys. Usa tu correo y contraseña." });
      return;
    }
    setPasskeyPending(true);
    try {
      const result = await authClient.signIn.passkey();
      if (result.error) {
        form.setError("root", { message: "No se pudo iniciar sesión con tu passkey. Inténtalo de nuevo o usa tu contraseña." });
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      form.setError("root", { message: "No se completó el acceso con passkey. Puedes volver a intentarlo." });
    } finally {
      setPasskeyPending(false);
    }
  }

  async function onSubmit(values: SignInValues) {
    if (pending) return;
    form.clearErrors("root");

    try {
      const result = await authClient.signIn.email(values);

      if (result.error) {
        form.setError("root", { message: result.error.status === 429
          ? "Demasiados intentos. Espera un momento y vuelve a intentarlo."
          : "No pudimos iniciar sesión. Revisa tu correo y contraseña e inténtalo de nuevo." });
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      form.setError("root", { message: "No pudimos conectar con el servidor. Inténtalo de nuevo." });

    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-5 pb-[calc(8rem+env(safe-area-inset-bottom))] md:pb-0"
      aria-busy={pending}
    >
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="relative">
              <Mail aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                {...field}
                id="email"
                type="email"
                autoComplete="email"
                required
                disabled={pending}
                className="pl-10"
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.error ? "email-error" : undefined}
              />
            </div>
            {fieldState.error && (
              <p id="email-error" role="alert" className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />
      <Controller
        name="password"
        control={form.control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <KeyRound aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                {...field}
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                disabled={pending}
                className="pl-10 pr-10"
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.error ? "password-error" : undefined}
              />
              <button
                type="button"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showPassword}
                disabled={pending}
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {showPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
              </button>
            </div>
            {fieldState.error && (
              <p id="password-error" role="alert" className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />
      {errors.root && <p role="alert" className="text-sm text-destructive">{errors.root.message}</p>}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:static md:mt-8 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div className="mx-auto flex w-full max-w-md flex-col gap-2">
          <Button type="submit" size="lg" className="min-h-12 w-full" disabled={pending}>
            {pending && <LoaderCircle aria-hidden="true" className="animate-spin" />}
            {pending ? "Iniciando sesión…" : "Iniciar sesión"}
          </Button>
          <Button type="button" size="lg" variant="outline" className="min-h-12 w-full" disabled={pending} onClick={signInWithPasskey}>
            {passkeyPending && <LoaderCircle aria-hidden="true" className="animate-spin" />}
            {passkeyPending ? "Esperando tu passkey…" : "Iniciar sesión con passkey"}
          </Button>
        </div>
      </div>
    </form>
  );
}
