/*
 * Whether the home page's launch intro (LaunchIntro.tsx) plays is decided before anything is drawn,
 * by a small inline script in the root layout's <head>: it marks <html data-launch="run">, which shows
 * the intro's overlay from the very first paint and holds the hero Aura's fly-in until the smoke
 * clears. Next.js runs `beforeInteractive` scripts only once its own code has loaded, which is too
 * late for that, hence a plain <script>.
 *
 * The intro plays on the home page only, once per browser tab (sessionStorage), never inside a frame
 * (the admin's live preview), never when the address points at a section (#faq) and never for visitors
 * who ask for reduced motion. Without JavaScript nothing is marked and the overlay stays hidden.
 */

/** sessionStorage key, set once the intro has lifted off or been skipped. */
export const LAUNCH_KEY = "aaiw-launched";

/** The inline script for the root layout's <head>. `basePath` is the sub-path the site is served from, or "". */
export function launchFlagScript(basePath: string) {
  const js = (v: string) => JSON.stringify(v).replace(/</g, "\\u003c");
  return (
    `try{var d=document.documentElement;` +
    `if(location.pathname.replace(/\\/+$/,"")===${js(basePath)}&&!location.hash&&window.top===window` +
    `&&!sessionStorage.getItem(${js(LAUNCH_KEY)})&&!matchMedia("(prefers-reduced-motion: reduce)").matches)` +
    `d.dataset.launch="run"}catch(e){}`
  );
}
