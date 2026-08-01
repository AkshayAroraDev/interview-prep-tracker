import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 44,
          background: "linear-gradient(135deg, rgba(124, 58, 237, 1) 0%, rgba(37, 99, 235, 1) 100%)",
          boxShadow:
            "0 0 0 3px rgba(124, 58, 237, 0.16), 0 18px 48px -26px rgba(37, 99, 235, 0.8)",
        }}
      >
        <svg
          width="94"
          height="94"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.85"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 5.75A2.75 2.75 0 0 1 5.75 3h8.5A2.75 2.75 0 0 1 17 5.75v12.5A2.75 2.75 0 0 1 14.25 21h-8.5A2.75 2.75 0 0 1 3 18.25Z" />
          <path d="M17 6.5h2a2 2 0 0 1 2 2v9.75A2.75 2.75 0 0 1 18.25 21H17" />
          <path d="M8 8.5h4.5" />
          <path d="M8 12h5.5" />
          <path d="m8 16.3 3.7-3.7 1.9 1.9-3.7 3.7-2.4.5z" />
        </svg>
      </div>
    ),
    {
      ...size,
    },
  );
}