import { Key, Fingerprint, Unlock, Lock, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { GpgKeyDto } from "@/app/actions/gpg.actions";
import type { PrivateKey } from "openpgp";
import { cn } from "@/lib/utils";

interface ProfileOverviewCardProps {
  selectedKey: GpgKeyDto;
  unlockedPrivateKey: PrivateKey | null;
  copiedId: string | null;
  showMessenger: boolean;
  onCopyText: (text: string, id: string) => void;
  onDeleteProfile: (e: React.MouseEvent) => void;
}

export function ProfileOverviewCard({
  selectedKey,
  unlockedPrivateKey,
  copiedId,
  showMessenger,
  onCopyText,
  onDeleteProfile,
}: ProfileOverviewCardProps) {
  return (
    <div className="px-4 md:px-2">
      <Card
        className={cn(
          "border-white/8 bg-[#0b1122] px-5 py-5 shadow-lg shadow-black/15 backdrop-blur-sm mt-8 sm:px-7 sm:py-7",
          showMessenger && "hidden",
        )}
      >
        <CardContent className="p-0 flex flex-col items-stretch gap-4 md:flex-row md:items-center md:gap-6">
          <div
            className={cn(
              "size-16 shrink-0 rounded-xl bg-red-600 flex items-center justify-center text-2xl font-bold font-heading shadow-lg shadow-red-950/30 md:size-20",
            )}
          >
            {selectedKey.handle.slice(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1 space-y-2 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-white font-heading">
                {selectedKey.handle}
              </h2>
              <Badge
                variant="secondary"
                className="bg-slate-800 text-slate-300 border-slate-700"
              >
                {selectedKey.keyType}
              </Badge>
              {unlockedPrivateKey ? (
                <Badge
                  variant="outline"
                  className="bg-emerald-950/60 text-emerald-400 border-emerald-800/60 gap-1"
                >
                  <Unlock className="size-3" /> Key Unlocked in Memory
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-amber-950/60 text-amber-400 border-amber-800/60 gap-1"
                >
                  <Lock className="size-3" /> Envelope Locked
                </Badge>
              )}
            </div>

            <div className="grid gap-1 text-xs font-mono text-slate-400 sm:grid-cols-2">
              <span className="flex items-center gap-1">
                <Key className="size-3.5 text-red-400" /> Key ID:{" "}
                {selectedKey.keyId}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <Fingerprint className="size-3.5 text-blue-400" /> FP:{" "}
                {selectedKey.fingerprint.slice(0, 16)}…
              </span>
            </div>
          </div>

          <div className="grid w-full grid-cols-3 gap-2 md:w-auto md:flex md:flex-col lg:flex-row">
            {selectedKey.publicKey && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopyText(selectedKey.publicKey!, "public-key")}
                className="w-full bg-[#111a31] border-slate-800 px-2 text-[10px] text-slate-300 hover:text-white sm:text-xs md:w-auto"
              >
                <Copy className="size-3.5 mr-1.5" />
                <span>
                  {copiedId === "public-key" ? "Copied!" : "Copy GPG Key"}
                </span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onDeleteProfile}
              className="w-full border-red-900/60 bg-red-950/30 px-2 text-[10px] text-red-400 hover:border-red-700 hover:bg-red-950/70 hover:text-red-300 sm:text-xs md:w-auto"
            >
              <Trash2 className="size-3.5 mr-1.5" />
              <span>Delete Profile</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
