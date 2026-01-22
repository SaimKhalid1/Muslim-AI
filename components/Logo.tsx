import React from "react";

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3" aria-label="Islam AI">
      <img
        src="/logo.svg"
        alt="Islam AI logo"
        width={size}
        height={size}
        className="rounded-xl"
      />
      <div className="leading-tight">
        <div className="font-extrabold tracking-tight">
          Islam AI
        </div>
        <div className="text-xs opacity-70">
          Study • Duʿā • Guidance
        </div>
      </div>
    </div>
  );
}

