import Link from "next/link";
import { ArrowLeft, Shield, MessageCircle, UserRound, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { GpgKeyDto } from "@/app/actions/gpg.actions";

interface WorkspaceHeaderProps {
  selectedKey: GpgKeyDto;
  pageMode?: "dashboard" | "profile";
  onBackToProfiles: () => void;
  onDeleteProfile: (e: React.MouseEvent) => void;
}

export function WorkspaceHeader({
  selectedKey,
  pageMode = "dashboard",
  onBackToProfiles,
  onDeleteProfile,
}: WorkspaceHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/6 bg-slate-950/90 px-3 py-2.5 shadow-lg shadow-black/10 sm:px-6">
      {pageMode === "profile" ? (
        <Link
          href="/"
          className="inline-flex h-9 items-center gap-2 rounded-4xl px-3 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"
        >
          <ArrowLeft className="size-4" /> Dashboard
        </Link>
      ) : (
        <Button
          variant="ghost"
          onClick={onBackToProfiles}
          className="text-slate-400 hover:bg-slate-900 hover:text-white"
        >
          <ArrowLeft className="mr-2 size-4" /> Profiles
        </Button>
      )}

      <div className="flex min-w-0 items-center gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white sm:text-base">
            {selectedKey.handle}
          </p>
          <p className="hidden truncate font-mono text-[10px] text-slate-500 sm:block">
            {selectedKey.fingerprint.slice(0, 24)}…
          </p>
        </div>

        <Badge
          variant="outline"
          className="hidden border-emerald-800/60 bg-emerald-950/40 text-[10px] text-emerald-400 sm:inline-flex"
        >
          <Shield className="mr-1 size-3" /> Secure chat
        </Badge>

        {pageMode === "profile" ? (
          <Link
            href={`/?key=${selectedKey.id}`}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-4xl border border-slate-700 bg-slate-900 px-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <MessageCircle className="size-3.5" />
            <span className="hidden sm:inline">View chat</span>
          </Link>
        ) : (
          <Link
            href={`/profile?key=${selectedKey.id}`}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-4xl border border-slate-700 bg-slate-900 px-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <UserRound className="size-3.5" />
            <span className="hidden sm:inline">View my profile</span>
          </Link>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onDeleteProfile}
          className="shrink-0 border-red-900/60 bg-red-950/30 text-red-400 hover:border-red-700 hover:bg-red-950/70 hover:text-red-300"
        >
          <Trash2 className="size-3.5 sm:mr-1.5" />
          <span className="hidden sm:inline">Delete Profile</span>
        </Button>
      </div>
    </div>
  );
}
