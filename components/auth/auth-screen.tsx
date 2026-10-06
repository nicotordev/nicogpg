import Link from "next/link";
import type { ReactNode } from "react";

type AuthScreenProps = {
  children: ReactNode;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
};

export function AuthScreen({
  children,
  title,
  description,
  backHref = "/",
  backLabel = "Volver",
}: AuthScreenProps) {
  return (
    <main lang="es" className="fixed inset-0 overflow-y-auto bg-background">
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-5 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <header className="flex min-h-12 items-center">
          <Link
            href={backHref}
            className="inline-flex min-h-11 items-center rounded-full px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <span aria-hidden="true" className="mr-2 text-lg leading-none">‹</span>
            {backLabel}
          </Link>
        </header>

        <section className="flex flex-1 flex-col justify-center py-8">
          <div className="mb-8 space-y-2">
            <p className="text-sm font-semibold tracking-wide text-primary">nicogpg</p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
