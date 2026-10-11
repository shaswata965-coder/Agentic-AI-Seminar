import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { withBase } from "@/lib/paths";

type Variant = "primary" | "secondary" | "soft" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[transform,background-color,box-shadow,color,border-color] duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-brand-fg shadow-[0_10px_28px_-12px_color-mix(in_oklab,var(--brand)_80%,transparent)] hover:-translate-y-0.5 hover:bg-brand-strong",
  secondary: "bg-fg text-bg hover:-translate-y-0.5 hover:opacity-90",
  soft: "bg-accent-soft text-accent-ink ring-1 ring-inset ring-[color-mix(in_oklab,var(--accent)_45%,transparent)] hover:-translate-y-0.5 hover:bg-[color-mix(in_oklab,var(--accent)_28%,var(--accent-soft))]",
  outline: "border border-border-strong bg-surface text-fg hover:-translate-y-0.5 hover:border-brand hover:text-brand",
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
        {...(isExternal && !href.startsWith("mailto:") && !href.startsWith("tel:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {icon}
        {children}
        {iconRight}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}

type ButtonProps = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export function Button({ variant, size, icon, iconRight, className, children, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...rest}>
      {icon}
      {children}
      {iconRight}
    </button>
  );
}
