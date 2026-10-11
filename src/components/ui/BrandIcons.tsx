import type { SVGProps } from "react";

/* Simple brand glyphs (lucide-react v1 no longer ships brand icons). */
type P = SVGProps<SVGSVGElement> & { size?: number };
const svg = (size = 18, rest: SVGProps<SVGSVGElement>) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
  focusable: false,
  ...rest,
});

export function LinkedInIcon({ size, ...rest }: P) {
  return (
    <svg {...svg(size, rest)}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.6h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.62 4.77 6.03v5.42h-4v-4.8c0-1.15-.02-2.62-1.6-2.62-1.6 0-1.84 1.25-1.84 2.54v4.88h-4v-11Z" />
    </svg>
  );
}
export function XIcon({ size, ...rest }: P) {
  return (
    <svg {...svg(size, rest)}>
      <path d="M17.75 3h3.07l-6.7 7.62L22 21h-6.17l-4.83-6.3L5.45 21H2.37l7.17-8.15L2 3h6.33l4.36 5.77L17.75 3Zm-1.08 16.2h1.7L7.4 4.7H5.57l11.1 14.5Z" />
    </svg>
  );
}
export function GitHubIcon({ size, ...rest }: P) {
  return (
    <svg {...svg(size, rest)}>
      <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.37.81 1.1.81 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 12 .3Z" />
    </svg>
  );
}
export function YouTubeIcon({ size, ...rest }: P) {
  return (
    <svg {...svg(size, rest)}>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
    </svg>
  );
}
export function InstagramIcon({ size, ...rest }: P) {
  return (
    <svg {...svg(size, { ...rest, fill: "none", stroke: "currentColor", strokeWidth: 2 })}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function WhatsAppIcon({ size, ...rest }: P) {
  return (
    <svg {...svg(size, rest)}>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.2-.3-.3-.6-.4Z" />
    </svg>
  );
}
export function FacebookIcon({ size, ...rest }: P) {
  return (
    <svg {...svg(size, rest)}>
      <path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12Z" />
    </svg>
  );
}
