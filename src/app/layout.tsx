import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { MicroInteractions } from "@/components/effects/MicroInteractions";
import { launchFlagScript } from "@/components/loading/flag";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { getSettings } from "@/lib/content/queries";
import type { SiteSettings } from "@/lib/content/types";
import { formatDateRange } from "@/lib/format";
import { BASE_PATH, SITE_ORIGIN, withBase } from "@/lib/paths";

// Self-hosted variable fonts (latin), so builds don't depend on Google Fonts. See app/fonts/LICENSE.md.
// Not preloaded: Chrome holds the first paint until preloaded fonts arrive, which kept the home page's
// loading screen from showing at once. Text shows in the fallback font for a moment instead (display: swap).
const inter = localFont({ src: "./fonts/inter-latin-var.woff2", weight: "100 900", variable: "--font-inter", display: "swap", preload: false });
const outfit = localFont({ src: "./fonts/outfit-latin-var.woff2", weight: "100 900", variable: "--font-outfit", display: "swap", preload: false });

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

const HEX = /^#[0-9a-fA-F]{6}$/;

/**
 * Colours from Admin → Site settings → Site-wide → Colours, validated to hex values: the brand
 * colour, and any accent colours that replace the built-in shades. Their light tints and dark
 * inks (and dark-mode versions) are mixed from the chosen colour. `html` raises specificity so
 * these win over globals.css wherever this tag ends up.
 */
function themeStyle(s: SiteSettings) {
  const light: string[] = [];
  const dark: string[] = [];
  const hex = s.brandColor;
  if (HEX.test(hex)) {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const fg = lum > 0.35 ? "#0f172a" : "#ffffff";
    light.push(`--brand:${hex};--brand-strong:color-mix(in oklab,${hex} 82%,black);--brand-fg:${fg};--brand-soft:color-mix(in oklab,${hex} 10%,white);--ring:${hex}`);
    dark.push(`--brand:color-mix(in oklab,${hex} 55%,white);--brand-strong:color-mix(in oklab,${hex} 35%,white);--brand-fg:#0a0f1e;--brand-soft:color-mix(in oklab,${hex} 22%,#0a0f1e);--ring:color-mix(in oklab,${hex} 55%,white)`);
  }
  for (const [tone, c] of Object.entries(s.palette ?? {})) {
    if (!HEX.test(c)) continue;
    light.push(`--${tone}:${c};--${tone}-soft:color-mix(in oklab,${c} 20%,white);--${tone}-ink:color-mix(in oklab,${c} 38%,#0f172a)`);
    dark.push(`--${tone}:${c};--${tone}-soft:color-mix(in oklab,${c} 24%,#0a0f1e);--${tone}-ink:color-mix(in oklab,${c} 62%,white)`);
  }
  return light.length ? `html:root{${light.join(";")}}html.dark{${dark.join(";")}}` : null;
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const s = await getSettings();
  const gaId = /^G-[A-Z0-9]{4,}$/.test(s.gaId) ? s.gaId : /^G-[A-Z0-9]{4,}$/.test(process.env.NEXT_PUBLIC_GA_ID ?? "") ? process.env.NEXT_PUBLIC_GA_ID : "";
  const brandCss = themeStyle(s);
  return (
    <html lang="en-IN" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <head>
        {/* Lets CSS hide things that JS will animate in, so without JS nothing stays hidden. */}
        <Script id="js-flag" strategy="beforeInteractive">{`document.documentElement.classList.add("js")`}</Script>
        {/* Decides before the first paint whether the home page's loading screen shows (components/loading/flag.ts). */}
        {s.showLoader ? <script id="launch-flag" dangerouslySetInnerHTML={{ __html: launchFlagScript(BASE_PATH) }} /> : null}
        {brandCss ? <style id="brand-colour">{brandCss}</style> : null}
      </head>
      <body className="min-h-dvh antialiased">
        <ThemeProvider>{children}</ThemeProvider>
        <MicroInteractions />
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
