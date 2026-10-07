import Link from "next/link";
import { Key, Shield, Upload, UserPlus, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Session } from "@/app/actions/auth.actions";

interface GpgHeaderProps {
  session: Session | null;
  onOpenImportModal: () => void;
  onOpenContactsDialog: () => void;
  onOpenGenerateModal: () => void;
  onSignOut: () => void;
}

export function GpgHeader({
  session,
  onOpenImportModal,
  onOpenContactsDialog,
  onOpenGenerateModal,
  onSignOut,
}: GpgHeaderProps) {
  return (
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
          {session ? (
            <div className="flex items-center gap-1.5 sm:gap-3">
              <span className="hidden md:inline-block text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                Account Active (ID: {session.user.id.slice(0, 8)}…)
              </span>
              <Button
                variant="outline"
                size="sm"
                title="Import Key"
                aria-label="Import Key"
                onClick={onOpenImportModal}
                className="bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200"
              >
                <Upload className="size-4 sm:mr-1.5 text-blue-400" />
                <span className="hidden sm:inline">Import Key</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                title="Contacts"
                aria-label="Contacts"
                onClick={onOpenContactsDialog}
                className="bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200"
              >
                <UserPlus className="size-4 sm:mr-1.5 text-emerald-400" />
                <span className="hidden sm:inline">Contacts</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                title="New Key Profile"
                aria-label="New Key Profile"
                onClick={onOpenGenerateModal}
                className="bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200"
              >
                <Plus className="size-4 sm:mr-1.5 text-red-400" />
                <span className="hidden sm:inline">New Key Profile</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSignOut}
                className="text-slate-400 hover:text-slate-100 hover:bg-slate-900"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          ) : (
            <Link href="/auth/sign-in">
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
