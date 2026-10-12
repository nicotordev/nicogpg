import type { Metadata } from "next";
import { getSessionAction } from "../actions/auth.actions";
import { redirectToSignIn } from "../actions/redirect.actions";
import { NetflixGpgSelector } from "@/components/gpg/netflix-gpg-selector";

export const metadata: Metadata = {
  title: "Key profile",
  description:
    "Review the selected OpenPGP key, unlock it in the browser, and manage contacts, encrypted messages, and signatures.",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const session = await getSessionAction();
  if (!session) redirectToSignIn();

  const params = await searchParams;

  return (
    <div className="min-h-screen w-full bg-slate-950">
      <NetflixGpgSelector
        key={`profile-${params.key ?? "primary"}`}
        initialSession={session}
        pageMode="profile"
        profileKeyId={params.key}
      />
    </div>
  );
}
