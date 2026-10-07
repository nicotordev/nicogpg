"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  Mail,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { resolveEmailFromIdentifier } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";

type AuthMethod = "otp" | "magic-link" | "password";

export function SignInForm() {
  const router = useRouter();

  // Authentication method tab
  const [method, setMethod] = useState<AuthMethod>("otp");

  // Form input state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP flow state
  const [otpStep, setOtpStep] = useState<"request" | "verify">("request");
  const [otpCode, setOtpCode] = useState("");
  const [resolvedEmail, setResolvedEmail] = useState<string | null>(null);

  // Magic link state
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Timer & general status
  const [countdown, setCountdown] = useState(0);
  const [pending, setPending] = useState(false);
  const [passkeyPending, setPasskeyPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = window.setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [countdown]);

  // Handle Passkey Login
  async function signInWithPasskey() {
    if (pending || passkeyPending) return;
    setError(null);
    setInfoMessage(null);

    if (!window.PublicKeyCredential || !window.isSecureContext) {
      setError("Este navegador no admite passkeys. Usa un código OTP, link de acceso o tu contraseña.");
      return;
    }

    setPasskeyPending(true);
    try {
      const result = await authClient.signIn.passkey();
      if (result.error) {
        setError("No se pudo iniciar sesión con tu passkey. Inténtalo de nuevo o usa otro método.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("No se completó el acceso con passkey. Puedes volver a intentarlo.");
    } finally {
      setPasskeyPending(false);
    }
  }

  // Send OTP Code
  async function handleSendOtp() {
    if (pending) return;
    setError(null);
    setInfoMessage(null);

    const trimmed = identifier.trim();
    if (!trimmed) {
      setError("Ingresa tu correo electrónico o nombre de usuario.");
      return;
    }

    setPending(true);
    try {
      const resolved = await resolveEmailFromIdentifier(trimmed);
      if (!resolved.success || !resolved.email) {
        setError(resolved.error || "No encontramos ninguna cuenta asociada a este usuario o correo.");
        return;
      }

      const email = resolved.email;
      setResolvedEmail(email);

      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      if (result.error) {
        if (result.error.status === 429) {
          setError("Demasiados intentos. Espera unos minutos antes de solicitar otro código.");
        } else {
          setError("No pudimos enviar el código. Verifica tus datos o inténtalo más tarde.");
        }
        return;
      }

      setOtpStep("verify");
      setOtpCode("");
      setCountdown(45);
      setInfoMessage(`Código enviado a ${email}`);
    } catch {
      setError("No pudimos conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  // Verify OTP Code
  async function handleVerifyOtp(codeToVerify?: string) {
    if (pending) return;
    const code = (codeToVerify ?? otpCode).trim();
    if (!resolvedEmail || code.length !== 6) {
      setError("Ingresa los 6 dígitos del código de acceso.");
      return;
    }

    setError(null);
    setInfoMessage(null);
    setPending(true);

    try {
      const result = await authClient.signIn.emailOtp({
        email: resolvedEmail,
        otp: code,
      });

      if (result.error) {
        if (result.error.status === 429) {
          setError("Demasiados intentos erróneos. Espera un momento y vuelve a intentarlo.");
        } else {
          setError("El código es incorrecto o ha caducado. Solicita uno nuevo si es necesario.");
        }
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("No pudimos conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  // Send Magic Link
  async function handleSendMagicLink() {
    if (pending) return;
    setError(null);
    setInfoMessage(null);

    const trimmed = identifier.trim();
    if (!trimmed) {
      setError("Ingresa tu correo electrónico o nombre de usuario.");
      return;
    }

    setPending(true);
    try {
      const resolved = await resolveEmailFromIdentifier(trimmed);
      if (!resolved.success || !resolved.email) {
        setError(resolved.error || "No encontramos ninguna cuenta asociada a este usuario o correo.");
        return;
      }

      const email = resolved.email;
      setResolvedEmail(email);

      const result = await authClient.signIn.magicLink({
        email,
        callbackURL: "/",
      });

      if (result.error) {
        if (result.error.status === 429) {
          setError("Demasiados intentos. Espera unos momentos antes de solicitar otro enlace.");
        } else {
          setError("No pudimos enviar el link de acceso. Inténtalo de nuevo.");
        }
        return;
      }

      setMagicLinkSent(true);
      setCountdown(45);
    } catch {
      setError("No pudimos conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  // Sign in with Password
  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setInfoMessage(null);

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
      setError("Ingresa tu correo electrónico o nombre de usuario.");
      return;
    }
    if (!password) {
      setError("Ingresa tu contraseña.");
      return;
    }

    setPending(true);
    try {
      const resolved = await resolveEmailFromIdentifier(trimmedIdentifier);
      if (!resolved.success || !resolved.email) {
        setError(resolved.error || "No encontramos ninguna cuenta asociada a este usuario o correo.");
        return;
      }

      const result = await authClient.signIn.email({
        email: resolved.email,
        password,
      });

      if (result.error) {
        if (result.error.status === 429) {
          setError("Demasiados intentos. Espera un momento y vuelve a intentarlo.");
        } else if (result.error.status === 403) {
          setError("Tu email aún no está verificado. Revisa tu bandeja de entrada para activar tu cuenta.");
        } else {
          setError("No pudimos iniciar sesión. Revisa tu correo/usuario y contraseña e inténtalo de nuevo.");
        }
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("No pudimos conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  const isGlobalPending = pending || passkeyPending;

  return (
    <div className="space-y-6 pb-[calc(8rem+env(safe-area-inset-bottom))] md:pb-0" aria-busy={isGlobalPending}>
      {/* Method Tabs */}
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-muted/60 p-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => {
            setMethod("otp");
            setError(null);
            setInfoMessage(null);
          }}
          disabled={isGlobalPending}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-xl py-2.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            method === "otp"
              ? "bg-background font-semibold text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ShieldCheck aria-hidden="true" className="size-3.5 shrink-0" />
          <span>Código OTP</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMethod("magic-link");
            setError(null);
            setInfoMessage(null);
          }}
          disabled={isGlobalPending}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-xl py-2.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            method === "magic-link"
              ? "bg-background font-semibold text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Sparkles aria-hidden="true" className="size-3.5 shrink-0" />
          <span>Link de entrar</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMethod("password");
            setError(null);
            setInfoMessage(null);
          }}
          disabled={isGlobalPending}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-xl py-2.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            method === "password"
              ? "bg-background font-semibold text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <KeyRound aria-hidden="true" className="size-3.5 shrink-0" />
          <span>Contraseña</span>
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* Informative message */}
      {infoMessage && !error && (
        <div
          role="status"
          className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary"
        >
          {infoMessage}
        </div>
      )}

      {/* -------------------- METHOD: OTP -------------------- */}
      {method === "otp" && (
        <div className="space-y-5">
          {otpStep === "request" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp-identifier">Nombre de usuario o correo</Label>
                <div className="relative">
                  <UserRound
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="otp-identifier"
                    type="text"
                    autoComplete="username email"
                    placeholder="ej. nicotordev o tu@email.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={isGlobalPending}
                    className="pl-10"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSendOtp();
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Te enviaremos un código temporal de 6 dígitos a tu correo registrado.
                </p>
              </div>

              <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:static md:mt-8 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
                <div className="mx-auto flex w-full max-w-md flex-col gap-2">
                  <Button
                    type="button"
                    size="lg"
                    className="min-h-12 w-full"
                    disabled={isGlobalPending || !identifier.trim()}
                    onClick={handleSendOtp}
                  >
                    {pending ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <Send aria-hidden="true" />}
                    {pending ? "Enviando código…" : "Enviar código OTP"}
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="min-h-12 w-full"
                    disabled={isGlobalPending}
                    onClick={signInWithPasskey}
                  >
                    {passkeyPending && <LoaderCircle aria-hidden="true" className="animate-spin" />}
                    {passkeyPending ? "Esperando tu passkey…" : "Iniciar sesión con passkey"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground">
                  Ingresa el código de 6 dígitos que enviamos a:
                </p>
                <p className="text-sm font-semibold break-all text-foreground">{resolvedEmail}</p>
              </div>

              <div className="flex justify-center py-2">
                <InputOTP
                  maxLength={6}
                  value={otpCode}
                  onChange={(val) => {
                    setOtpCode(val);
                    if (val.length === 6) {
                      handleVerifyOtp(val);
                    }
                  }}
                  disabled={isGlobalPending}
                  autoFocus
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setOtpStep("request");
                    setOtpCode("");
                    setError(null);
                  }}
                  disabled={isGlobalPending}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft aria-hidden="true" className="size-4" />
                  <span>Cambiar correo / usuario</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isGlobalPending || countdown > 0}
                  className="flex items-center gap-1.5 font-medium text-primary hover:underline disabled:pointer-events-none disabled:opacity-50"
                >
                  <RefreshCw aria-hidden="true" className={cn("size-3.5", pending && "animate-spin")} />
                  <span>{countdown > 0 ? `Reenviar (${countdown}s)` : "Reenviar código"}</span>
                </button>
              </div>

              <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:static md:mt-8 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
                <div className="mx-auto flex w-full max-w-md flex-col gap-2">
                  <Button
                    type="button"
                    size="lg"
                    className="min-h-12 w-full"
                    disabled={isGlobalPending || otpCode.length !== 6}
                    onClick={() => handleVerifyOtp()}
                  >
                    {pending && <LoaderCircle aria-hidden="true" className="animate-spin" />}
                    {pending ? "Verificando…" : "Verificar y acceder"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------- METHOD: MAGIC LINK -------------------- */}
      {method === "magic-link" && (
        <div className="space-y-5">
          {!magicLinkSent ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magic-identifier">Nombre de usuario o correo</Label>
                <div className="relative">
                  <Mail
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="magic-identifier"
                    type="text"
                    autoComplete="username email"
                    placeholder="ej. nicotordev o tu@email.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={isGlobalPending}
                    className="pl-10"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSendMagicLink();
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Te enviaremos un link de acceso directo a tu correo para iniciar sesión en 1 clic.
                </p>
              </div>

              <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:static md:mt-8 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
                <div className="mx-auto flex w-full max-w-md flex-col gap-2">
                  <Button
                    type="button"
                    size="lg"
                    className="min-h-12 w-full"
                    disabled={isGlobalPending || !identifier.trim()}
                    onClick={handleSendMagicLink}
                  >
                    {pending ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <Sparkles aria-hidden="true" />}
                    {pending ? "Enviando link de entrar…" : "Enviar link de entrar"}
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="min-h-12 w-full"
                    disabled={isGlobalPending}
                    onClick={signInWithPasskey}
                  >
                    {passkeyPending && <LoaderCircle aria-hidden="true" className="animate-spin" />}
                    {passkeyPending ? "Esperando tu passkey…" : "Iniciar sesión con passkey"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 aria-hidden="true" className="size-6" />
              </div>

              <div className="space-y-2">
                <h3 className="font-heading text-lg font-semibold">¡Link de entrar enviado!</h3>
                <p className="text-sm text-muted-foreground">
                  Revisa tu bandeja de entrada en{" "}
                  <strong className="break-all text-foreground">{resolvedEmail}</strong>.
                  Haz clic en el botón de acceso para iniciar sesión automáticamente.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 w-full"
                  disabled={isGlobalPending || countdown > 0}
                  onClick={handleSendMagicLink}
                >
                  <RefreshCw aria-hidden="true" className={cn("size-4", pending && "animate-spin")} />
                  {countdown > 0 ? `Reenviar link (${countdown}s)` : "Reenviar link de entrar"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-11 w-full text-sm text-muted-foreground"
                  disabled={isGlobalPending}
                  onClick={() => {
                    setMagicLinkSent(false);
                    setError(null);
                  }}
                >
                  Cambiar usuario o correo
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------- METHOD: PASSWORD -------------------- */}
      {method === "password" && (
        <form onSubmit={handlePasswordSubmit} noValidate className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password-identifier">Nombre de usuario o correo</Label>
            <div className="relative">
              <UserRound
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="password-identifier"
                type="text"
                autoComplete="username email"
                required
                placeholder="ej. nicotordev o tu@email.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={isGlobalPending}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <KeyRound
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isGlobalPending}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showPassword}
                disabled={isGlobalPending}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {showPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
              </button>
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:static md:mt-8 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
            <div className="mx-auto flex w-full max-w-md flex-col gap-2">
              <Button type="submit" size="lg" className="min-h-12 w-full" disabled={isGlobalPending}>
                {pending && <LoaderCircle aria-hidden="true" className="animate-spin" />}
                {pending ? "Iniciando sesión…" : "Iniciar sesión con contraseña"}
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="min-h-12 w-full"
                disabled={isGlobalPending}
                onClick={signInWithPasskey}
              >
                {passkeyPending && <LoaderCircle aria-hidden="true" className="animate-spin" />}
                {passkeyPending ? "Esperando tu passkey…" : "Iniciar sesión con passkey"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
