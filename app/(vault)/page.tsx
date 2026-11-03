import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Choose a key · NicoPGP" },
  description:
    "Choose an OpenPGP profile or import a key block or file. Open it to encrypt, decrypt, and sign while the passphrase stays in your browser.",
};

export const dynamic = "force-dynamic";

export default function ProfilesPage() {
  return null;
}
