import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { getSettings } from "@/lib/content/queries";
import { formatDateRange } from "@/lib/format";
import { BASE_PATH, SITE_ORIGIN, withBase } from "@/lib/paths";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = `${s.eventName} · IIT Delhi`;
  const description = s.description || s.tagline;
  return {
    metadataBase: new URL(`${SITE_ORIGIN}${BASE_PATH}/`),
    title: { default: title, template: `%s · ${s.eventName}` },
    description,
    keywords: s.keywords,
    applicationName: s.eventName,
    authors: [{ name: "IIT Delhi & Yardi School of Artificial Intelligence" }],
    openGraph: {
      type: "website",
      siteName: s.eventName,
      title,
      description,
      locale: "en_IN",
      ...(s.ogImage ? { images: [{ url: withBase(s.ogImage), width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: `${formatDateRange(s.startDate, s.endDate)} · ${s.venueName}`,
      ...(s.ogImage ? { images: [withBase(s.ogImage)] } : {}),
    },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1e" },
  ],
  colorScheme: "light dark",
};

/** Optional brand colour from Admin → Settings → Branding, validated to a hex value. */
function brandStyle(hex: string) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return null;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const fg = lum > 0.35 ? "#0f172a" : "#ffffff";
  return `:root{--brand:${hex};--brand-strong:color-mix(in oklab,${hex} 82%,black);--brand-fg:${fg};--brand-soft:color-mix(in oklab,${hex} 10%,white);--ring:${hex}}.dark{--brand:color-mix(in oklab,${hex} 55%,white);--brand-strong:color-mix(in oklab,${hex} 35%,white);--brand-fg:#0a0f1e;--brand-soft:color-mix(in oklab,${hex} 22%,#0a0f1e);--ring:color-mix(in oklab,${hex} 55%,white)}`;
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const s = await getSettings();
  const gaId = /^G-[A-Z0-9]{4,}$/.test(s.gaId) ? s.gaId : /^G-[A-Z0-9]{4,}$/.test(process.env.NEXT_PUBLIC_GA_ID ?? "") ? process.env.NEXT_PUBLIC_GA_ID : "";
  const brandCss = brandStyle(s.brandColor);
  return (
    <html lang="en-IN" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <head>{brandCss ? <style id="brand-colour">{brandCss}</style> : null}</head>
      <body className="min-h-dvh antialiased">
        <ThemeProvider>{children}</ThemeProvider>
        {gaId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
