"use client";

import Link from "next/link";
import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background px-6">
      <div className="w-full max-w-lg space-y-8 text-center">
        <p className="font-mono text-sm font-semibold tracking-[0.3em] text-destructive">
          ERROR 500
        </p>
        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            Algo salió mal
          </h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            No pudimos cargar esta página. Intenta de nuevo o vuelve al inicio.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={retry}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
