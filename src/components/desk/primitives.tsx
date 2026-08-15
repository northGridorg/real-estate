import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function DeskCard({
  title,
  description,
  action,
  className,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]",
        className,
      )}
    >
      <header className="flex flex-wrap items-start gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function QuickAction({
  children,
  onClick,
  variant = "ghost",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "ghost" | "solid";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "touch-target inline-flex items-center justify-center gap-2 rounded-md px-3 text-xs font-semibold tracking-wide transition-colors",
        variant === "solid"
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "border border-border bg-secondary/40 text-foreground hover:border-primary/60 hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}

export function Metric({
  label,
  value,
  delta,
  tone = "neutral",
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: "neutral" | "positive" | "warning";
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="tabular mt-1 text-xl font-semibold tracking-tight">{value}</p>
      {delta ? (
        <p
          className={cn(
            "tabular mt-1 text-xs",
            tone === "positive"
              ? "text-primary"
              : tone === "warning"
                ? "text-status-pending"
                : "text-muted-foreground",
          )}
        >
          {delta}
        </p>
      ) : null}
    </div>
  );
}

export function Pill({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "primary" | "warning" | "pink";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest",
        tone === "primary"
          ? "bg-primary/15 text-primary"
          : tone === "warning"
            ? "bg-status-pending/15 text-status-pending"
            : tone === "pink"
              ? "bg-status-just-listed/15 text-status-just-listed"
              : "bg-secondary text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function Sparkline({ points, className }: { points: number[]; className?: string }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 30 - ((p - min) / span) * 26;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className={cn("h-8 w-24", className)}>
      <path d={path} fill="none" stroke="var(--color-primary)" strokeWidth="2" />
    </svg>
  );
}