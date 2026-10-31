"use client";

import { useEffect, useState } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

function blockDismiss(
  next: boolean,
  details: { cancel: () => void },
) {
  if (!next) details.cancel();
}

function useMobileSheet() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return mobile;
}

interface ProfilePassphraseDialogProps {
  open: boolean;
  profileName: string;
  passphrase: string;
  error: string | null;
  isUnlocking: boolean;
  onOpenChange: (open: boolean) => void;
  onPassphraseChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export function ProfilePassphraseDialog({
  open,
  profileName,
  passphrase,
  error,
  isUnlocking,
  onOpenChange,
  onPassphraseChange,
  onSubmit,
}: ProfilePassphraseDialogProps) {
  const mobile = useMobileSheet();
  const form = (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="profile-passphrase" className="text-xs text-slate-300">
          Passphrase
        </Label>
        <Input
          id="profile-passphrase"
          type="password"
          autoFocus
          required
          value={passphrase}
          onChange={(event) => onPassphraseChange(event.target.value)}
          placeholder="Profile passphrase"
          className="border-slate-800 bg-slate-950 text-base text-white"
        />
      </div>
      {error ? (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      ) : null}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isUnlocking || !passphrase}
          className="bg-amber-500 text-white hover:bg-amber-600"
        >
          {isUnlocking ? <LoaderCircle className="size-4 animate-spin" /> : "Unlock"}
        </Button>
      </div>
    </form>
  );

  if (mobile) {
    return (
      <Sheet open={open} disablePointerDismissal onOpenChange={blockDismiss}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="rounded-t-3xl border-slate-800 bg-slate-900 px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-slate-100"
        >
          <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-slate-700" />
          <SheetHeader className="px-0 pt-2 text-left">
            <SheetTitle className="flex items-center gap-2 text-white">
              <Lock className="size-4 text-amber-400" /> Unlock profile
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-400">
              Enter the passphrase for {profileName || "this profile"}. It unlocks
              the private key in this browser and is not stored.
            </SheetDescription>
          </SheetHeader>
          {form}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} disablePointerDismissal onOpenChange={blockDismiss}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[calc(100%-1.5rem)] border-slate-800 bg-slate-900 text-slate-100 sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Lock className="size-4 text-amber-400" /> Unlock profile
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Enter the passphrase for {profileName || "this profile"}. It unlocks
            the private key in this browser and is not stored.
          </DialogDescription>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  );
}

interface LeaveProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function LeaveProfileDialog({
  open,
  onOpenChange,
  onConfirm,
}: LeaveProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-1.5rem)] border-slate-800 bg-slate-900 text-slate-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Sign out</DialogTitle>
          <DialogDescription className="text-sm text-slate-400">
            Are you sure you want to sign out?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Sign out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
