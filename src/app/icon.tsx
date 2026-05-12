import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Convention Next.js : ce fichier devient le favicon servi à `/icon`.
// On lit le PNG du prisme depuis `public/logo-mark.png` au moment du
// rendu et on le pose sur un fond solide pour rester lisible dans
// l'onglet du navigateur (le fond transparent du PNG donnerait juste
// un halo flou à 32×32).
export const runtime = "nodejs";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

async function loadMark(): Promise<string | null> {
  try {
    const buf = await readFile(join(process.cwd(), "public/logo-mark.png"));
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Icon() {
  const mark = await loadMark();
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0A0E14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
      }}
    >
      {mark ? (
        <img src={mark} width={28} height={28} alt="" />
      ) : (
        <div
          style={{
            width: 22,
            height: 22,
            background: "linear-gradient(135deg, #2A7DFF, #00D4FF)",
            borderRadius: 4,
          }}
        />
      )}
    </div>,
    size,
  );
}
