import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página no encontrada | nicogpg",
  description: "La página que buscas no existe.",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background px-6">
      <div className="w-full max-w-lg space-y-8 text-center">
        <p className="font-mono text-sm font-semibold tracking-[0.3em] text-primary">
          ERROR 404
        </p>
        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            Esta página no existe
          </h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            Puede que el enlace esté roto o que la página haya sido movida.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
