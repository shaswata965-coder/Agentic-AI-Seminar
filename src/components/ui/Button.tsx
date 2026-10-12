import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { withBase } from "@/lib/paths";

type Variant = "primary" | "secondary" | "soft" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

// Keycap buttons (see .key in app/micro.css): rounded rectangles on a solid edge that rise on
// hover and press down while held; plus the ink ripple (data-ripple), a sheen on primary buttons
// and nudging icons. Links to other pages in a section use <Portal> instead (components/ui/Portal.tsx).
const base =
  "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap transition-[translate,box-shadow,background-color,color,border-color,opacity] duration-150 ease-out disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "key key-brand btn-shine bg-brand text-brand-fg hover:bg-brand-strong",
  secondary: "key key-ink bg-fg text-bg hover:opacity-90",
  soft: "key key-accent border border-[color-mix(in_oklab,var(--accent)_55%,transparent)] bg-accent-soft text-accent-ink hover:bg-[color-mix(in_oklab,var(--accent)_28%,var(--accent-soft))]",
  outline: "key key-line border border-border-strong bg-surface text-fg hover:border-brand hover:text-brand",
  ghost: "text-fg hover:bg-surface-2",
};

const sizes: Record<Size, string> = {
  sm: "h-9 rounded-[0.7rem] px-3.5 text-sm",
  md: "h-11 rounded-[0.85rem] px-5 text-[15px]",
  lg: "h-13 rounded-[1rem] px-6 text-base",
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
