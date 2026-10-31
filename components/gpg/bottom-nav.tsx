import Link from "next/link";
import { usePathname } from "next/navigation";
import { Key, MessageCircle, UserPlus, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  docked?: boolean;
  onLeaveProfile: () => void;
}

export function BottomNav({ docked = false, onLeaveProfile }: BottomNavProps) {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Profiles", icon: Key, active: pathname === "/" },
    {
      href: "/chat",
      label: "Chat",
      icon: MessageCircle,
      active: pathname.startsWith("/chat"),
    },
    {
      href: "/contacts",
      label: "Contacts",
      icon: UserPlus,
      active: pathname.startsWith("/contacts"),
    },
    {
      href: "/profile",
      label: "Profile",
      icon: Shield,
      active: pathname.startsWith("/profile"),
    },
  ] as const;

  return (
    <nav
      className={cn(
        "z-30 border-t border-white/8 bg-[#080d1c]/95 px-4 py-2 backdrop-blur-xl pb-[max(0.5rem,env(safe-area-inset-bottom))]",
        docked ? "relative shrink-0" : "fixed inset-x-0 bottom-0",
      )}
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={
                item.href === "/"
                  ? (event) => {
                      event.preventDefault();
                      onLeaveProfile();
                    }
                  : undefined
              }
              className={cn(
                "flex flex-col items-center gap-1 py-1 text-[10px] transition-colors active:scale-95",
                item.active
                  ? "font-semibold text-red-400"
                  : "text-slate-400 hover:text-slate-200",
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
