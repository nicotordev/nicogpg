export default function AuthLoading() {
  return (
    <main
      lang="es"
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="fixed inset-0 overflow-y-auto bg-background"
    >
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-5 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))]">
        {/* Back Link Placeholder */}
        <header className="flex min-h-12 items-center">
          <div className="h-8 w-20 rounded-full bg-muted/60 animate-pulse" />
        </header>

        {/* Auth Form Header Skeleton */}
        <section className="flex flex-1 flex-col justify-center py-8">
          <div className="mb-8 space-y-2">
            <div className="h-4 w-16 rounded bg-primary/20 animate-pulse" />
            <div className="h-9 w-48 rounded-lg bg-muted animate-pulse" />
            <div className="h-4 w-72 rounded bg-muted/60 animate-pulse" />
          </div>

          {/* Form Fields Skeleton */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-muted/70 animate-pulse" />
              <div className="h-11 w-full rounded-xl border border-muted bg-muted/30 animate-pulse" />
            </div>

            <div className="space-y-2">
              <div className="h-4 w-28 rounded bg-muted/70 animate-pulse" />
              <div className="h-11 w-full rounded-xl border border-muted bg-muted/30 animate-pulse" />
            </div>

            <div className="pt-2">
              <div className="h-11 w-full rounded-xl bg-primary/80 animate-pulse" />
            </div>
          </div>

          {/* Footer Links Skeleton */}
          <div className="mt-8 space-y-3 text-center flex flex-col items-center">
            <div className="h-4 w-36 rounded bg-muted/50 animate-pulse" />
            <div className="h-4 w-48 rounded bg-muted/50 animate-pulse" />
          </div>
        </section>
      </div>
    </main>
  );
}
