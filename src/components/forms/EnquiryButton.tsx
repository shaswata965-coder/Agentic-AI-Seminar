"use client";

import { useId, useState, type ReactNode } from "react";
import { Aura } from "@/components/aura/Aura";
import type { AuraVariant } from "@/components/aura/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { EnquiryType } from "@/lib/content/constants";
import type { FormField } from "@/lib/forms";
import { EnquiryForm, type EnquiryText } from "./EnquiryForm";

/** A button that opens the enquiry form in a dialog (Exhibit with us / Become a partner). */
export function EnquiryButton({
  type,
  fields,
  text,
  label,
  title,
  description,
  aura = "contact",
  variant = "primary",
  icon,
}: {
  type: EnquiryType;
  fields: FormField[];
  text: EnquiryText;
  label: string;
  title: string;
  description?: string;
  aura?: AuraVariant;
  variant?: "primary" | "soft" | "outline";
  icon?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)} icon={icon}>
        {label}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} labelledBy={titleId}>
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <Aura variant={aura} size={84} lite />
            <div>
              <h2 id={titleId} className="font-display text-2xl font-bold text-fg">
                {title}
              </h2>
              {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
            </div>
          </div>
          <div className="mt-6">
            <EnquiryForm type={type} fields={fields} text={text} onDone={() => setOpen(false)} />
          </div>
        </div>
      </Modal>
    </>
  );
}
