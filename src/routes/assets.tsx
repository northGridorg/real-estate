import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShieldCheck, AlertTriangle, Plus } from "lucide-react";
import { toast } from "sonner";

import DeskShell from "@/components/desk/DeskShell";
import { DeskCard, Metric, Pill, QuickAction } from "@/components/desk/primitives";
import { ASSETS, communityById, spvById, type MarketType } from "@/data/desk";
import {
  applyBps,
  entryCosts,
  formatAed,
  formatAedCompact,
  formatBps,
  formatPsf,
  sumCents,
} from "@/lib/money";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assets")({
  head: () => ({
    meta: [
      { title: "Asset Inventory Desk — Off-Plan & Secondary" },
      {
        name: "description",
        content:
          "Dubai asset inventory split by off-plan and secondary ready units, with basis-point fractional equity and escrow-tracked payment plans.",
      },
      { property: "og:title", content: "Asset Inventory Desk — Off-Plan & Secondary" },
      {
        property: "og:description",
        content: "Inventory, fractional equity in BPS and construction milestone tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssetsPage,
});

function AssetsPage() {
  const [tab, setTab] = useState<MarketType>("OFF_PLAN");
  const [selectedId, setSelectedId] = useState(ASSETS[1]!.id);

  const rows = useMemo(() => ASSETS.filter((a) => a.marketType === tab), [tab]);
  const selected = ASSETS.find((a) => a.id === selectedId) ?? rows[0]!;
  const costs = entryCosts(selected.price);
  const inventoryValue = sumCents(...rows.map((a) => a.price));

  return (
    <DeskShell
      title="Assets"
      subtitle="Secondary ready units and off-plan allocations · fractional equity in basis points"
      actions={
        <QuickAction variant="solid" onClick={() => toast.info("Asset intake form opened")}>
          <Plus className="h-4 w-4" /> Add allocation
        </QuickAction>
      }
    >
      <div className="flex flex-wrap gap-2">
        {(["OFF_PLAN", "SECONDARY_READY"] as MarketType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "touch-target rounded-md border px-4 text-xs font-bold uppercase tracking-widest",
              tab === t
                ? "border-primary/60 bg-primary/15 text-primary"
                : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "OFF_PLAN" ? "Off-plan" : "Secondary ready"}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metric label="Inventory value" value={formatAedCompact(inventoryValue)} />
        <Metric label="Units on desk" value={String(rows.length)} />
        <Metric
          label="Brokerage exposure"
          value={formatAedCompact(sumCents(...rows.map((a) => applyBps(a.price, 200))))}
          delta="2.00% agency at 10,000 BPS base"
          tone="positive"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_24rem]">
        <DeskCard title="Inventory" description={`${rows.length} allocations in this book`}>
          <div className="space-y-2">
            {rows.map((a) => {
              const community = communityById(a.communityId);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelectedId(a.id)}
                  className={cn(
                    "flex w-full flex-wrap items-center gap-3 rounded-md border px-3 py-3 text-left transition-colors",
                    a.id === selected.id
                      ? "border-primary/60 bg-primary/10"
                      : "border-border bg-secondary/30 hover:border-primary/40",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {community?.name} · {a.developer} · {a.bedrooms} BR ·{" "}
                      {a.sqft.toLocaleString("en-AE")} sq.ft
                    </p>
                  </div>
                  <div className="tabular text-right">
                    <p className="text-sm font-semibold">{formatAedCompact(a.price)}</p>
                    <p className="text-xs text-muted-foreground">{formatPsf(a.psf)}</p>
                  </div>
                  <Pill tone={a.ownedBps === 10000 ? "muted" : "primary"}>
                    {formatBps(a.ownedBps)} held
                  </Pill>
                </button>
              );
            })}
          </div>
        </DeskCard>

        <div className="space-y-4">
          <DeskCard
            title={selected.reference}
            description={selected.title}
            action={
              <>
                <QuickAction onClick={() => toast.success("Added to prospectus basket")}>
                  Package
                </QuickAction>
                <QuickAction variant="solid" onClick={() => toast.info("Reservation form opened")}>
                  Reserve
                </QuickAction>
              </>
            }
          >
            <dl className="space-y-2 text-sm">
              {[
                ["Price", formatAed(selected.price)],
                ["Price per sq.ft", formatPsf(selected.psf)],
                ["Holding entity", spvById(selected.holderSpvId)?.name ?? "Unallocated"],
                ["Fractional equity", `${formatBps(selected.ownedBps)} (${selected.ownedBps} BPS)`],
                ["Handover", selected.handoverWindow],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="tabular text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 rounded-md border border-border bg-secondary/30 p-3 text-sm">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Entry costs
              </p>
              {[
                ["DLD transfer 4.00%", costs.dld],
                ["Agency 2.00%", costs.agency],
                ["Trustee office", costs.trustee],
                ["Admin & NOC", costs.admin],
              ].map(([label, value]) => (
                <div key={label as string} className="mt-1.5 flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="tabular">{formatAed(value as number)}</span>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold text-primary">
                <span>Total cash to close</span>
                <span className="tabular">{formatAed(sumCents(selected.price, costs.total))}</span>
              </div>
            </div>
          </DeskCard>

          {selected.plan ? (
            <DeskCard
              title="Payment plan"
              description={`${selected.plan.headline} · handover ${selected.plan.handover}`}
              action={
                <QuickAction onClick={() => toast.success("Milestone schedule exported")}>
                  Export
                </QuickAction>
              }
            >
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone={selected.plan.escrowStatus === "VERIFIED" ? "primary" : "warning"}>
                  {selected.plan.escrowStatus === "VERIFIED" ? (
                    <ShieldCheck className="mr-1 h-3 w-3" />
                  ) : (
                    <AlertTriangle className="mr-1 h-3 w-3" />
                  )}
                  Escrow {selected.plan.escrowStatus.replace("_", " ")}
                </Pill>
                {selected.plan.postHandover ? <Pill tone="pink">Post-handover</Pill> : null}
                <span className="text-xs text-muted-foreground">
                  {selected.plan.escrowAccount}
                </span>
              </div>

              <ol className="mt-3 space-y-2">
                {selected.plan.milestones.map((m) => (
                  <li
                    key={m.label}
                    className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2.5"
                  >
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        m.status === "PAID"
                          ? "bg-primary"
                          : m.status === "DUE"
                            ? "bg-status-pending"
                            : "bg-border",
                      )}
                    />
                    <span className="min-w-0 flex-1 basis-24 text-sm">{m.label}</span>
                    <span className="tabular shrink-0 text-xs text-muted-foreground">
                      {m.dueOn}
                    </span>
                    <span className="tabular ml-auto shrink-0 text-right text-sm font-medium">
                      {formatAedCompact(applyBps(selected.price, m.bps))}
                    </span>
                    <Pill tone={m.status === "DUE" ? "warning" : "muted"}>
                      {formatBps(m.bps)}
                    </Pill>
                  </li>
                ))}
              </ol>
            </DeskCard>
          ) : (
            <DeskCard title="Payment plan" description="Ready unit — settled at transfer">
              <p className="text-sm text-muted-foreground">
                Secondary ready units settle in full at the DLD trustee office; no construction
                milestones apply.
              </p>
            </DeskCard>
          )}
        </div>
      </div>
    </DeskShell>
  );
}