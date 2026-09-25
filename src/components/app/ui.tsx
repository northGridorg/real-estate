import { Link, type LinkProps } from "@tanstack/react-router";
import { Check, ChevronRight, Circle } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Panel({
  title,
  hint,
  trailing,
  className,
  children,
}: {
  title?: string;
  hint?: string;
  trailing?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card", className)}>
      {title ? (
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">
              {title}
            </h2>
            {hint ? <p className="truncate text-xs text-muted-foreground/80">{hint}</p> : null}
          </div>
          {trailing}
        </header>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function BigButton({
  children,
  onClick,
  to,
  params,
  tone = "solid",
  icon,
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  to?: LinkProps["to"];
  params?: Record<string, string>;
  tone?: "solid" | "outline" | "ghost" | "danger";
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const cls = cn(
    "touch-target flex w-full items-center justify-center gap-2 rounded-2xl px-4 text-[15px] font-semibold tracking-tight transition-colors active:scale-[0.99]",
    tone === "solid" && "bg-primary text-primary-foreground",
    tone === "outline" && "border border-border bg-secondary/40 text-foreground",
    tone === "ghost" && "text-primary",
    tone === "danger" && "border border-destructive/50 text-destructive",
    disabled && "pointer-events-none opacity-40",
    className,
  );
  if (to && !disabled)
    return (
      <Link to={to} params={params as never} onClick={onClick} className={cls}>
        {icon}
        {children}
      </Link>
    );
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cls}>
      {icon}
      {children}
    </button>
  );
}

export function Tile({
  to,
  params,
  label,
  hint,
  icon,
  onClick,
}: {
  to: LinkProps["to"];
  params?: Record<string, string>;
  label: string;
  hint?: string;
  icon: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      params={params as never}
      onClick={onClick}
      className="touch-target flex min-h-[104px] flex-col justify-between rounded-2xl border border-border bg-card p-4 active:bg-secondary/60"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-semibold tracking-tight">{label}</span>
        {hint ? (
          <span className="block truncate text-[11px] text-muted-foreground">{hint}</span>
        ) : null}
      </span>
    </Link>
  );
}

export function Row({
  title,
  subtitle,
  value,
  to,
  params,
  onClick,
  trailing,
  active,
}: {
  title: string;
  subtitle?: string;
  value?: string;
  to?: LinkProps["to"];
  params?: Record<string, string>;
  onClick?: () => void;
  trailing?: ReactNode;
  active?: boolean;
}) {
  const body = (
    <>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium tracking-tight">{title}</span>
        {subtitle ? (
          <span className="block truncate text-[12px] text-muted-foreground">{subtitle}</span>
        ) : null}
      </span>
      {value ? <span className="tabular shrink-0 text-[13px] text-primary">{value}</span> : null}
      {trailing ?? (to || onClick ? <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" /> : null)}
    </>
  );
  const cls = cn(
    "touch-target flex w-full items-center gap-3 rounded-xl px-3 text-left",
    active ? "bg-primary/15 ring-1 ring-primary/40" : "active:bg-secondary/60",
  );
  if (to)
    return (
      <Link to={to} params={params as never} onClick={onClick} className={cls}>
        {body}
      </Link>
    );
  return (
    <button type="button" onClick={onClick} className={cls}>
      {body}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputCls =
  "touch-target w-full rounded-xl border border-border bg-secondary/40 px-3 text-[15px] text-foreground outline-none focus:border-primary/70";

export function Tag({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "primary" | "warning" | "pink";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest",
        tone === "primary" && "bg-primary/15 text-primary",
        tone === "warning" && "bg-status-pending/15 text-status-pending",
        tone === "pink" && "bg-status-just-listed/15 text-status-just-listed",
        tone === "muted" && "bg-secondary text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function StepRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3 py-2">
      {done ? (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-4 w-4" />
        </span>
      ) : (
        <Circle className="h-6 w-6 text-muted-foreground/50" />
      )}
      <span className={cn("text-[15px]", done ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-2xl border border-border bg-secondary/40 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "touch-target flex-1 rounded-xl px-3 text-[13px] font-semibold",
            value === o.value ? "bg-primary text-primary-foreground" : "text-muted-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function whatsappLink(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
