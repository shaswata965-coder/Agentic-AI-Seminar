import { Mail, Phone } from "lucide-react";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { SocialLinks } from "@/components/layout/SiteFooter";
import { Section, SectionHeading } from "@/components/ui/Section";
import type { Faq, SiteSettings } from "@/lib/content/types";
import { copy } from "@/lib/copy";
import { FaqList } from "./FaqList";

export function FaqContact({ s, faqs }: { s: SiteSettings; faqs: Faq[] }) {
  const c = copy(s, "homeFaq");
  return (
    <Section id="faq" edit="home.faq" tone={c.tone} bg={c.background} labelledBy="faq-title" tags="underline">
      <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <SectionHeading id="faq-title" eyebrow={c.eyebrow} title={c.title} description={c.description} className="mb-8 sm:mb-8" />
          <FaqList faqs={faqs} />
        </div>
        <div id="contact" className="scroll-mt-24">
          <div className={`tone-${c.contactTone} card sticky top-24 p-6 sm:p-8`}>
            <h2 className="font-display text-2xl font-bold text-fg sm:text-3xl">{c.contactTitle}</h2>
            <ul className="mt-4 space-y-2 text-[15px]">
              <li className="flex items-center gap-2.5">
                <Mail size={18} aria-hidden className="text-accent-ink" />
                {s.contactEmail ? (
                  <a className="font-semibold text-fg hover:text-brand" href={`mailto:${s.contactEmail}`}>
                    {s.contactEmail}
                  </a>
                ) : (
                  <span className="text-muted">{c.noEmail}</span>
                )}
              </li>
              {s.contactPhone ? (
                <li className="flex items-center gap-2.5">
                  <Phone size={18} aria-hidden className="text-accent-ink" />
                  <a className="font-semibold text-fg hover:text-brand" href={`tel:${s.contactPhone.replace(/\s+/g, "")}`}>
                    {s.contactPhone}
                  </a>
                </li>
              ) : null}
            </ul>
            <SocialLinks s={s} className="mt-4 flex gap-2" />
            <div className="mt-6 border-t border-border pt-6">
              <EnquiryForm type="contact" />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
