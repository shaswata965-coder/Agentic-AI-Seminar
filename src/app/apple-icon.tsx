import { ImageResponse } from "next/og";
import { AuraArt } from "@/components/aura/AuraArt";
import { auraLook } from "@/components/aura/presets";
import { svgDataUri, toSvgString } from "@/lib/svg-string";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const look = auraLook("assistant");
  const aura = svgDataUri(toSvgString(<AuraArt uid="apple" palette="light" {...look} effects={[]} width={150} height={173} />));
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #eaf5ff, #f2eeff)" }}>
        <img src={aura} alt="" width={150} height={173} />
      </div>
    ),
    size,
  );
}
