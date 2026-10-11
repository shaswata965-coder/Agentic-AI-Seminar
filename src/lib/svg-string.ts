import { isValidElement, type ReactElement, type ReactNode } from "react";

/*
 * Minimal React-element → SVG string serializer for static artwork (used to
 * embed Aura in generated OG images and icons without react-dom/server).
 */

const KEBAB = new Set([
  "strokeWidth", "strokeLinecap", "strokeLinejoin", "strokeDasharray", "strokeOpacity", "fillOpacity", "stopColor", "stopOpacity",
  "clipPath", "fontSize", "fontWeight", "fontFamily", "textAnchor", "dominantBaseline",
]);
const SKIP = new Set(["children", "key", "ref"]);

const escAttr = (v: string) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const escText = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function styleString(style: Record<string, unknown>) {
  return Object.entries(style)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k.startsWith("--") ? k : k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}:${String(v)}`)
    .join(";");
}

export function toSvgString(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return escText(String(node));
  if (Array.isArray(node)) return node.map(toSvgString).join("");
  if (!isValidElement(node)) return "";
  const el = node as ReactElement<Record<string, unknown>>;
  if (typeof el.type === "function") {
    return toSvgString((el.type as (p: Record<string, unknown>) => ReactNode)(el.props));
  }
  if (typeof el.type !== "string") {
    // Fragment and other exotic types: render children only.
    return toSvgString(el.props.children as ReactNode);
  }
  const attrs = Object.entries(el.props)
    .filter(([k, v]) => !SKIP.has(k) && v !== undefined && v !== null && v !== false && typeof v !== "function")
    .map(([k, v]) => {
      const name = k === "className" ? "class" : KEBAB.has(k) ? k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`) : k;
      const value = k === "style" && typeof v === "object" ? styleString(v as Record<string, unknown>) : String(v);
      return ` ${name}="${escAttr(value)}"`;
    })
    .join("");
  return `<${el.type}${attrs}>${toSvgString(el.props.children as ReactNode)}</${el.type}>`;
}

export function svgDataUri(svg: string) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
