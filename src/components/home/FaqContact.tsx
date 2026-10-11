import { Mail, Phone } from "lucide-react";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { SocialLinks } from "@/components/layout/SiteFooter";
import { Section, SectionHeading } from "@/components/ui/Section";
import type { Faq, SiteSettings } from "@/lib/content/types";
import { FaqList } from "./FaqList";

export function FaqContact({ s, faqs }: { s: SiteSettings; faqs: Faq[] }) {
  return (
    <Section id="faq" tone="lilac" labelledBy="faq-title" wash>
      <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <SectionHeading id="faq-title" eyebrow="FAQ" title="Questions, answered" description="Can't find what you're looking for? Send us a message." className="mb-8 sm:mb-8" />
          <FaqList faqs={faqs} />
        </div>
        <div id="contact" className="scroll-mt-24">
          <div className="tone-blush card sticky top-24 p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold text-fg sm:text-3xl">Contact the organisers</h2>
            <ul className="mt-4 space-y-2 text-[15px]">
              <li className="flex items-center gap-2.5">
                <Mail size={18} aria-hidden className="text-accent-ink" />
                {s.contactEmail ? (
                  <a className="font-semibold text-fg hover:text-brand" href={`mailto:${s.contactEmail}`}>
                    {s.contactEmail}
                  </a>
                ) : (
                  <span className="text-muted">Official e-mail address coming soon — use the form below.</span>
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
