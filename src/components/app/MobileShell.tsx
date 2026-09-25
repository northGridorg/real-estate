import { Link, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import {
  Briefcase,
  ChevronLeft,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Users,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { useFlow } from "@/state/flow";

const TABS = [
  { to: "/", label: "Today", icon: Home },
  { to: "/search", label: "Find Property", icon: Search },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/deal", label: "Active Deals", icon: Briefcase },
] as const;

export default function MobileShell({
  title,
  subtitle,
  back,
  trailing,
  fullBleed,
  children,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  trailing?: ReactNode;
  fullBleed?: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const navigate = useNavigate();
  const { signedIn, signOut } = useFlow();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [railOpen, setRailOpen] = useState(true);

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  useEffect(() => {
    if (!signedIn) navigate({ to: "/login", replace: true });
  }, [signedIn, navigate]);

  if (!signedIn) return <div className="min-h-[100dvh] bg-background" />;

  return (
    <div className="flex min-h-[100dvh] bg-muted/40 text-foreground">
      {/* Left sidebar */}
      <aside
        className={cn(
          "sticky top-0 z-40 hidden h-[100dvh] shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 sm:flex",
          railOpen ? "w-[212px] lg:w-[260px]" : "w-[76px]",
        )}
      >
        {/* Brand */}
        <div
          className={cn(
            "flex h-[92px] shrink-0 items-center gap-3 border-b border-border px-4 pt-[env(safe-area-inset-top)]",
            railOpen ? "" : "justify-center px-2",
          )}
        >
          <Link
            to="/"
            aria-label="NorthGrid home"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-[13px] font-bold text-primary-foreground"
          >
            NG
          </Link>
          {railOpen ? (
            <span className="min-w-0 truncate text-[19px] font-semibold tracking-tight">
              NorthGrid
            </span>
          ) : null}
        </div>

        {/* Edge collapse toggle */}
        <button
          type="button"
          onClick={() => setRailOpen((v) => !v)}
          aria-label={railOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={railOpen}
          className="absolute -right-3 top-1/2 z-40 hidden h-9 w-6 -translate-y-1/2 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-sm hover:bg-secondary/60 sm:flex"
        >
          {railOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </button>

        {/* Nav */}
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
          {TABS.map((tab) => {
            const active = isActive(tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                title={tab.label}
                className={cn(
                  "touch-target flex items-center rounded-xl text-[14px] font-medium",
                  railOpen ? "gap-3 px-3" : "justify-center px-2",
                  active
                    ? "border border-primary/25 bg-primary/10 text-primary"
                    : "border border-transparent text-muted-foreground hover:bg-secondary/60",
                )}
              >
                <tab.icon className="h-[20px] w-[20px] shrink-0" />
                {railOpen ? <span className="truncate">{tab.label}</span> : null}
              </Link>
            );
          })}

        </nav>

        {/* Broker footer */}
        <button
          type="button"
          onClick={signOut}
          title="Sign out"
          className={cn(
            "flex shrink-0 items-center gap-3 border-t border-border px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-left hover:bg-secondary/50",
            railOpen ? "" : "justify-center px-2",
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-[13px] font-semibold text-background">
            YH
          </span>
          {railOpen ? (
            <span className="min-w-0">
              <span className="block truncate text-[14px] font-medium">Yara Haddad</span>
              <span className="block text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Authorized
              </span>
            </span>
          ) : null}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-card">
          <div
            className={cn(
              "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 sm:pb-6",
              fullBleed ? "max-w-none" : "max-w-[1440px]",
            )}
          >
            {back ? (
              <button
                type="button"
                onClick={() => router.history.back()}
                aria-label="Back"
                className="touch-target -ml-1 flex items-center justify-center rounded-xl text-muted-foreground active:bg-secondary"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            ) : (
              <span className="w-1" />
            )}
            <div className="min-w-0">
              {subtitle ? (
                <p className="truncate text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {subtitle}
                </p>
              ) : null}
              <h1 className="truncate text-[24px] font-semibold tracking-tight sm:text-[30px]">
                {title}
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">{trailing}</div>
          </div>
        </header>

        {fullBleed ? (
          <main className="w-full flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:pb-0">
            {children}
          </main>
        ) : (
          <main className="w-full max-w-[1440px] flex-1 p-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:p-8 sm:pb-10">
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 lg:gap-6 [&>*:first-child]:lg:col-span-2">
              {children}
            </div>
          </main>
        )}
      </div>

      {/* Portrait / phone bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card sm:hidden">
        <div className="mx-auto flex w-full max-w-[900px] items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {TABS.map((tab) => {
            const active = isActive(tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={cn(
                  "touch-target flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <tab.icon className="h-[22px] w-[22px]" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
