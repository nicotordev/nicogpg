import { Key, Shield, ArrowLeft } from "lucide-react";

export default function ProfileLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white"
    >
      {/* Top Header */}
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

      {/* Main Workspace Skeleton matching GpgWorkspace pixel-for-pixel */}
      <main className="flex-1 flex w-full min-h-[calc(100vh-4.5rem)] flex-col bg-[#060914] px-6 pb-24 pt-5 sm:px-10 sm:pb-24 sm:pt-7 lg:px-16 lg:pb-24 lg:pt-10">
        <div className="flex w-full flex-1 flex-col min-h-0 space-y-8 sm:space-y-10">
          {/* Workspace Header Skeleton */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/6 pb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-xl">
                <ArrowLeft className="size-4 text-slate-400" />
                <span className="h-4 w-28 rounded bg-slate-800 animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <div className="size-11 sm:size-12 rounded-2xl bg-slate-800/80 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-6 w-36 rounded-lg bg-slate-800 animate-pulse" />
                  <div className="h-4 w-48 rounded bg-slate-800/60 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-9 w-28 rounded-xl bg-slate-800/60 animate-pulse" />
              <div className="h-9 w-32 rounded-xl bg-red-950/40 border border-red-800/30 animate-pulse" />
            </div>
          </div>

          {/* Profile Overview Card Skeleton */}
          <div className="rounded-2xl border border-white/8 bg-slate-900/40 p-6 sm:p-8 shadow-xl shadow-black/20 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-slate-800 animate-pulse" />
                <div className="h-7 w-56 rounded-lg bg-slate-800/90 animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-7 w-20 rounded-full bg-slate-800/60 animate-pulse" />
                <div className="h-7 w-28 rounded-full bg-slate-800/60 animate-pulse" />
              </div>
            </div>

            {/* Armored Block Preview Skeleton */}
            <div className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-950/80 p-4 font-mono text-xs">
              <div className="h-4 w-64 rounded bg-slate-800/70 animate-pulse" />
              <div className="h-4 w-full rounded bg-slate-800/50 animate-pulse" />
              <div className="h-4 w-11/12 rounded bg-slate-800/50 animate-pulse" />
              <div className="h-4 w-10/12 rounded bg-slate-800/50 animate-pulse" />
              <div className="h-4 w-48 rounded bg-slate-800/70 animate-pulse" />
            </div>
          </div>

          {/* Messenger Card Skeleton */}
          <div className="rounded-2xl border border-white/8 bg-slate-900/40 overflow-hidden shadow-xl shadow-black/20">
            <div className="grid grid-cols-1 md:grid-cols-3 min-h-90">
              {/* Sidebar Contacts List Skeleton */}
              <div className="border-r border-white/6 p-4 space-y-3 bg-slate-950/40">
                <div className="flex items-center justify-between pb-2 border-b border-white/6">
                  <div className="h-4 w-20 rounded bg-slate-800 animate-pulse" />
                  <div className="size-6 rounded-lg bg-slate-800 animate-pulse" />
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/40 animate-pulse">
                    <div className="size-8 rounded-full bg-slate-800" />
                    <div className="space-y-1 flex-1">
                      <div className="h-3.5 w-24 rounded bg-slate-800" />
                      <div className="h-2.5 w-16 rounded bg-slate-800/60" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Conversation Area Skeleton */}
              <div className="md:col-span-2 p-6 flex flex-col justify-between bg-slate-950/20">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-white/6">
                    <div className="h-5 w-36 rounded bg-slate-800 animate-pulse" />
                    <div className="h-4 w-24 rounded bg-slate-800/60 animate-pulse" />
                  </div>
                  <div className="h-16 w-3/4 rounded-2xl bg-slate-900/60 border border-slate-800/60 animate-pulse" />
                </div>

                <div className="pt-6">
                  <div className="h-12 w-full rounded-xl bg-slate-900/80 border border-slate-800 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
