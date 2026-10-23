import { AccountProvider } from "@/components/account/Account";
import { BackToTop } from "@/components/effects/BackToTop";
import { AuraBadgeByPage } from "@/components/layout/AuraBadgeByPage";
import { PreviewBridge } from "@/components/layout/PreviewBridge";
import { SiteBanner } from "@/components/layout/SiteBanner";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { VercelAnalytics } from "@/components/layout/VercelAnalytics";
import { ServiceWorker } from "@/components/loading/ServiceWorker";
import { ToastProvider } from "@/components/ui/Toast";
import { getSettings } from "@/lib/content/queries";
import { copy } from "@/lib/copy";
import { hackathonShown, registrationHref } from "@/lib/event";
import { postEventNav } from "@/lib/nav";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const s = await getSettings();
  return (
    <ToastProvider>
      {/* While the hackathon is hidden, the sign-in window doesn't mention hackathon teams. */}
      <AccountProvider text={{ ...copy(s, "siteAccount"), ...(hackathonShown(s) ? null : { whoHackathon: "" }) }}>
        <AuraBadgeByPage>
          <a
            href="#main"
            className="sr-only z-[70] rounded-lg bg-brand px-4 py-2 font-semibold text-brand-fg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            Skip to content
          </a>
          {s.bannerText ? <SiteBanner text={s.bannerText} link={s.bannerLink} tone={s.siteBanner.tone} /> : null}
          <SiteHeader logos={{ iitd: s.logoIITD, scai: s.logoScAI }} registerHref={registrationHref(s)} extraNav={postEventNav(s, s.siteNav)} nav={s.siteNav} text={s.siteHeader} homeHidden={s.homeHidden} hackathon={hackathonShown(s)} />
          <main id="main" tabIndex={-1} className="fit-screen outline-none">
            {children}
          </main>
          <SiteFooter s={s} />
          <BackToTop />
          <PreviewBridge />
          <ServiceWorker />
          {/* Vercel sets VERCEL=1 when it builds and runs the site; elsewhere there is nothing to report to. */}
          {process.env.VERCEL ? <VercelAnalytics /> : null}
        </AuraBadgeByPage>
      </AccountProvider>
    </ToastProvider>
  );
}
