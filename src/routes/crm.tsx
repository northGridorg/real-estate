import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { KeyRound, QrCode, Copy, Building, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

import DeskShell from "@/components/desk/DeskShell";
import { DeskCard, Metric, Pill, QuickAction } from "@/components/desk/primitives";
import {
  CLIENTS,
  SPVS,
  assetsForClient,
  generateToken,
  type ClientPermissions,
} from "@/data/desk";
import { applyBps, formatAedCompact, formatBps, sumCents } from "@/lib/money";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/crm")({
  head: () => ({
    meta: [
      { title: "Private CRM Suite — Broker Control Desk" },
      {
        name: "description",
        content:
          "Directory of Dubai HNW clients and family offices with SPV entity mapping, mobile access tokens and per-client permission controls.",
      },
      { property: "og:title", content: "Private CRM Suite — Broker Control Desk" },
      {
        property: "og:description",
        content: "HNW client directory, entity mapper and 1-click mobile access keys.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CrmPage,
});

const PERMISSION_LABELS: Record<keyof ClientPermissions, string> = {
  hidePurchasePrice: "Mask original purchase price",
  capitalAppreciationOnly: "Show capital appreciation only",
  restrictPdfDownload: "Restrict prospectus PDF download",
};

function CrmPage() {
  const [activeId, setActiveId] = useState(CLIENTS[0]!.id);
  const [tokens, setTokens] = useState<Record<string, string>>(
    Object.fromEntries(CLIENTS.map((c) => [c.id, c.mobileToken])),
  );
  const [permissions, setPermissions] = useState<Record<string, ClientPermissions>>(
    Object.fromEntries(CLIENTS.map((c) => [c.id, { ...c.permissions }])),
  );

  const client = CLIENTS.find((c) => c.id === activeId)!;
  const entities = SPVS.filter((s) => s.clientId === activeId);
  const holdings = useMemo(() => assetsForClient(activeId), [activeId]);

  const gav = sumCents(...holdings.map((a) => a.price));
  const equity = sumCents(...holdings.map((a) => applyBps(a.price, a.ownedBps)));

  const rotate = () => {
    const token = generateToken();
    setTokens((prev) => ({ ...prev, [activeId]: token }));
    toast.success("Mobile access key rotated", { description: token });
  };

  return (
    <DeskShell
      title="Private CRM Suite"
      subtitle={`${CLIENTS.length} mandated relationships · ${SPVS.length} registered holding entities`}
      actions={
        <>
          <QuickAction onClick={() => toast.info("New relationship intake opened")}>
            New mandate
          </QuickAction>
          <QuickAction variant="solid" onClick={rotate}>
            <KeyRound className="h-4 w-4" /> Issue access key
          </QuickAction>
        </>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[20rem_1fr]">
        <DeskCard title="Client switcher" description="Select an active mandate">
          <div className="space-y-2">
            {CLIENTS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={cn(
                  "touch-target flex w-full flex-col items-start justify-center rounded-md border px-3 py-2 text-left transition-colors",
                  c.id === activeId
                    ? "border-primary/60 bg-primary/10"
                    : "border-border bg-secondary/30 hover:border-primary/40",
                )}
              >
                <span className="text-sm font-medium">{c.name}</span>
                <span className="text-[11px] text-muted-foreground">
                  {c.type} · since {c.relationshipSince}
                </span>
              </button>
            ))}
          </div>
        </DeskCard>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Gross asset value" value={formatAedCompact(gav)} />
            <Metric
              label="Client equity (BPS weighted)"
              value={formatAedCompact(equity)}
              delta={`${holdings.length} assets held`}
              tone="positive"
            />
            <Metric label="Advisor" value={client.advisor} delta={client.holdingCompany} />
          </div>

          <DeskCard
            title="Mobile app access"
            description="1-click token / QR key for the client mobile portal"
            action={
              <>
                <QuickAction
                  onClick={() => {
                    void navigator.clipboard?.writeText(tokens[activeId] ?? "");
                    toast.success("Access token copied");
                  }}
                >
                  <Copy className="h-4 w-4" /> Copy
                </QuickAction>
                <QuickAction variant="solid" onClick={rotate}>
                  Rotate
                </QuickAction>
              </>
            }
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-md border border-border bg-secondary/40 text-primary">
                <QrCode className="h-12 w-12" />
              </div>
              <div>
                <p className="tabular text-lg font-semibold tracking-[0.2em]">{tokens[activeId]}</p>
                <p className="text-xs text-muted-foreground">
                  Single-use pairing key · expires in 15 minutes · scoped to {client.name}
                </p>
              </div>
            </div>
          </DeskCard>

          <DeskCard title="Entity mapper" description="Parent / child holding structure">
            <ul className="space-y-2">
              {entities.map((entity) => (
                <li
                  key={entity.id}
                  className={cn(
                    "flex flex-wrap items-center gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2.5",
                    entity.parentId && "ml-6",
                  )}
                >
                  {entity.parentId ? (
                    <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Building className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-sm font-medium">{entity.name}</span>
                  <Pill tone={entity.parentId ? "muted" : "primary"}>{entity.jurisdiction}</Pill>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {entity.parentId ? "Subsidiary SPV" : "Parent entity"}
                  </span>
                </li>
              ))}
            </ul>
          </DeskCard>

          <DeskCard title="Permissions" description="Applied to the client mobile portal instantly">
            <div className="space-y-2">
              {(Object.keys(PERMISSION_LABELS) as (keyof ClientPermissions)[]).map((key) => {
                const enabled = permissions[activeId]![key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setPermissions((prev) => ({
                        ...prev,
                        [activeId]: { ...prev[activeId]!, [key]: !enabled },
                      }))
                    }
                    className="touch-target flex w-full items-center gap-3 rounded-md border border-border bg-secondary/30 px-3 py-2 text-left hover:border-primary/40"
                  >
                    <span className="flex-1 text-sm">{PERMISSION_LABELS[key]}</span>
                    <span
                      className={cn(
                        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                        enabled ? "bg-primary" : "bg-border",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-1 h-4 w-4 rounded-full bg-background transition-all",
                          enabled ? "left-6" : "left-1",
                        )}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </DeskCard>

          <DeskCard title="Held positions" description="Fractional equity stored in basis points">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-sm">
                <thead className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="py-2 text-left font-medium">Asset</th>
                    <th className="py-2 text-right font-medium">Value</th>
                    <th className="py-2 text-right font-medium">Share</th>
                    <th className="py-2 text-right font-medium">Equity</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((a) => (
                    <tr key={a.id} className="border-t border-border">
                      <td className="py-2.5 pr-3">
                        <span className="block font-medium">{a.title}</span>
                        <span className="text-xs text-muted-foreground">{a.reference}</span>
                      </td>
                      <td className="py-2.5 text-right">{formatAedCompact(a.price)}</td>
                      <td className="py-2.5 text-right">{formatBps(a.ownedBps)}</td>
                      <td className="py-2.5 text-right text-primary">
                        {formatAedCompact(applyBps(a.price, a.ownedBps))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DeskCard>
        </div>
      </div>
    </DeskShell>
  );
}