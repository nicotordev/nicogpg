import { Lock, Unlock, LoaderCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface UnlockKeyCardProps {
  showMessenger: boolean;
  hasEncryptedPrivateKey: boolean;
  isUnlocked: boolean;
  passphraseInput: string;
  isUnlocking: boolean;
  unlockError: string | null;
  onPassphraseChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function UnlockKeyCard({
  showMessenger,
  hasEncryptedPrivateKey,
  isUnlocked,
  passphraseInput,
  isUnlocking,
  unlockError,
  onPassphraseChange,
  onSubmit,
}: UnlockKeyCardProps) {
  if (showMessenger || !hasEncryptedPrivateKey || isUnlocked) {
    return null;
  }

  return (
    <div className="px-4 md:px-2">
      <Card className="border-amber-900/50 bg-[#10152a] px-5 py-5 shadow-md shadow-black/10 mt-8 sm:px-7 sm:py-7 space-y-5">
        <CardHeader className="p-0">
          <CardTitle className="text-sm font-semibold text-amber-400 flex items-center gap-2">
            <Lock className="size-4" /> Unlock Private Key in Browser
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-3">
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <Input
              type="password"
              required
              placeholder="Enter GPG Passphrase..."
              value={passphraseInput}
              onChange={(e) => onPassphraseChange(e.target.value)}
              className="flex-1 bg-[#080d1c] border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-amber-500/50"
            />
            <Button
              type="submit"
              disabled={isUnlocking}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-md shadow-amber-950/20"
            >
              {isUnlocking ? (
                <LoaderCircle className="size-4 animate-spin mr-2" />
              ) : (
                <Unlock className="size-4 mr-2" />
              )}
              Unlock Key
            </Button>
          </form>
          {unlockError && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertTriangle className="size-3.5" /> {unlockError}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
