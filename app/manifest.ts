import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "nicogpg",
    short_name: "nicogpg",
    description:
      "Encrypted OpenPGP key vault. Unlock keys in the browser to encrypt, decrypt, and sign without sending your passphrase to the server.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#020617",
    theme_color: "#020617",
    categories: ["utilities", "security"],
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
