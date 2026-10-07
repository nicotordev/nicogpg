import { UserPlus } from "lucide-react";
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

interface AddContactSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contactName: string;
  onContactNameChange: (value: string) => void;
  contactKeyText: string;
  onContactKeyTextChange: (value: string) => void;
  contactError: string | null;
  onSubmit: (e: React.FormEvent) => void;
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
}: AddContactSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90vh] rounded-t-2xl border-slate-800 bg-slate-900 p-0 text-slate-100"
      >
        <SheetHeader className="border-b border-slate-800 px-4 pb-4 pt-5 text-left sm:px-6">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-700" />
          <SheetTitle className="flex items-center gap-2 text-xl font-bold text-white font-heading">
            <UserPlus className="size-5 text-emerald-400" /> Add contact
          </SheetTitle>
          <SheetDescription className="text-xs text-slate-400">
            Save a contact&apos;s public GPG key locally. Only encrypted messages
            can be created for this contact.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={onSubmit}
          className="space-y-4 overflow-y-auto px-4 py-5 sm:px-6"
        >
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-300">
              Contact name
            </Label>
            <Input
              required
              value={contactName}
              onChange={(event) => onContactNameChange(event.target.value)}
              placeholder="e.g. Alice"
              className="border-slate-800 bg-slate-950 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-300">
              Public GPG key
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
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <UserPlus className="size-4 mr-2" /> Save contact
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
