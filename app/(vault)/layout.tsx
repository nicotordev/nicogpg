import { Suspense, type ReactNode } from "react";
import { getSessionAction } from "@/app/actions/auth.actions";
import { getGpgKeysAction } from "@/app/actions/gpg.actions";
import { redirectToSignIn } from "@/app/actions/redirect.actions";
import { NetflixGpgSelector } from "@/components/gpg/netflix-gpg-selector";
import { VaultLoading } from "@/components/gpg/vault-loading";

export default async function VaultLayout({ children }: { children: ReactNode }) {
  const session = await getSessionAction();
  if (!session) redirectToSignIn();

  const initialData = await getGpgKeysAction({ limit: 8 });

  return (
    <Suspense fallback={<VaultLoading />}>
      <NetflixGpgSelector
        initialSession={session}
        initialKeys={initialData.keys}
        initialNextCursor={initialData.nextCursor}
      >
        {children}
      </NetflixGpgSelector>
    </Suspense>
  );
}
