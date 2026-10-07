import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GpgKeyDto } from "@/app/actions/gpg.actions";
import { AVATAR_GRADIENTS } from "../types";
import { cn } from "@/lib/utils";

interface EditKeyDialogProps {
  editingKey: GpgKeyDto | null;
  editHandle: string;
  editAvatarColor: string;
  isUpdatingKey: boolean;
  onClose: () => void;
  onEditHandleChange: (value: string) => void;
  onEditAvatarColorChange: (color: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EditKeyDialog({
  editingKey,
  editHandle,
  editAvatarColor,
  isUpdatingKey,
  onClose,
  onEditHandleChange,
  onEditAvatarColorChange,
  onSubmit,
}: EditKeyDialogProps) {
  return (
    <Dialog
      open={Boolean(editingKey)}
      onOpenChange={(open) => {
        if (!open && !isUpdatingKey) onClose();
      }}
    >
      <DialogContent className="max-w-[calc(100%-1.5rem)] border-slate-800 bg-slate-900 p-4 text-slate-100 sm:max-w-lg sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Edit GPG profile
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Update the visible profile name and avatar color. Your key material
            remains unchanged.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-300">
              Profile name
            </Label>
            <Input
              required
              value={editHandle}
              onChange={(event) => onEditHandleChange(event.target.value)}
              className="border-slate-800 bg-slate-950 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-300">
              Avatar color
            </Label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(AVATAR_GRADIENTS).map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Use ${color} avatar`}
                  onClick={() => onEditAvatarColorChange(color)}
                  className={cn(
                    "size-8 rounded-full bg-linear-to-br",
                    AVATAR_GRADIENTS[color],
                    editAvatarColor === color &&
                      "ring-2 ring-white ring-offset-2 ring-offset-slate-900",
                  )}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdatingKey || !editHandle.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdatingKey ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
