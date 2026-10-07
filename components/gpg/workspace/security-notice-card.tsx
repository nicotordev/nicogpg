import { Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SecurityNoticeCardProps {
  showMessenger: boolean;
}

export function SecurityNoticeCard({ showMessenger }: SecurityNoticeCardProps) {
  return (
    <div className="px-4 md:px-2">
      <Card
        className={cn(
          "border-red-900/40 bg-[#10152a] px-5 py-5 shadow-md shadow-black/10 mt-8 sm:px-7 sm:py-7",
          showMessenger && "hidden",
        )}
      >
        <CardContent className="p-0 flex items-start gap-3 text-xs text-slate-400">
          <Shield className="size-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-200 mb-1">
              Server Zero-Knowledge Guarantee
            </p>
            <p>
              Postgres stores only the encrypted OpenPGP envelope ciphertext. Your
              GPG passphrase is never sent over the wire, and decryption happens
              exclusively inside your browser memory.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
