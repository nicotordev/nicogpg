import type { Session } from "@/app/actions/auth.actions";

export const AVATAR_GRADIENTS: Record<string, string> = {
  red: "from-red-600 to-rose-900 text-white shadow-red-900/30",
  blue: "from-blue-600 to-indigo-900 text-white shadow-blue-900/30",
  purple: "from-purple-600 to-violet-900 text-white shadow-purple-900/30",
  amber: "from-amber-500 to-orange-800 text-white shadow-amber-900/30",
  emerald: "from-emerald-600 to-teal-900 text-white shadow-emerald-900/30",
  cyan: "from-cyan-500 to-blue-800 text-white shadow-cyan-900/30",
  pink: "from-pink-600 to-rose-950 text-white shadow-pink-900/30",
  indigo: "from-indigo-600 to-slate-900 text-white shadow-indigo-900/30",
};

export interface NetflixGpgSelectorProps {
  initialSession: Session | null;
  pageMode?: "dashboard" | "profile";
  profileKeyId?: string;
}

export interface Contact {
  id: string;
  name: string;
  fingerprint: string;
  publicKey: string;
}

export type DeleteRequest =
  | { type: "key"; id: string; name: string; step: 1 | 2 }
  | { type: "contact"; id: string; name: string; step: 1 }
  | null;
