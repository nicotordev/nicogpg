"use client";

import "./globals.css";
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
    <html lang="en" className="dark">
      <body className="min-h-full bg-background text-foreground antialiased font-sans">
        <main className="flex min-h-screen w-full items-center justify-center bg-background px-6">
          <div className="w-full max-w-lg space-y-8 text-center">
            <p className="font-mono text-sm font-semibold tracking-[0.3em] text-destructive">
              ERROR 500
            </p>
            <div className="space-y-3">
              <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
                Something went wrong
              </h1>
              <p className="mx-auto max-w-md text-muted-foreground">
                The application encountered an unexpected issue. Please try loading it again.
              </p>
            </div>
            <button
              type="button"
              onClick={retry}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
