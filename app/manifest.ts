import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "nicogpg - Zero-Knowledge OpenPGP Vault",
    short_name: "nicogpg",
    description:
      "Zero-Knowledge OpenPGP Identity Selector and Secure Messaging Workspace",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#020617",
    theme_color: "#020617",
    categories: ["utilities", "security"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
