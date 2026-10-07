import { CheckCircle2, LoaderCircle, FileText, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface SignMessageCardProps {
  showMessenger: boolean;
  isUnlocked: boolean;
  messageToSign: string;
  signedOutput: string;
  isSigning: boolean;
  copiedId: string | null;
  onMessageChange: (value: string) => void;
  onSignMessage: () => void;
  onCopyText: (text: string, id: string) => void;
}

export function SignMessageCard({
  showMessenger,
  isUnlocked,
  messageToSign,
  signedOutput,
  isSigning,
  copiedId,
  onMessageChange,
  onSignMessage,
  onCopyText,
}: SignMessageCardProps) {
  if (showMessenger || !isUnlocked) {
    return null;
  }

  return (
    <Card className="border-slate-800 bg-slate-900/40 px-5 py-5 mt-8 sm:px-7 sm:py-7 space-y-5 animate-in fade-in duration-300">
      <CardHeader className="p-0">
        <CardTitle className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="size-4" /> OpenPGP Cleartext Signing (In Memory)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-3">
        <Textarea
          rows={3}
          value={messageToSign}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Type a message to cleartext sign with your unlocked Ed25519 private key..."
          className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-500/50"
        />

        <div className="flex justify-end">
          <Button
            onClick={onSignMessage}
            disabled={!messageToSign.trim() || isSigning}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md shadow-emerald-900/30"
          >
            {isSigning ? (
              <LoaderCircle className="size-4 animate-spin mr-2" />
            ) : (
              <FileText className="size-4 mr-2" />
            )}
            Sign Message
          </Button>
        </div>

        {signedOutput && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Signed OpenPGP Output:</span>
              <button
                onClick={() => onCopyText(signedOutput, "signed")}
                className="text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Copy className="size-3" />{" "}
                {copiedId === "signed" ? "Copied!" : "Copy Signed Text"}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
              {signedOutput}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
