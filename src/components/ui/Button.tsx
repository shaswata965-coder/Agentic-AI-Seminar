import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { withBase } from "@/lib/paths";

type Variant = "primary" | "secondary" | "soft" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

// Micro-interactions (see app/micro.css): lift on hover, dip on press, ink
// ripple (data-ripple), sheen on primary buttons and nudging icons.
const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[translate,scale,background-color,box-shadow,color,border-color,opacity] duration-200 ease-out active:scale-[0.96] disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "btn-shine bg-brand text-brand-fg shadow-[0_10px_28px_-12px_color-mix(in_oklab,var(--brand)_80%,transparent)] hover:-translate-y-0.5 hover:bg-brand-strong hover:shadow-[0_16px_34px_-12px_color-mix(in_oklab,var(--brand)_85%,transparent)]",
  secondary: "bg-fg text-bg hover:-translate-y-0.5 hover:opacity-90",
  soft: "bg-accent-soft text-accent-ink ring-1 ring-inset ring-[color-mix(in_oklab,var(--accent)_45%,transparent)] hover:-translate-y-0.5 hover:bg-[color-mix(in_oklab,var(--accent)_28%,var(--accent-soft))]",
  outline: "border border-border-strong bg-surface text-fg hover:-translate-y-0.5 hover:border-brand hover:text-brand hover:shadow-card",
  ghost: "text-fg hover:bg-surface-2",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

function ButtonContent({ icon, iconRight, children }: Pick<CommonProps, "icon" | "iconRight" | "children">) {
  return (
    <>
      {icon ? <span className="btn-ico-l">{icon}</span> : null}
      {children}
      {iconRight ? <span className="btn-ico-r">{iconRight}</span> : null}
    </>
  );
}

type LinkButtonProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> & { href: string; external?: boolean };

/** Button-styled link. Internal paths use next/link (base-path aware). */
export function ButtonLink({ href, external, variant, size, icon, iconRight, className, children, ...rest }: LinkButtonProps) {
  const cls = buttonClasses(variant, size, className);
  const isExternal = external ?? /^(https?:|mailto:|tel:)/.test(href);
  if (isExternal || rest.download !== undefined) {
    return (
      <a
        href={isExternal ? href : withBase(href)}
        className={cls}
        data-ripple=""
        {...(isExternal && !href.startsWith("mailto:") && !href.startsWith("tel:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        <ButtonContent icon={icon} iconRight={iconRight}>
          {children}
        </ButtonContent>
      </a>
    );
  }
  return (
    <Link href={href} className={cls} data-ripple="" {...rest}>
      <ButtonContent icon={icon} iconRight={iconRight}>
        {children}
      </ButtonContent>
    </Link>
  );
}

type ButtonProps = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export function Button({ variant, size, icon, iconRight, className, children, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} data-ripple="" {...rest}>
      <ButtonContent icon={icon} iconRight={iconRight}>
        {children}
      </ButtonContent>
    </button>
  );
}
