import { Key, Shield, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <main className="min-h-screen w-full bg-slate-950">
      <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
        {/* Top Navigation Header (GpgHeader skeleton) */}
        <header className="sticky top-0 z-40 w-full border-b border-white/6 bg-slate-950/85 px-3 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-red-600 to-rose-700 shadow-lg shadow-red-900/40">
                <Key className="size-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-heading">
                nico<span className="text-red-500">gpg</span>
              </span>
              <Badge
                variant="outline"
                className="hidden sm:inline-flex bg-red-950/60 text-red-400 border-red-800/40 gap-1.5"
              >
                <Shield className="size-3" /> Zero-Knowledge Envelope
              </Badge>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
              <Skeleton className="hidden md:inline-block h-8 w-44 rounded-lg bg-slate-900 border border-slate-800" />
              <Skeleton className="h-8 w-24 sm:w-28 rounded-lg bg-slate-900 border border-slate-800" />
              <Skeleton className="h-8 w-8 sm:w-24 rounded-lg bg-slate-900 border border-slate-800" />
              <Skeleton className="size-8 rounded-lg bg-slate-900 border border-slate-800" />
            </div>
          </div>
        </header>

        {/* Main Content Area (matching pageMode="profile") */}
        <div className="flex-1 flex w-full min-h-[calc(100vh-4.5rem)] flex-col bg-[#060914] px-6 pb-24 pt-5 sm:px-10 sm:pb-24 sm:pt-7 lg:px-16 lg:pb-24 lg:pt-10">
          <div className="flex w-full flex-1 flex-col min-h-0 space-y-8 bg-[#060914] sm:space-y-10">
            {/* WorkspaceHeader Skeleton */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/6 bg-slate-950/90 px-3 py-2.5 shadow-lg shadow-black/10 sm:px-6 rounded-2xl">
              <div className="inline-flex h-9 items-center gap-2 rounded-4xl px-3 text-sm font-medium text-slate-400">
                <ArrowLeft className="size-4" /> Dashboard
              </div>

              <div className="flex min-w-0 items-center gap-3">
                <div className="min-w-0 space-y-1">
                  <Skeleton className="h-4 w-28 bg-slate-800" />
                  <Skeleton className="hidden sm:block h-3 w-40 bg-slate-800/60" />
                </div>
                <Skeleton className="h-7 w-20 rounded-full bg-slate-800" />
              </div>
            </div>

            {/* ProfileOverviewCard Skeleton */}
            <div className="px-4 md:px-2">
              <Card className="border-white/8 bg-[#0b1122] px-5 py-5 shadow-lg shadow-black/15 backdrop-blur-sm mt-8 sm:px-7 sm:py-7">
                <CardContent className="p-0 flex flex-col items-stretch gap-4 md:flex-row md:items-center md:gap-6">
                  {/* Avatar Skeleton */}
                  <Skeleton className="size-16 shrink-0 rounded-xl bg-slate-800 md:size-20" />

                  {/* Info Skeleton */}
                  <div className="min-w-0 flex-1 space-y-2 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <Skeleton className="h-6 w-36 bg-slate-800" />
                      <Skeleton className="h-5 w-20 rounded-md bg-slate-800" />
                      <Skeleton className="h-5 w-32 rounded-md bg-slate-800" />
                    </div>

                    <div className="grid gap-1.5 sm:grid-cols-2 pt-1">
                      <Skeleton className="h-4 w-44 bg-slate-800/80" />
                      <Skeleton className="h-4 w-48 bg-slate-800/80" />
                    </div>
                  </div>

                  {/* Actions Skeleton */}
                  <div className="grid w-full grid-cols-3 gap-2 md:w-auto md:flex md:flex-col lg:flex-row">
                    <Skeleton className="h-9 w-full md:w-28 rounded-lg bg-slate-800" />
                    <Skeleton className="h-9 w-full md:w-28 rounded-lg bg-slate-800" />
                    <Skeleton className="h-9 w-full md:w-24 rounded-lg bg-slate-800" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Unlock Key Card Skeleton */}
            <div className="px-4 md:px-2">
              <Card className="border-amber-900/30 bg-[#10152a]/70 px-5 py-5 shadow-md shadow-black/10 mt-8 sm:px-7 sm:py-7 space-y-4">
                <CardHeader className="p-0">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-4 rounded-full bg-amber-500/40" />
                    <Skeleton className="h-4 w-52 bg-amber-500/30" />
                  </div>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                  <Skeleton className="h-10 w-full rounded-md bg-[#080d1c] border border-slate-800" />
                  <Skeleton className="h-10 w-full rounded-md bg-amber-500/20" />
                </CardContent>
              </Card>
            </div>

            {/* Security Notice Card Skeleton */}
            <div className="px-4 md:px-2">
              <Card className="border-red-900/30 bg-[#10152a]/60 px-5 py-5 shadow-md shadow-black/10 mt-8 sm:px-7 sm:py-7">
                <CardContent className="p-0 flex items-start gap-3">
                  <Skeleton className="size-5 rounded-full bg-red-500/40 shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48 bg-slate-800" />
                    <Skeleton className="h-3 w-full bg-slate-800/60" />
                    <Skeleton className="h-3 w-3/4 bg-slate-800/60" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
