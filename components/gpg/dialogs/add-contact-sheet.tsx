import { useState } from "react";
import { UserPlus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type ContactDraftMode = "local" | "keyed";

interface AddContactSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contactName: string;
  onContactNameChange: (value: string) => void;
  contactKeyText: string;
  onContactKeyTextChange: (value: string) => void;
  contactError: string | null;
  onSubmit: (event: React.FormEvent, mode: ContactDraftMode) => void;
  onCreateSelfChat: () => void;
}

export function AddContactSheet({
  isOpen,
  onOpenChange,
  contactName,
  onContactNameChange,
  contactKeyText,
  onContactKeyTextChange,
  contactError,
  onSubmit,
  onCreateSelfChat,
}: AddContactSheetProps) {
  const [mode, setMode] = useState<ContactDraftMode>("local");

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90vh] rounded-t-2xl border-slate-800 bg-slate-900 p-0 text-slate-100"
      >
        <SheetHeader className="border-b border-slate-800 px-4 pb-4 pt-5 text-left sm:px-6">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-700" />
          <SheetTitle className="flex items-center gap-2 text-xl font-bold text-white font-heading">
            <UserPlus className="size-5 text-emerald-400" /> Agregar chat
          </SheetTitle>
          <SheetDescription className="text-xs text-slate-400">
            Crea un chat sin clave, cifra con una clave pública, o habla
            contigo usando la clave de este perfil.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={(event) => onSubmit(event, mode)}
          className="space-y-4 overflow-y-auto px-4 py-5 sm:px-6"
        >
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("local")}
              className={cn(
                "rounded-xl border px-3 py-2 text-left text-xs",
                mode === "local"
                  ? "border-emerald-500/70 bg-emerald-950/40 text-white"
                  : "border-slate-800 text-slate-400",
              )}
            >
              <span className="block font-semibold">Sin clave</span>
              <span className="mt-1 block text-[11px] text-slate-400">
                Nota local en este navegador
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMode("keyed")}
              className={cn(
                "rounded-xl border px-3 py-2 text-left text-xs",
                mode === "keyed"
                  ? "border-blue-500/70 bg-blue-950/40 text-white"
                  : "border-slate-800 text-slate-400",
              )}
            >
              <span className="block font-semibold">Clave pública</span>
              <span className="mt-1 block text-[11px] text-slate-400">
                Cifrado OpenPGP para otra persona
              </span>
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onCreateSelfChat}
            className="w-full border-slate-700"
          >
            <UserRound className="size-4 mr-2" /> Chatear conmigo
          </Button>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-300">
              Nombre
            </Label>
            <Input
              required
              value={contactName}
              onChange={(event) => onContactNameChange(event.target.value)}
              placeholder="e.g. Alice"
              className="border-slate-800 bg-slate-950 text-white"
            />
          </div>
          {mode === "keyed" ? (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-300">
                Clave pública
              </Label>
              <Textarea
                required
                rows={8}
                value={contactKeyText}
                onChange={(event) => onContactKeyTextChange(event.target.value)}
                placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----"
                className="border-slate-800 bg-slate-950 font-mono text-xs text-white"
              />
            </div>
          ) : (
            <p className="text-[11px] leading-relaxed text-slate-500">
              El texto queda guardado solo en este navegador. No se cifra para
              otra persona.
            </p>
          )}
          {contactError && (
            <p role="alert" className="text-xs text-red-400">
              {contactError}
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
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <UserPlus className="size-4 mr-2" /> Guardar chat
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
