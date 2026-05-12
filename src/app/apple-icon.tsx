import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Convention Next.js : icône iOS / Android home screen / install PWA.
// 180×180, fond plein (le système masque les coins).
export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

async function loadMark(): Promise<string | null> {
  try {
    const buf = await readFile(join(process.cwd(), "public/logo-mark.png"));
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function AppleIcon() {
  const mark = await loadMark();
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background:
          "radial-gradient(circle at 30% 25%, rgba(42,125,255,0.45), #0A0E14 70%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {mark ? (
        <img src={mark} width={150} height={150} alt="" />
      ) : (
        <div
          style={{
            width: 100,
            height: 100,
            background: "linear-gradient(135deg, #2A7DFF, #00D4FF)",
            borderRadius: 16,
          }}
        />
      )}
    </div>,
    size,
  );
}
