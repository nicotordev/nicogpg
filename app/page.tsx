import type { Metadata } from "next";
import { getSessionAction } from "./actions/auth.actions";
import { redirectToSignIn } from "./actions/redirect.actions";
import { NetflixGpgSelector } from "@/components/gpg/netflix-gpg-selector";

export const metadata: Metadata = {
  title: "nicogpg - Netflix-style GPG Identity Selector",
  description: "Secure, zero-knowledge OpenPGP key profile selector with infinite scroll.",
};

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const session = await getSessionAction();
  const params = await searchParams;

  if (!session) {
    redirectToSignIn();
  }

  return (
    <div className="min-h-screen w-full bg-slate-950">
      <NetflixGpgSelector
        key={params.key ?? "key-selector"}
        initialSession={session}
        profileKeyId={params.key}
      />
    </div>
  );
}
