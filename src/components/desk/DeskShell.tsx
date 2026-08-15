import { Link, useRouterState } from "@tanstack/react-router";
import {
  Users,
  Building2,
  LayoutGrid,
  Map,
  FileText,
  BarChart3,
  Settings,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const NAV = [
  { to: "/crm", label: "Private CRM", icon: Users, hint: "HNW & Family Offices" },
  { to: "/communities", label: "Communities", icon: Building2, hint: "DLD open data" },
  { to: "/assets", label: "Assets", icon: LayoutGrid, hint: "Off-plan & ready" },
  { to: "/yield-map", label: "Yield Map", icon: Map, hint: "Capital growth" },
  { to: "/prospectus", label: "Prospectus", icon: FileText, hint: "Deal packaging" },
  { to: "/reports", label: "Reports", icon: BarChart3, hint: "Portfolio exports" },
  { to: "/settings", label: "Settings", icon: Settings, hint: "RBAC & infra" },
] as const;

export default function DeskShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-[100dvh] w-full bg-background text-foreground">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-[100dvh] w-[17rem] flex-col border-r border-border bg-sidebar-bg transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">Broker Control Desk</p>
            <p className="truncate text-[11px] uppercase tracking-widest text-muted-foreground">
              Dubai · me-central-1
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="touch-target ml-auto flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "touch-target flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-sidebar-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium leading-tight">{item.label}</span>
                  <span className="block text-[11px] text-muted-foreground">{item.hint}</span>
                </span>
                {active ? <span className="h-6 w-1 rounded-full bg-primary" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4 text-[11px] text-muted-foreground">
          <p className="font-medium text-foreground">Y. Haddad · Senior Broker</p>
          <p>RERA BRN 48219 · Licence active</p>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Dismiss navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-background/70 lg:hidden"
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-[17rem]">
        <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-border bg-header-bg/95 px-4 py-3 backdrop-blur md:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="touch-target flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold tracking-tight md:text-xl">{title}</h1>
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}