import { Key, MessageCircle, UserPlus, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  selectedKeyId: string;
  pageMode?: "dashboard" | "profile";
  showMessenger: boolean;
  onOpenContacts: () => void;
  onShowSecurity: () => void;
  onShowChat: () => void;
  onBackToProfiles: () => void;
}

export function BottomNav({
  showMessenger,
  onOpenContacts,
  onShowSecurity,
  onShowChat,
  onBackToProfiles,
}: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/8 bg-[#080d1c]/95 px-4 py-2 backdrop-blur-xl pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {/* Return to Profiles Grid */}
        <button
          type="button"
          onClick={onBackToProfiles}
          className="flex flex-col items-center gap-1 py-1 text-[10px] text-slate-400 transition-colors hover:text-slate-200 active:scale-95"
        >
          <Key className="size-4" />
          <span>Profiles</span>
        </button>

        {/* Chat / Messages View */}
        <button
          type="button"
          onClick={onShowChat}
          className={cn(
            "flex flex-col items-center gap-1 py-1 text-[10px] transition-colors active:scale-95",
            showMessenger
              ? "text-blue-400 font-semibold"
              : "text-slate-400 hover:text-slate-200",
          )}
        >
          <MessageCircle className="size-4" />
          <span>Chat</span>
        </button>

        {/* Contacts Sheet */}
        <button
          type="button"
          onClick={onOpenContacts}
          className="flex flex-col items-center gap-1 py-1 text-[10px] text-slate-400 transition-colors hover:text-slate-200 active:scale-95"
        >
          <UserPlus className="size-4" />
          <span>Contacts</span>
        </button>

        {/* Security / Vault View */}
        <button
          type="button"
          onClick={onShowSecurity}
          className={cn(
            "flex flex-col items-center gap-1 py-1 text-[10px] transition-colors active:scale-95",
            !showMessenger
              ? "text-red-400 font-semibold"
              : "text-slate-400 hover:text-slate-200",
          )}
        >
          <Shield className="size-4" />
          <span>Security</span>
        </button>
      </div>
    </nav>
  );
}
