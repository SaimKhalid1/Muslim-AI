import React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
};

export function Button({ variant = "primary", className, ...props }: Props) {
  // Hard-guard against production CSS/theme issues by applying theme-safe inline styles
  // for the two variants that users rely on most (primary + outline).
  // (This prevents "invisible" buttons on dark mode when CSS var syntax or purging acts up.)
  const base = "btn-base";

  const style: React.CSSProperties | undefined =
    variant === "primary"
      ? {
          color: "rgb(2 6 23)",
          border: "2px solid rgb(var(--gold) / 0.65)",
          background:
            "linear-gradient(90deg, rgb(var(--gold) / 1), rgb(var(--emerald) / 0.95), rgb(var(--gold2) / 0.95))",
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
        }
      : variant === "outline"
        ? {
            color: "rgb(var(--fg))",
            border: "2px solid rgb(var(--gold) / 0.55)",
            backgroundColor: "rgb(var(--card) / 1)",
          }
        : undefined;

  const styles =
    variant === "primary" ? "btn-primary" : variant === "outline" ? "btn-outline" : "btn-ghost";

  return <button className={cn(base, styles, className)} style={style} {...props} />;
}
