import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { AuraArt } from "@/components/aura/AuraArt";
import { auraLook } from "@/components/aura/presets";
import { getSettings } from "@/lib/content/queries";
import { formatDateRange } from "@/lib/format";
import { svgDataUri, toSvgString } from "@/lib/svg-string";

export const alt = "Agentic AI Workshop 2026 — IIT Delhi & Yardi School of Artificial Intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Outfit (SIL Open Font License) — bundled so images render without network access.
const fonts = Promise.all([
  readFile(join(process.cwd(), "assets/fonts/outfit-latin-500-normal.woff")),
  readFile(join(process.cwd(), "assets/fonts/outfit-latin-800-normal.woff")),
]);

export default async function OpenGraphImage() {
  const [s, [regular, heavy]] = await Promise.all([getSettings(), fonts]);
  const look = auraLook("hero");
  const aura = svgDataUri(toSvgString(<AuraArt uid="og" palette="light" {...look} width={400} height={462} />));
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: "56px 64px",
          background: "linear-gradient(135deg, #eaf5ff 0%, #f2eeff 55%, #ffeef3 100%)",
          fontFamily: "Outfit",
          color: "#0f172a",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 700 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ display: "flex", padding: "10px 18px", borderRadius: 18, background: "rgba(255,255,255,0.85)", fontSize: 24, fontWeight: 700 }}>IIT Delhi</div>
            <div style={{ display: "flex", padding: "10px 18px", borderRadius: 18, background: "rgba(255,255,255,0.85)", fontSize: 24, fontWeight: 700 }}>Yardi ScAI</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#5b3cc4", letterSpacing: 2 }}>
              {`${formatDateRange(s.startDate, s.endDate)} · New Delhi`.toUpperCase()}
            </div>
            <div style={{ display: "flex", fontSize: 86, fontWeight: 800, lineHeight: 1.02, marginTop: 14 }}>{s.eventName}</div>
            <div style={{ display: "flex", fontSize: 30, color: "#475569", marginTop: 22, lineHeight: 1.3 }}>{s.tagline}</div>
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 24, color: "#334155" }}>
            {["Talks", "Panels", "Tutorials", "Demos", "Kiosks", "Hackathon"].map((t) => (
              <div key={t} style={{ display: "flex", padding: "8px 16px", borderRadius: 999, background: "rgba(255,255,255,0.7)" }}>
                {t}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
          <img src={aura} alt="" width={400} height={462} />
        </div>
        <div style={{ position: "absolute", left: 64, bottom: 18, display: "flex", fontSize: 18, color: "#64748b" }}>{formatDateRange(s.startDate, s.endDate)} · {s.venueName}</div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Outfit", data: regular, weight: 500, style: "normal" },
        { name: "Outfit", data: heavy, weight: 800, style: "normal" },
      ],
    },
  );
}
