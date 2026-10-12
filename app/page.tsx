import type { Metadata } from "next";
import { getSessionAction } from "./actions/auth.actions";
import { redirectToSignIn } from "./actions/redirect.actions";
import { NetflixGpgSelector } from "@/components/gpg/netflix-gpg-selector";

export const metadata: Metadata = {
  title: { absolute: "Choose a key · nicogpg" },
  description:
    "Choose an OpenPGP profile or import a key block or file. Open it to encrypt, decrypt, and sign while the passphrase stays in your browser.",
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
