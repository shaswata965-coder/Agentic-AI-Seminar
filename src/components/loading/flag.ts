/*
 * Whether the home page's loading screen (LoadingScreen.tsx) shows is decided before anything is drawn,
 * by a small inline script in the root layout's <head>. Next.js runs `beforeInteractive` scripts only
 * once its own code has loaded, which is too late, hence a plain <script>.
 *
 * The script names this build by hashing the home page's own script URLs (they carry content hashes and
 * come before it in <head>), and compares that with the version this browser last cached
 * (localStorage). When they differ, the site's files still need caching, and it marks <html>:
 *   data-launch="run"    the loading screen covers the page from the first paint while they load;
 *   data-launch="quiet"  they are cached in the background with no screen (the address points at a
 *                        section such as #faq, or the visitor asks for reduced motion).
 * Nothing is marked inside a frame (the admin's live preview), on other pages, when the visitor has
 * asked to save data, or without JavaScript. The overlay stays hidden unless "run" is set.
 *
 * With "run", the script also moves the progress ring from the start, before the site's own scripts
 * have arrived: every 150 ms it counts the page's scripts and images that have loaded and sets --lx-p
 * (0 to PAGE_SHARE) on the ring and the percentage (PROGRESS_TARGETS), which loading.css draws.
 * warm.ts carries on from there. (Set on <html>, it would restyle the whole page each time.)
 */

/** localStorage key holding the version of the files last cached in full. */
export const ASSETS_KEY = "aaiw-assets";

/** How far the ring gets while the page itself loads (warm.ts's first stage ends there). */
export const PAGE_SHARE = 0.25;

/** The elements that show the progress (--lx-p): the ring and the percentage. */
export const PROGRESS_TARGETS = ".lx-ring, .launch-percent";

/** The inline script for the root layout's <head>. `basePath` is the sub-path the site is served from, or "". */
export function launchFlagScript(basePath: string) {
  const js = (v: string) => JSON.stringify(v).replace(/</g, "\\u003c");
  return (
    `try{var d=document.documentElement,w=window,c=navigator.connection;` +
    `if(location.pathname.replace(/\\/+$/,"")===${js(basePath)}&&w.top===w&&!(c&&c.saveData)){` +
    `var l=document.querySelectorAll('script[src*="/_next/static/"],link[rel=stylesheet][href*="/_next/static/"]'),v="",h=5381,i;` +
    `for(i=0;i<l.length;i++)v+=l[i].getAttribute("src")||l[i].getAttribute("href");` +
    `for(i=0;i<v.length;i++)h=(h*33^v.charCodeAt(i))>>>0;` +
    `d.dataset.assets=v=h.toString(36);` +
    `if(localStorage.getItem(${js(ASSETS_KEY)})!==v){` +
    `d.dataset.launch=!location.hash&&!matchMedia("(prefers-reduced-motion: reduce)").matches?"run":"quiet";` +
    // Progress while the page loads, until warm.ts takes over (it sets __lxWarm), for 20 s at most.
    `if(d.dataset.launch==="run"){var n=0,t=setInterval(function(){` +
    `if(w.__lxWarm||++n>133)return clearInterval(t);` +
    `var u={},k=0,f=0;document.querySelectorAll("script[src],img[src]:not([loading=lazy])").forEach(function(e){if(!u[e.src]){u[e.src]=1;k++}});` +
    `performance.getEntriesByType("resource").forEach(function(r){if(u[r.name]===1){u[r.name]=2;f++}});` +
    `var p=k?${PAGE_SHARE * 0.96}*f/k:0,g=document.querySelectorAll(${js(PROGRESS_TARGETS)}),s;if(p>(w.__lxP||0))w.__lxP=p;` +
    // Only when the value (or the elements, once parsed) changed: each write restyles them.
    `s=(w.__lxP||0)+"/"+g.length;if(s!==w.__lxS){w.__lxS=s;g.forEach(function(e){e.style.setProperty("--lx-p",w.__lxP||0)})}},150)}}}}catch(e){}`
  );
}
