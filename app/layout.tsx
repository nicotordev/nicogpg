import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, DM_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";

const outfitHeading = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
});

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

const appTitle = "OpenPGP key vault";
const appDescription =
  "nicogpg stores encrypted OpenPGP key profiles. Your passphrase never leaves the browser, where you unlock a key to encrypt, decrypt, and sign.";

function metadataBaseUrl(): URL {
  const raw = process.env.BETTER_AUTH_URL;
  if (raw) {
    try {
      return new URL(raw);
    } catch {
      return new URL("http://localhost:3000");
    }
  }
  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl(),
  title: {
    default: appTitle,
    template: "%s · nicogpg",
  },
  description: appDescription,
  applicationName: "nicogpg",
  authors: [{ name: "nicogpg" }],
  creator: "nicogpg",
  keywords: ["OpenPGP", "GPG", "zero-knowledge", "encryption", "nicogpg"],
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml", sizes: "any" }],
    apple: [{ url: "/logo.svg", type: "image/svg+xml", sizes: "any" }],
    shortcut: ["/logo.svg"],
  },
  openGraph: {
    type: "website",
    siteName: "nicogpg",
    images: [
      {
        url: "/logo.svg",
        width: 1500,
        height: 1500,
        alt: "nicogpg",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary",
    images: ["/logo.svg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "nicogpg",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        dmSans.variable,
        outfitHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <TooltipProvider>{children}</TooltipProvider>
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
