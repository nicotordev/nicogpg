import type { Metadata } from "next";
import { getSessionAction } from "../actions/auth.actions";
import { redirectToSignIn } from "../actions/redirect.actions";
import { NetflixGpgSelector } from "@/components/gpg/netflix-gpg-selector";

export const metadata: Metadata = {
  title: "My GPG Profile - nicogpg",
  description: "Manage your OpenPGP profile and encrypted identity.",
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
    <main className="min-h-screen w-full bg-slate-950">
      <NetflixGpgSelector
        key={`profile-${params.key ?? "primary"}`}
        initialSession={session}
        pageMode="profile"
        profileKeyId={params.key}
      />
    </main>
  );
}
