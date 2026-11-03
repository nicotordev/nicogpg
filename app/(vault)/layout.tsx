import { Suspense, type ReactNode } from "react";
import { getSessionAction } from "@/app/actions/auth.actions";
import { getPgpKeysAction } from "@/app/actions/pgp.actions";
import { redirectToSignIn } from "@/app/actions/redirect.actions";
import { NetflixPgpSelector } from "@/components/pgp/netflix-pgp-selector";
import { VaultLoading } from "@/components/pgp/vault-loading";

export default async function VaultLayout({ children }: { children: ReactNode }) {
  const session = await getSessionAction();
  if (!session) redirectToSignIn();

  const initialData = await getPgpKeysAction({ limit: 8 });

  return (
    <Suspense fallback={<VaultLoading />}>
      <NetflixPgpSelector
        initialSession={session}
        initialKeys={initialData.keys}
        initialNextCursor={initialData.nextCursor}
      >
        {children}
      </NetflixPgpSelector>
    </Suspense>
  );
}
