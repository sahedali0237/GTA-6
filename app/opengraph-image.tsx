import { ImageResponse } from "next/og";

// NOTE: Text + gradient only (no Rockstar artwork), per spec §3.
export const alt = "GTA6 AI — Ask Anything About GTA 6";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0b0b0f 0%, #1d1d27 55%, #0b0b0f 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            background:
              "radial-gradient(50% 45% at 50% 0%, rgba(255,94,156,0.35) 0%, rgba(255,94,156,0) 70%), radial-gradient(40% 35% at 75% 15%, rgba(255,159,67,0.28) 0%, rgba(255,159,67,0) 70%)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 132,
              fontWeight: 700,
              color: "#f2f2f5",
              letterSpacing: 4,
            }}
          >
            GTA6
          </div>
          <div
            style={{
              width: 8,
              height: 110,
              display: "flex",
              borderRadius: 4,
              background: "linear-gradient(180deg, #ff5e9c, #ff9f43)",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 132,
              fontWeight: 700,
              color: "#ff9f43",
              letterSpacing: 4,
            }}
          >
            AI
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 44,
            color: "#f2f2f5",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Ask Anything About GTA 6
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 16,
            fontSize: 26,
            color: "#9a9aa8",
          }}
        >
          Unofficial fan-made assistant
        </div>
      </div>
    ),
    size,
  );
}
