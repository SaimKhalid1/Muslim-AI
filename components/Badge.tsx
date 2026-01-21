import { cn } from "@/lib/utils";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm "+
          "border border-[rgba(var(--gold),0.45)] bg-[rgba(var(--card),1)] text-[rgb(var(--fg))]",
        className
      )}
    >
      {children}
    </span>
  );
}
