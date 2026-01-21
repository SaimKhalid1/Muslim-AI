import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl shadow-soft border",
        className
      )}
      style={{ backgroundColor: "rgb(var(--card) / 1)", borderColor: "rgb(var(--border) / 1)" }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn("p-5 border-b", className)}
      style={{ borderColor: "rgb(var(--border) / 1)" }}
    >
      {children}
    </div>
  );
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
