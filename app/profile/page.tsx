import type { Metadata } from "next";
import { getSessionAction } from "../actions/auth.actions";
import { redirectToSignIn } from "../actions/redirect.actions";
import { getGpgKeysAction, getGpgKeyByIdAction } from "../actions/gpg.actions";
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

  const [initialData, selectedKeyFromParam] = await Promise.all([
    getGpgKeysAction({ limit: 8 }),
    params.key ? getGpgKeyByIdAction(params.key) : Promise.resolve(null),
  ]);

  const initialSelectedKey = params.key
    ? (initialData.keys.find((k) => k.id === params.key) ?? selectedKeyFromParam)
    : (initialData.keys[0] ?? null);

  return (
    <div className="min-h-screen w-full bg-slate-950">
      <NetflixGpgSelector
        key={`profile-${params.key ?? "primary"}`}
        initialSession={session}
        pageMode="profile"
        profileKeyId={params.key}
        initialKeys={initialData.keys}
        initialNextCursor={initialData.nextCursor}
        initialSelectedKey={initialSelectedKey}
      />
    </div>
  );
}
