import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Convention Next.js : OG image servie automatiquement pour les liens
// partagés (Discord, X, WhatsApp, LinkedIn, Slack…). 1200×630 standard.
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "GameFolio — Le casino TCG en monnaie fictive";

async function loadAsset(filename: string): Promise<string | null> {
  try {
    const buf = await readFile(join(process.cwd(), "public", filename));
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const [mark, wordmark] = await Promise.all([
    loadAsset("logo-mark.png"),
    loadAsset("logo-wordmark.png"),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        background:
          "radial-gradient(circle at 80% 70%, rgba(42,125,255,0.30), #0A0E14 55%), linear-gradient(180deg, #0A0E14, #0A0E14)",
      }}
    >
      {/* LEFT — wordmark + tagline */}
      <div
        style={{
          width: 720,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
          padding: "0 0 0 80px",
        }}
      >
        {wordmark ? (
          <img src={wordmark} height={86} alt="" />
        ) : (
          <div
            style={{
              display: "flex",
              color: "white",
              fontSize: 80,
              fontWeight: 900,
              letterSpacing: -2,
            }}
          >
            GameFolio
          </div>
        )}
        <div
          style={{
            display: "flex",
            color: "#F2F4F8",
            fontSize: 38,
            fontWeight: 700,
            lineHeight: 1.15,
            maxWidth: 580,
          }}
        >
          Le casino TCG en monnaie fictive.
        </div>
        <div
          style={{
            display: "flex",
            color: "#9CA1B0",
            fontSize: 22,
          }}
        >
          $10 offerts · 100% monnaie fictive · 18+
        </div>
      </div>

      {/* RIGHT — prism */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {mark ? (
          <img src={mark} width={440} height={440} alt="" />
        ) : null}
      </div>
    </div>,
    size,
  );
}
