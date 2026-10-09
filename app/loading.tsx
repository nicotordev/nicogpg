import { Key, Shield, Plus } from "lucide-react";

export default function HomeLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white"
    >
      {/* Top Header Skeleton */}
      <header className="sticky top-0 z-40 w-full border-b border-white/6 bg-slate-950/85 px-3 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-red-600 to-rose-700 shadow-lg shadow-red-900/40">
              <Key className="size-5 text-white animate-pulse" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-heading">
              nico<span className="text-red-500">gpg</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-red-800/40 bg-red-950/60 px-2.5 py-0.5 text-xs font-semibold text-red-400">
              <Shield className="size-3" /> Zero-Knowledge Envelope
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <div className="h-8 w-24 sm:w-28 rounded-lg bg-slate-800/60 animate-pulse hidden sm:block" />
            <div className="h-8 w-8 sm:w-24 rounded-lg bg-slate-800/60 animate-pulse" />
            <div className="h-8 w-8 sm:w-24 rounded-lg bg-red-900/30 border border-red-500/20 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Content: Netflix Profile Selector Grid Skeleton */}
      <main className="flex-1 flex w-full mx-auto max-w-7xl flex-col items-center justify-center p-3 sm:p-6 md:p-12">
        <div className="max-w-4xl w-full flex flex-col items-center justify-center space-y-10 py-6">
          {/* Header Banner Skeleton */}
          <div className="w-full rounded-xl border border-white/8 bg-slate-900/70 px-5 py-7 text-center shadow-lg shadow-black/15 sm:px-8">
            <div className="space-y-3 flex flex-col items-center">
              <div className="h-6 w-36 rounded-full bg-red-500/10 border border-red-500/20 animate-pulse" />
              <div className="h-9 md:h-12 w-64 md:w-96 rounded-xl bg-slate-800/80 animate-pulse" />
              <div className="h-4 w-72 md:w-80 rounded-md bg-slate-800/50 animate-pulse" />
            </div>
          </div>

          {/* Grid of Profile Cards Skeleton */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 lg:gap-8 justify-items-center w-full">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="group relative flex flex-col items-center w-full max-w-42.5"
              >
                <div className="relative aspect-square w-full max-w-40 rounded-xl bg-slate-800/70 border border-slate-700/50 flex flex-col items-center justify-center p-4 animate-pulse overflow-hidden shadow-lg shadow-black/40">
                  <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 to-transparent" />
                  <div className="size-16 sm:size-18 rounded-full bg-slate-700/60 animate-pulse mb-2" />
                  <div className="h-3 w-16 rounded bg-slate-600/50 animate-pulse" />
                </div>
                <div className="mt-3 h-4 w-20 rounded bg-slate-800/80 animate-pulse" />
                <div className="mt-1 h-3 w-12 rounded bg-slate-800/50 animate-pulse" />
              </div>
            ))}

            {/* Add Profile Placeholder Tile */}
            <div className="group relative flex flex-col items-center w-full max-w-42.5">
              <div className="relative aspect-square w-full max-w-40 rounded-xl border-2 border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center p-4">
                <div className="flex items-center justify-center size-14 rounded-full bg-slate-800/60 text-slate-500 mb-2">
                  <Plus className="size-8" />
                </div>
                <span className="text-xs font-medium text-slate-500">
                  Add Profile
                </span>
              </div>
              <div className="mt-3 h-4 w-24 rounded bg-slate-800/50" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
