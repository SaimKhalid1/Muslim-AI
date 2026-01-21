
"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("islam-ai.theme") : null;
    if (saved === "dark") setDark(true);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    window.localStorage.setItem("islam-ai.theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className={
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-[0.99] " +
        "border border-[rgba(var(--gold),0.6)] bg-[rgba(var(--card),1)] text-[rgb(var(--fg))] hover:bg-[rgba(var(--card2),1)]"
      }
    >
      {dark ? <Moon size={16} /> : <Sun size={16} />}
      {dark ? "Night" : "Day"}
    </button>
  );
}
