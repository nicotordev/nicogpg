import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Review the selected OpenPGP key, unlock it in the browser, and manage signatures.",
};

export const dynamic = "force-dynamic";

export default function ProfilePage() {
  return null;
}
