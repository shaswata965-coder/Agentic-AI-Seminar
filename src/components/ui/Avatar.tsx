/* eslint-disable @next/next/no-img-element -- CMS uploads are already compressed WebP; plain <img> keeps base-path handling simple */
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";
import { withBase } from "@/lib/paths";

const GRADIENTS: [string, string][] = [
  ["#c3b1ff", "#8cc8ff"],
  ["#ffa9c1", "#ffbf99"],
  ["#8fe0c0", "#8cc8ff"],
  ["#ffdc73", "#ffbf99"],
  ["#67e3f9", "#c3b1ff"],
  ["#ffbf99", "#ffa9c1"],
  ["#b9e4a8", "#67e3f9"],
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function Avatar({
  name,
  src,
  size = 96,
  className,
  square = false,
}: {
  name: string;
  src?: string;
  size?: number;
  className?: string;
  square?: boolean;
}) {
  const shape = square ? "rounded-[28%]" : "rounded-full";
  if (src) {
    return (
      <img
        src={withBase(src)}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className={cn(shape, "shrink-0 bg-surface-2 object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  const [a, b] = GRADIENTS[hash(name) % GRADIENTS.length];
  return (
    <div
      aria-hidden
      className={cn(shape, "grid shrink-0 place-items-center font-display font-bold text-[#1e293b] select-none", className)}
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${a}, ${b})`, fontSize: Math.round(size * 0.34) }}
    >
      {initials(name) || "?"}
    </div>
  );
}
