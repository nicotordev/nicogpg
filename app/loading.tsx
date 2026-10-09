export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-screen w-full items-center justify-center bg-background px-6"
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <div
          aria-hidden="true"
          className="relative size-14 animate-spin rounded-full border-2 border-muted border-t-primary"
        />
        <div className="space-y-1">
          <p className="font-heading text-lg font-semibold">Cargando nicogpg</p>
          <p className="text-sm text-muted-foreground">
            Preparando tu espacio seguro…
          </p>
        </div>
      </div>
    </main>
  );
}
