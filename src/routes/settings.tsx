import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Server, ShieldCheck, Database, Activity } from "lucide-react";
import { toast } from "sonner";

import DeskShell from "@/components/desk/DeskShell";
import { DeskCard, Metric, Pill, QuickAction } from "@/components/desk/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Data Sovereignty & RBAC" },
      {
        name: "description",
        content:
          "Monitor AWS Dubai (me-central-1) data sovereignty status and manage role-based access control for the broker control desk.",
      },
      { property: "og:title", content: "Settings — Data Sovereignty & RBAC" },
      {
        property: "og:description",
        content: "Infrastructure residency monitor and role-based access control.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const NODES = [
  { name: "Primary DB · me-central-1a", icon: Database, latency: "8 ms", state: "HEALTHY" },
  { name: "Read replica · me-central-1b", icon: Database, latency: "11 ms", state: "HEALTHY" },
  { name: "Document vault (S3, Dubai)", icon: Server, latency: "14 ms", state: "HEALTHY" },
  { name: "Audit stream", icon: Activity, latency: "22 ms", state: "DEGRADED" },
] as const;

const ROLES = [
  { role: "Managing Partner", members: 2, scopes: ["All modules", "Pricing", "RBAC"] },
  { role: "Senior Broker", members: 6, scopes: ["CRM", "Assets", "Prospectus"] },
  { role: "Analyst", members: 4, scopes: ["Communities", "Reports"] },
  { role: "Client (mobile)", members: 34, scopes: ["Own portfolio"] },
];

function SettingsPage() {
  const [residencyLock, setResidencyLock] = useState(true);
  const [mfa, setMfa] = useState(true);
  const [auditExport, setAuditExport] = useState(false);

  const toggles: [string, boolean, (v: boolean) => void, string][] = [
    [
      "Enforce UAE data residency",
      residencyLock,
      setResidencyLock,
      "Blocks any write outside me-central-1",
    ],
    ["Mandatory MFA for desk users", mfa, setMfa, "TOTP or passkey required at sign-in"],
    [
      "Daily audit log export",
      auditExport,
      setAuditExport,
      "Ships immutable logs to the compliance vault",
    ],
  ];

  return (
    <DeskShell
      title="Settings"
      subtitle="Infrastructure sovereignty monitor and role-based access control"
      actions={
        <QuickAction variant="solid" onClick={() => toast.success("Configuration saved")}>
          Save changes
        </QuickAction>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Region" value="me-central-1" delta="AWS Dubai" />
        <Metric label="Uptime 30d" value="99.98%" tone="positive" />
        <Metric label="Open incidents" value="1" delta="Audit stream degraded" tone="warning" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <DeskCard title="Data sovereignty monitor" description="AWS Dubai connection status">
          <ul className="space-y-2">
            {NODES.map((node) => (
              <li
                key={node.name}
                className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-secondary/30 px-3 py-2.5"
              >
                <node.icon className="h-4 w-4 text-primary" />
                <span className="min-w-0 flex-1 text-sm">{node.name}</span>
                <span className="tabular text-xs text-muted-foreground">{node.latency}</span>
                <Pill tone={node.state === "HEALTHY" ? "primary" : "warning"}>{node.state}</Pill>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-2">
            {toggles.map(([label, value, set, hint]) => (
              <button
                key={label}
                type="button"
                onClick={() => set(!value)}
                className="touch-target flex w-full items-center gap-3 rounded-md border border-border bg-secondary/30 px-3 py-2 text-left hover:border-primary/40"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm">{label}</span>
                  <span className="block text-xs text-muted-foreground">{hint}</span>
                </span>
                <span
                  className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                    value ? "bg-primary" : "bg-border",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 h-4 w-4 rounded-full bg-background transition-all",
                      value ? "left-6" : "left-1",
                    )}
                  />
                </span>
              </button>
            ))}
          </div>
        </DeskCard>

        <DeskCard
          title="Role-based access control"
          description="Scopes applied across all 7 desk modules"
          action={<QuickAction onClick={() => toast.info("Invite drawer opened")}>Invite</QuickAction>}
        >
          <ul className="space-y-2">
            {ROLES.map((r) => (
              <li key={r.role} className="rounded-md border border-border bg-secondary/30 px-3 py-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{r.role}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {r.members} members
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.scopes.map((s) => (
                    <Pill key={s}>{s}</Pill>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </DeskCard>
      </div>
    </DeskShell>
  );
}