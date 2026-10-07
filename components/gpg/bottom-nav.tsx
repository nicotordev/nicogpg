import Link from "next/link";
import { Key, MessageCircle, UserPlus, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  selectedKeyId: string;
  pageMode?: "dashboard" | "profile";
  onOpenContacts: () => void;
  onShowSecurity: () => void;
}

export function BottomNav({
  selectedKeyId,
  pageMode = "dashboard",
  onOpenContacts,
  onShowSecurity,
}: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/8 bg-[#080d1c]/95 px-4 py-2 backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-4">
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center gap-1 py-1 text-[10px]",
            pageMode === "profile" ? "text-red-400" : "text-slate-500",
          )}
        >
          <Key className="size-4" />
          Keys
        </Link>
        <Link
          href={`/?key=${selectedKeyId}`}
          className={cn(
            "flex flex-col items-center gap-1 py-1 text-[10px]",
            pageMode === "dashboard" ? "text-blue-400" : "text-slate-500",
          )}
        >
          <MessageCircle className="size-4" />
          Chat
        </Link>
        <button
          type="button"
          onClick={onOpenContacts}
          className="flex flex-col items-center gap-1 py-1 text-[10px] text-slate-500"
        >
          <UserPlus className="size-4" />
          Contacts
        </button>
        <button
          type="button"
          onClick={onShowSecurity}
          className="flex flex-col items-center gap-1 py-1 text-[10px] text-slate-500"
        >
          <Shield className="size-4" />
          Security
        </button>
      </div>
    </nav>
  );
}
