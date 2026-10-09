"use client";

import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function GlobalError({ error, retry }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="bg-[#111719] text-[#f7faf9]">
        <main className="flex min-h-screen w-full items-center justify-center px-6">
          <div className="w-full max-w-lg space-y-8 text-center">
            <p className="font-mono text-sm font-semibold tracking-[0.3em] text-[#f07c35]">
              ERROR 500
            </p>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Algo salió mal
              </h1>
              <p className="mx-auto max-w-md text-[#aebbb8]">
                La aplicación encontró un problema inesperado. Intenta cargarla
                de nuevo.
              </p>
            </div>
            <button
              type="button"
              onClick={retry}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#f07c35] px-6 text-sm font-medium text-[#24150d] transition-opacity hover:opacity-90"
            >
              Intentar de nuevo
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
