import React from "react";

/**
 * Premium, minimal spiritual mark (SVG) that works in light/dark.
 * - Uses theme tokens (gold/emerald) via CSS variables.
 * - No external assets.
 */
export function Logo({ size = 72 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-2xl shadow-soft spiritual-border"
      style={{
        width: size,
        height: size,
        background:
          "linear-gradient(135deg, rgb(var(--gold) / 1), rgb(var(--emerald2) / 0.92), rgb(var(--gold2) / 0.98))",
      }}
      aria-label="Islam AI"
      title="Islam AI"
    >
      <svg
        width={Math.round(size * 0.78)}
        height={Math.round(size * 0.78)}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* outer halo */}
        <path
          d="M32 6C17.64 6 6 17.64 6 32s11.64 26 26 26 26-11.64 26-26S46.36 6 32 6Z"
          stroke="rgb(255 255 255 / 0.62)"
          strokeWidth="3"
        />
        {/* geometric rosette */}
        <path
          d="M32 14l6.8 8.2 10.5 1.1-6.6 8.6 2 10.4L32 38.8 19.3 42.3l2-10.4-6.6-8.6 10.5-1.1L32 14Z"
          fill="rgb(255 255 255 / 0.88)"
          stroke="rgb(0 0 0 / 0.18)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* inner light */}
        <circle cx="32" cy="32" r="7.5" fill="rgb(0 0 0 / 0.18)" />
        <circle cx="32" cy="32" r="6.0" fill="rgb(255 255 255 / 0.92)" />
      </svg>
    </div>
  );
}
