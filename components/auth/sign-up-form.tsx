"use client";

import { useState } from "react";
import { useEffect } from "react";
import type { FormEvent } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Eye, EyeOff, KeyRound, LoaderCircle, Mail, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Ingresa un nombre de usuario."),
    email: z.string().trim().pipe(z.email("Ingresa un correo electrónico válido.")),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .regex(/[A-Z]/, "Incluye al menos una letra mayúscula.")
      .regex(/[a-z]/, "Incluye al menos una letra minúscula.")
      .regex(/[0-9]/, "Incluye al menos un número.")
      .regex(/[^A-Za-z0-9]/, "Incluye al menos un símbolo."),
    confirmPassword: z.string().min(1, "Confirma tu contraseña."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

type SignUpValues = z.infer<typeof signUpSchema>;
type Step = 0 | 1 | 2 | 3;
type PasswordRequirement = {
  label: string;
  test: (password: string) => boolean;
};

const passwordRequirements: PasswordRequirement[] = [
  { label: "8 caracteres como mínimo", test: (password) => password.length >= 8 },
  { label: "Una letra mayúscula", test: (password) => /[A-Z]/.test(password) },
  { label: "Una letra minúscula", test: (password) => /[a-z]/.test(password) },
  { label: "Un número", test: (password) => /[0-9]/.test(password) },
  { label: "Un símbolo", test: (password) => /[^A-Za-z0-9]/.test(password) },
];

const steps = [
  { title: "Nombre de usuario", description: "¿Cómo quieres que te llamemos?" },
  { title: "Tu email", description: "Usaremos tu email para tu cuenta." },
  { title: "Crea una contraseña", description: "Debe tener al menos 8 caracteres." },
  { title: "Confirma tu contraseña", description: "Escríbela una vez más para confirmar." },
] as const;

export function SignUpForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordRequirementsVisible, setPasswordRequirementsVisible] = useState(false);
  const [passwordRequirementsUnlocked, setPasswordRequirementsUnlocked] = useState(false);
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onTouched",
  });
  const { isSubmitting, errors } = form.formState;
  const currentStep = steps[step];
  const password = useWatch({ control: form.control, name: "password" });

  useEffect(() => {
    if (!password || passwordRequirementsUnlocked) return;

    const timeout = window.setTimeout(() => {
      setPasswordRequirementsVisible(false);
    }, 1400);

    return () => window.clearTimeout(timeout);
  }, [password, passwordRequirementsUnlocked]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    form.clearErrors("root");

    if (step < 3) {
      const fields = [
        ["name"],
        ["email"],
        ["password"],
        ["confirmPassword"],
      ][step] as Array<keyof SignUpValues>;
      const valid = await form.trigger(fields);
      if (valid) setStep((current) => (current + 1) as Step);
      return;
    }

    const valid = await form.trigger();
    if (!valid) return;

    const values = form.getValues();
    try {
      const result = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: "/auth/email-verified",
      });

      if (result.error) {
        form.setError("root", {
          message: result.error.status === 429
            ? "Demasiados intentos. Espera un momento y vuelve a intentarlo."
            : "No pudimos crear la cuenta. Comprueba tus datos e inténtalo de nuevo.",
        });
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      form.setError("root", { message: "No pudimos conectar con el servidor. Inténtalo de nuevo." });
    }
  }

  function goBack() {
    if (isSubmitting) return;
    form.clearErrors("root");
    setStep((current) => (current > 0 ? current - 1 : current) as Step);
  }

  function fieldErrorId(name: keyof SignUpValues) {
    return `${name}-error`;
  }

  function renderField(
    name: keyof SignUpValues,
    label: string,
    type: "text" | "email" | "password",
    autoComplete: string,
    Icon: typeof UserRound,
    showPasswordValue = false,
    onTogglePassword?: () => void,
  ) {
    return (
      <Controller
        name={name}
        control={form.control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <Label htmlFor={name}>{label}</Label>
            <div className="relative">
              <Icon aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                {...field}
                id={name}
                type={type === "password" && showPasswordValue ? "text" : type}
                autoComplete={autoComplete}
                autoFocus
                required
                disabled={isSubmitting}
                className={type === "password" ? "pl-10 pr-10" : "pl-10"}
                onChange={(event) => {
                  field.onChange(event);
                  if (type === "password" && !passwordRequirementsUnlocked) {
                    const nextPassword = event.target.value;
                    const hasCompletedRequirement = passwordRequirements.some(({ test }) => test(nextPassword));
                    setPasswordRequirementsVisible(nextPassword.length > 0);
                    if (hasCompletedRequirement) setPasswordRequirementsUnlocked(true);
                  }
                }}
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.error ? fieldErrorId(name) : undefined}
              />
              {type === "password" && onTogglePassword && (
                <button
                  type="button"
                  aria-label={showPasswordValue ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={showPasswordValue}
                  disabled={isSubmitting}
                  onClick={onTogglePassword}
                  className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {showPasswordValue ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
                </button>
              )}
            </div>
            {fieldState.error && (
              <p id={fieldErrorId(name)} role="alert" className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />
    );
  }

  function renderPasswordRequirements() {
    if (step !== 2 || !passwordRequirementsVisible) return null;

    return (
      <div className="space-y-2 rounded-2xl bg-muted/50 p-3 text-sm" aria-live="polite">
        <p className="font-medium">Tu contraseña debe incluir:</p>
        <ul className="space-y-1 text-muted-foreground">
          {passwordRequirements.map(({ label, test }) => {
            const complete = test(password);
            return (
              <li key={label} className={complete ? "flex items-center gap-2 text-primary" : "flex items-center gap-2"}>
                <CheckCircle2 aria-hidden="true" className={`size-4 ${complete ? "opacity-100" : "opacity-40"}`} />
                <span>{label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-6 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0"
      aria-busy={isSubmitting}
    >
      <div className="space-y-3" aria-label={`Paso ${step + 1} de ${steps.length}`}>
        <div className="flex items-center gap-2">
          {steps.map((item, index) => (
            <div
              key={item.title}
              aria-current={index === step ? "step" : undefined}
              className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Paso {step + 1} de {steps.length}</p>
      </div>

      <div className="space-y-1">
        <h2 className="font-heading text-lg font-semibold">{currentStep.title}</h2>
        <p className="text-sm text-muted-foreground">{currentStep.description}</p>
      </div>

      {step === 0 && renderField("name", "Nombre de usuario", "text", "username", UserRound)}
      {step === 1 && renderField("email", "Correo electrónico", "email", "email", Mail)}
      {step === 2 && renderField("password", "Contraseña", "password", "new-password", KeyRound, showPassword, () => setShowPassword((visible) => !visible))}
      {step === 3 && renderField("confirmPassword", "Confirmar contraseña", "password", "new-password", KeyRound, showConfirmPassword, () => setShowConfirmPassword((visible) => !visible))}
      {renderPasswordRequirements()}

      {errors.root && <p role="alert" className="text-sm text-destructive">{errors.root.message}</p>}

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:static md:mt-8 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div className="mx-auto flex w-full max-w-md gap-3">
        {step > 0 && (
          <Button type="button" variant="outline" onClick={goBack} disabled={isSubmitting} className="flex-1">
            <ArrowLeft aria-hidden="true" />
            Atrás
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : step === 3 ? <Check aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
          {isSubmitting ? "Creando cuenta…" : step === 3 ? "Crear cuenta" : "Continuar"}
        </Button>
        </div>
      </div>
    </form>
  );
}
