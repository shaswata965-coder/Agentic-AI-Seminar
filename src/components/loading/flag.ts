/*
 * Whether the home page's loading screen (LoadingScreen.tsx) shows is decided before anything is drawn,
 * by a small inline script in the root layout's <head>. Next.js runs `beforeInteractive` scripts only
 * once its own code has loaded, which is too late, hence a plain <script>.
 *
 * The script names this build by hashing the home page's own script and stylesheet URLs (they carry
 * content hashes and come before it in <head>), and compares that with the version this browser last
 * cached (localStorage). When they differ, the site's files still need caching, and it marks <html>:
 *   data-launch="run"    the loading screen covers the page from the first paint while they are cached;
 *   data-launch="quiet"  they are cached in the background with no screen (the address points at a
 *                        section such as #faq, or the visitor asks for reduced motion).
 * Nothing is marked inside a frame (the admin's live preview), on other pages, when the visitor has
 * asked to save data, or without JavaScript. The overlay stays hidden unless "run" is set.
 */

/** localStorage key holding the version of the files last cached in full. */
export const ASSETS_KEY = "aaiw-assets";

/** The inline script for the root layout's <head>. `basePath` is the sub-path the site is served from, or "". */
export function launchFlagScript(basePath: string) {
  const js = (v: string) => JSON.stringify(v).replace(/</g, "\\u003c");
  return (
    `try{var d=document.documentElement,c=navigator.connection;` +
    `if(location.pathname.replace(/\\/+$/,"")===${js(basePath)}&&window.top===window&&!(c&&c.saveData)){` +
    `var l=document.querySelectorAll('script[src*="/_next/static/"],link[rel=stylesheet][href*="/_next/static/"]'),v="",h=5381,i;` +
    `for(i=0;i<l.length;i++)v+=l[i].getAttribute("src")||l[i].getAttribute("href");` +
    `for(i=0;i<v.length;i++)h=(h*33^v.charCodeAt(i))>>>0;` +
    `d.dataset.assets=v=h.toString(36);` +
    `if(localStorage.getItem(${js(ASSETS_KEY)})!==v)` +
    `d.dataset.launch=!location.hash&&!matchMedia("(prefers-reduced-motion: reduce)").matches?"run":"quiet"}}catch(e){}`
  );
}
