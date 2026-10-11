import { AuraAssistant } from "@/components/aura/AuraAssistant";
import { BackToTop } from "@/components/effects/BackToTop";
import { SiteBanner } from "@/components/layout/SiteBanner";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ToastProvider } from "@/components/ui/Toast";
import { getSettings } from "@/lib/content/queries";
import { buildAssistantIndex } from "@/lib/content/search";
import { brandName, hackathonRegistrationHref, registrationHref, venueLine } from "@/lib/event";
import { formatDateRange } from "@/lib/format";
import { postEventNav } from "@/lib/nav";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const s = await getSettings();
  const index = s.showAssistant ? await buildAssistantIndex() : [];
  return (
    <ToastProvider>
      <a
        href="#main"
        className="sr-only z-[70] rounded-full bg-brand px-4 py-2 font-semibold text-brand-fg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      {s.bannerText ? <SiteBanner text={s.bannerText} link={s.bannerLink} /> : null}
      <SiteHeader brand={brandName(s)} logos={{ iitd: s.logoIITD, scai: s.logoScAI }} registerHref={registrationHref(s)} extraNav={postEventNav(s)} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter s={s} />
      {s.showAssistant ? (
        <AuraAssistant
          entries={index}
          facts={{
            eventName: s.eventName,
            dates: formatDateRange(s.startDate, s.endDate),
            venue: venueLine(s),
            registerHref: registrationHref(s),
            hackathonHref: hackathonRegistrationHref(s),
          }}
        />
      ) : null}
      <BackToTop />
    </ToastProvider>
  );
}
