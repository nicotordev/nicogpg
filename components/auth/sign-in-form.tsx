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

type SignInFormProps = {
  onOtpVerifyChange?: (visible: boolean) => void;
};

export function SignInForm({ onOtpVerifyChange }: SignInFormProps) {
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

  const showingOtpVerify = method === "otp" && otpStep === "verify";

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = window.setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [countdown]);

  useEffect(() => {
    onOtpVerifyChange?.(showingOtpVerify);
  }, [onOtpVerifyChange, showingOtpVerify]);

  // Handle Passkey Login
  async function signInWithPasskey() {
    if (pending || passkeyPending) return;
    setError(null);
    setInfoMessage(null);

    if (!window.PublicKeyCredential || !window.isSecureContext) {
      setError("This browser does not support passkeys. Use an OTP code, magic link, or your password.");
      return;
    }

    setPasskeyPending(true);
    try {
      const result = await authClient.signIn.passkey();
      if (result.error) {
        setError("Could not sign in with your passkey. Please try again or use another method.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Passkey sign-in could not be completed. You can try again.");
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
      setError("Please enter your email address or username.");
      return;
    }

    setPending(true);
    try {
      const resolved = await resolveEmailFromIdentifier(trimmed);
      if (!resolved.success || !resolved.email) {
        setError(resolved.error || "No account found associated with this user or email.");
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
          setError("Too many attempts. Please wait a few minutes before requesting another code.");
        } else {
          setError("Could not send the code. Please verify your info or try again later.");
        }
        return;
      }

      setOtpStep("verify");
      setOtpCode("");
      setCountdown(45);
      setInfoMessage(`Code sent to ${email}`);
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  // Verify OTP Code
  async function handleVerifyOtp(codeToVerify?: string) {
    if (pending) return;
    const code = (codeToVerify ?? otpCode).trim();
    if (!resolvedEmail || code.length !== 6) {
      setError("Please enter the 6-digit access code.");
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
          setError("Too many incorrect attempts. Please wait a moment and try again.");
        } else {
          setError("The code is incorrect or expired. Please request a new one if needed.");
        }
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Could not connect to the server. Please try again.");
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
      setError("Please enter your email address or username.");
      return;
    }

    setPending(true);
    try {
      const resolved = await resolveEmailFromIdentifier(trimmed);
      if (!resolved.success || !resolved.email) {
        setError(resolved.error || "No account found associated with this user or email.");
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
          setError("Too many attempts. Please wait a few moments before requesting another link.");
        } else {
          setError("Could not send the access link. Please try again.");
        }
        return;
      }

      setMagicLinkSent(true);
      setCountdown(45);
    } catch {
      setError("Could not connect to the server. Please try again.");
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
      setError("Please enter your email address or username.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setPending(true);
    try {
      const resolved = await resolveEmailFromIdentifier(trimmedIdentifier);
      if (!resolved.success || !resolved.email) {
        setError(resolved.error || "No account found associated with this user or email.");
        return;
      }

      const result = await authClient.signIn.email({
        email: resolved.email,
        password,
      });

      if (result.error) {
        if (result.error.status === 429) {
          setError("Too many attempts. Please wait a moment and try again.");
        } else if (result.error.status === 403) {
          setError("Your email is not verified yet. Please check your inbox to activate your account.");
        } else {
          setError("Could not sign in. Please verify your credentials and try again.");
        }
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const isGlobalPending = pending || passkeyPending;

  return (
    <div className="space-y-6 pb-[calc(8rem+env(safe-area-inset-bottom))] md:pb-0" aria-busy={isGlobalPending}>
      {/* Method Tabs */}
      {showingOtpVerify ? null : (
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
          <span>OTP Code</span>
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
          <span>Magic Link</span>
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
          <span>Password</span>
        </button>
      </div>
      )}

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
      {infoMessage && !error && !showingOtpVerify && (
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
                <Label htmlFor="otp-identifier">Username or email</Label>
                <div className="relative">
                  <UserRound
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="otp-identifier"
                    type="text"
                    autoComplete="username email"
                    placeholder="e.g. username or you@email.com"
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
                  We will send a 6-digit temporary code to your registered email.
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
                    {pending ? "Sending code…" : "Send OTP code"}
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
                    {passkeyPending ? "Waiting for passkey…" : "Sign in with passkey"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <p id="otp-sent-label" className="text-sm text-muted-foreground">
                  Enter the 6-digit code sent to:
                </p>
                <p id="otp-sent-email" className="text-sm font-semibold break-all text-foreground">{resolvedEmail}</p>
              </div>

              <div className="flex justify-center py-2">
                <InputOTP
                  id="otp-code"
                  aria-labelledby="otp-sent-label otp-sent-email"
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
                  <span>Change email / username</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isGlobalPending || countdown > 0}
                  className="flex items-center gap-1.5 font-medium text-primary hover:underline disabled:pointer-events-none disabled:opacity-50"
                >
                  <RefreshCw aria-hidden="true" className={cn("size-3.5", pending && "animate-spin")} />
                  <span>{countdown > 0 ? `Resend (${countdown}s)` : "Resend code"}</span>
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
                    {pending ? "Verifying…" : "Verify and sign in"}
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
                <Label htmlFor="magic-identifier">Username or email</Label>
                <div className="relative">
                  <Mail
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="magic-identifier"
                    type="text"
                    autoComplete="username email"
                    placeholder="e.g. username or you@email.com"
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
                  We will send a direct login link to your email for 1-click access.
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
                    {pending ? "Sending login link…" : "Send magic link"}
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
                    {passkeyPending ? "Waiting for passkey…" : "Sign in with passkey"}
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
                <h3 className="font-heading text-lg font-semibold">Magic link sent!</h3>
                <p className="text-sm text-muted-foreground">
                  Check your inbox at{" "}
                  <strong className="break-all text-foreground">{resolvedEmail}</strong>.
                  Click the login link to sign in automatically.
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
                  {countdown > 0 ? `Resend link (${countdown}s)` : "Resend magic link"}
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
                  Change username or email
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
            <Label htmlFor="password-identifier">Username or email</Label>
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
                placeholder="e.g. username or you@email.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={isGlobalPending}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
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
                aria-label={showPassword ? "Hide password" : "Show password"}
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
                {pending ? "Signing in…" : "Sign in with password"}
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
                {passkeyPending ? "Waiting for passkey…" : "Sign in with passkey"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
