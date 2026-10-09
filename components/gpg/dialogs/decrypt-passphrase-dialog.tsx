import { LoaderCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DecryptPassphraseDialogProps {
  open: boolean;
  passphrase: string;
  error: string | null;
  isDecrypting: boolean;
  onOpenChange: (open: boolean) => void;
  onPassphraseChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export function DecryptPassphraseDialog({
  open,
  passphrase,
  error,
  isDecrypting,
  onOpenChange,
  onPassphraseChange,
  onSubmit,
}: DecryptPassphraseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-1.5rem)] border-slate-800 bg-slate-900 text-slate-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Lock className="size-4 text-amber-400" /> Clave privada
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Escribe la passphrase de este perfil para descifrar el mensaje. Se
            usa solo en este navegador.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="decrypt-passphrase" className="text-xs text-slate-300">
              Passphrase
            </Label>
            <Input
              id="decrypt-passphrase"
              type="password"
              autoFocus
              required
              value={passphrase}
              onChange={(event) => onPassphraseChange(event.target.value)}
              placeholder="Passphrase de la clave privada"
              className="border-slate-800 bg-slate-950 text-white"
            />
          </div>
          {error && (
            <p role="alert" className="text-xs text-red-400">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isDecrypting || !passphrase}
              className="bg-amber-500 text-white hover:bg-amber-600"
            >
              {isDecrypting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                "Descifrar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
