"use client";

import {
  Sparkles,
  Plus,
  Upload,
  Eye,
  EyeOff,
  ClipboardPaste,
  LoaderCircle,
  AlertTriangle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ParsedGpgKey } from "@/lib/gpg-crypto";
import { useMobileSheet } from "../use-mobile-sheet";
import { AVATAR_GRADIENTS } from "../types";
import { cn } from "@/lib/utils";

interface AddKeyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  modalMode: "generate" | "import";
  onModalModeChange: (mode: "generate" | "import") => void;
  newHandle: string;
  onNewHandleChange: (value: string) => void;
  newPassphrase: string;
  onNewPassphraseChange: (value: string) => void;
  showPassphrase: boolean;
  onToggleShowPassphrase: () => void;
  newKeyType: string;
  onNewKeyTypeChange: (value: string) => void;
  newAvatarColor: string;
  onNewAvatarColorChange: (color: string) => void;
  armoredInputText: string;
  onArmoredTextChange: (text: string) => void;
  parsedKeyInfo: ParsedGpgKey | null;
  parseError: string | null;
  isParsingKey: boolean;
  importPassphrase: string;
  onImportPassphraseChange: (value: string) => void;
  showImportPassphrase: boolean;
  onToggleShowImportPassphrase: () => void;
  isCreatingKey: boolean;
  creationStatusText: string;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddKeyDialog({
  isOpen,
  onOpenChange,
  modalMode,
  onModalModeChange,
  newHandle,
  onNewHandleChange,
  newPassphrase,
  onNewPassphraseChange,
  showPassphrase,
  onToggleShowPassphrase,
  newKeyType,
  onNewKeyTypeChange,
  newAvatarColor,
  onNewAvatarColorChange,
  armoredInputText,
  onArmoredTextChange,
  parsedKeyInfo,
  parseError,
  isParsingKey,
  importPassphrase,
  onImportPassphraseChange,
  showImportPassphrase,
  onToggleShowImportPassphrase,
  isCreatingKey,
  creationStatusText,
  onSubmit,
}: AddKeyDialogProps) {
  const mobile = useMobileSheet();
  const content = (
    <>
        {mobile ? (
          <SheetHeader className="space-y-2 px-0 pt-1 text-left">
            <SheetTitle className="flex items-center gap-2 font-heading text-xl font-bold text-white">
              <Sparkles className="size-5 text-red-500" /> GPG Key Profile Setup
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-400">
              Generate or import an OpenPGP identity envelope. Passphrases never
              touch the server.
            </SheetDescription>
          </SheetHeader>
        ) : (
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold font-heading flex items-center gap-2 text-white">
              <Sparkles className="size-5 text-red-500" /> GPG Key Profile Setup
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Generate or import an OpenPGP identity envelope. Passphrases never
              touch the server.
            </DialogDescription>
          </DialogHeader>
        )}

        <Tabs
          value={modalMode}
          onValueChange={(val) => onModalModeChange(val as "generate" | "import")}
          className="w-full space-y-4"
        >
          <TabsList className="w-full bg-slate-950 p-1 border border-slate-800 rounded-xl grid grid-cols-2">
            <TabsTrigger
              value="generate"
              className="text-xs flex items-center justify-center gap-1.5 data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              <Plus className="size-3.5" /> Generate Key
            </TabsTrigger>
            <TabsTrigger
              value="import"
              className="text-xs flex items-center justify-center gap-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Upload className="size-3.5" /> Import Key / File
            </TabsTrigger>
          </TabsList>

          <form onSubmit={onSubmit} className="space-y-4">
            <TabsContent value="generate" className="space-y-4 m-0">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-300">
                  Identity Handle / Alias
                </Label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Cyber-Ghost, Sol-DevOps"
                  value={newHandle}
                  onChange={(e) => onNewHandleChange(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-red-500/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-300">
                  GPG Passphrase (Browser Secret)
                </Label>
                <div className="relative">
                  <Input
                    type={showPassphrase ? "text" : "password"}
                    required
                    placeholder="Enter secret GPG passphrase..."
                    value={newPassphrase}
                    onChange={(e) => onNewPassphraseChange(e.target.value)}
                    className="bg-slate-950 border-slate-800 pr-10 text-white placeholder:text-slate-600 focus-visible:ring-red-500/50"
                  />
                  <button
                    type="button"
                    onClick={onToggleShowPassphrase}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassphrase ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-300">
                  Key Algorithm
                </Label>
                <NativeSelect
                  value={newKeyType}
                  onChange={(e) => onNewKeyTypeChange(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white focus-visible:ring-red-500/50"
                >
                  <NativeSelectOption value="Ed25519">
                    Ed25519 (Recommended / Fast)
                  </NativeSelectOption>
                  <NativeSelectOption value="X25519">
                    X25519 (Curve25519 Encryption)
                  </NativeSelectOption>
                  <NativeSelectOption value="RSA 4096">
                    RSA 4096-bit (Legacy)
                  </NativeSelectOption>
                  <NativeSelectOption value="ECDSA P-384">
                    ECDSA P-384 (NIST Curve)
                  </NativeSelectOption>
                </NativeSelect>
              </div>
            </TabsContent>

            <TabsContent value="import" className="space-y-4 m-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-300">
                  <Label>Armored key</Label>
                  <span className="flex shrink-0 items-center gap-1 text-[11px] text-blue-400">
                    <ClipboardPaste className="size-3" /> Paste or drop
                  </span>
                </div>

                <Textarea
                  rows={6}
                  required
                  placeholder="-----BEGIN PGP PUBLIC KEY BLOCK----- or -----BEGIN PGP PRIVATE KEY BLOCK-----"
                  value={armoredInputText}
                  onChange={(e) => onArmoredTextChange(e.target.value)}
                  className="max-h-48 md:max-h-56 min-h-28 overflow-y-auto resize-y bg-slate-950 border-slate-800 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus-visible:ring-blue-500/50"
                />
              </div>

              {isParsingKey && (
                <div className="flex items-center gap-2 text-xs text-blue-400 font-mono">
                  <LoaderCircle className="size-3.5 animate-spin" /> Parsing
                  OpenPGP key metadata…
                </div>
              )}

              {parseError && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertTriangle className="size-3.5" /> {parseError}
                </p>
              )}

              {parsedKeyInfo && (
                <Card className="bg-slate-950 border-blue-900/50 p-3 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between font-semibold text-white">
                    <span>Key Identified: {parsedKeyInfo.handle}</span>
                    <Badge
                      variant="outline"
                      className="bg-blue-950 text-blue-300 border-blue-800 text-[10px] font-mono"
                    >
                      {parsedKeyInfo.keyType}
                    </Badge>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    Key ID: {parsedKeyInfo.keyId}
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    FP: {parsedKeyInfo.fingerprint}
                  </div>
                </Card>
              )}

              {parsedKeyInfo?.isPrivateKey && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-300">
                    Private key passphrase
                  </Label>
                  <div className="relative">
                    <Input
                      type={showImportPassphrase ? "text" : "password"}
                      required
                      placeholder="Enter passphrase to unlock..."
                      value={importPassphrase}
                      onChange={(e) => onImportPassphraseChange(e.target.value)}
                      className="bg-slate-950 border-slate-800 pr-10 text-white placeholder:text-slate-600 focus-visible:ring-blue-500/50"
                    />
                    <button
                      type="button"
                      aria-label={
                        showImportPassphrase
                          ? "Hide passphrase"
                          : "Show passphrase"
                      }
                      onClick={onToggleShowImportPassphrase}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      {showImportPassphrase ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Validated strictly in this browser and never sent to the server.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-300">
                  Identity Handle Alias
                </Label>
                <Input
                  type="text"
                  placeholder="Override or enter profile handle..."
                  value={newHandle}
                  onChange={(e) => onNewHandleChange(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-blue-500/50"
                />
              </div>
            </TabsContent>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-300">
                Avatar Color Theme
              </Label>
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {Object.keys(AVATAR_GRADIENTS).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => onNewAvatarColorChange(color)}
                    className={cn(
                      "size-8 rounded-full bg-linear-to-br flex items-center justify-center transition-transform",
                      AVATAR_GRADIENTS[color],
                      newAvatarColor === color
                        ? "ring-2 ring-white scale-110"
                        : "opacity-80 hover:opacity-100",
                    )}
                  >
                    {newAvatarColor === color && (
                      <Check className="size-4 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {creationStatusText && (
              <div className="p-3 rounded-xl bg-slate-950 border border-red-900/40 text-xs text-red-400 flex items-center gap-2 font-mono">
                <LoaderCircle className="size-4 animate-spin text-red-500" />
                <span>{creationStatusText}</span>
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="w-full text-slate-400 hover:text-white sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isCreatingKey ||
                  (modalMode === "generate" &&
                    (!newHandle.trim() || !newPassphrase)) ||
                  (modalMode === "import" &&
                    (!parsedKeyInfo ||
                      (parsedKeyInfo.isPrivateKey && !importPassphrase)))
                }
                className={cn(
                  "w-full text-white font-medium sm:w-auto",
                  modalMode === "generate"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700",
                )}
              >
                {isCreatingKey
                  ? "Processing..."
                  : modalMode === "generate"
                    ? "Create Zero-Knowledge Profile"
                    : "Import Key Profile"}
              </Button>
            </div>
          </form>
        </Tabs>
    </>
  );

  if (mobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="max-h-[92dvh] gap-4 overflow-y-auto rounded-t-3xl border-slate-800 bg-slate-900 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] text-slate-100 [&_input]:text-base [&_textarea]:text-base"
        >
          <div className="mx-auto h-1.5 w-12 shrink-0 rounded-full bg-slate-700" />
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-[calc(100%-1.5rem)] overflow-y-auto border-slate-800 bg-slate-900 p-4 text-slate-100 sm:max-w-lg sm:p-6">
        {content}
      </DialogContent>
    </Dialog>
  );
}
