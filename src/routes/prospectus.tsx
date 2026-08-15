import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileDown, Check } from "lucide-react";
import { toast } from "sonner";

import DeskShell from "@/components/desk/DeskShell";
import { DeskCard, Metric, Pill, QuickAction } from "@/components/desk/primitives";
import { ASSETS, CLIENTS, communityById } from "@/data/desk";
import {
  applyBps,
  entryCosts,
  formatAed,
  formatAedCompact,
  formatBps,
  projectValue,
  sumCents,
} from "@/lib/money";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/prospectus")({
  head: () => ({
    meta: [
      { title: "Prospectus Builder — Investment Proposals" },
      {
        name: "description",
        content:
          "Package 1-5 Dubai assets into a client investment proposal with an automated pro-forma covering DLD fees, equity share and 5-year appreciation.",
      },
      { property: "og:title", content: "Prospectus Builder — Investment Proposals" },
      {
        property: "og:description",
        content: "Deal packaging engine with automated financial pro-forma output.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProspectusPage,
});

function ProspectusPage() {
  const [clientId, setClientId] = useState(CLIENTS[0]!.id);
  const [picked, setPicked] = useState<string[]>([ASSETS[0]!.id, ASSETS[2]!.id]);
  const [horizon, setHorizon] = useState(5);

  const toggle = (id: string) => {
    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 5) {
        toast.error("A prospectus holds a maximum of 5 assets");
        return prev;
      }
      return [...prev, id];
    });
  };

  const selection = useMemo(() => ASSETS.filter((a) => picked.includes(a.id)), [picked]);

  const gross = sumCents(...selection.map((a) => a.price));
  const equity = sumCents(...selection.map((a) => applyBps(a.price, a.ownedBps)));
  const costs = selection.map((a) => entryCosts(a.price).total);
  const totalCosts = sumCents(...costs);
  const projected = sumCents(
    ...selection.map((a) => projectValue(a.price, a.annualGrowthBps, horizon)),
  );
  const uplift = projected - gross;

  return (
    <DeskShell
      title="Prospectus Builder"
      subtitle="Select 1–5 assets and generate a client-ready investment proposal"
      actions={
        <QuickAction
          variant="solid"
          onClick={() =>
            selection.length
              ? toast.success("Prospectus rendered", {
                  description: `${selection.length} assets · ${formatAedCompact(gross)} gross`,
                })
              : toast.error("Select at least one asset")
          }
        >
          <FileDown className="h-4 w-4" /> Generate proposal
        </QuickAction>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_24rem]">
        <DeskCard
          title="Asset basket"
          description={`${selection.length}/5 selected`}
          action={<QuickAction onClick={() => setPicked([])}>Clear</QuickAction>}
        >
          <div className="space-y-2">
            {ASSETS.map((a) => {
              const on = picked.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggle(a.id)}
                  className={cn(
                    "flex w-full flex-wrap items-center gap-3 rounded-md border px-3 py-3 text-left",
                    on
                      ? "border-primary/60 bg-primary/10"
                      : "border-border bg-secondary/30 hover:border-primary/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded border",
                      on ? "border-primary bg-primary text-primary-foreground" : "border-border",
                    )}
                  >
                    {on ? <Check className="h-4 w-4" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{a.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {communityById(a.communityId)?.name} · {a.developer}
                    </span>
                  </span>
                  <span className="tabular text-sm font-semibold">
                    {formatAedCompact(a.price)}
                  </span>
                  <Pill tone={a.marketType === "OFF_PLAN" ? "pink" : "primary"}>
                    {a.marketType === "OFF_PLAN" ? "Off-plan" : "Ready"}
                  </Pill>
                </button>
              );
            })}
          </div>
        </DeskCard>

        <div className="space-y-4">
          <DeskCard title="Recipient" description="Permissions carry into the proposal">
            <div className="space-y-2">
              {CLIENTS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setClientId(c.id)}
                  className={cn(
                    "touch-target w-full rounded-md border px-3 text-left text-sm",
                    c.id === clientId
                      ? "border-primary/60 bg-primary/10"
                      : "border-border bg-secondary/30",
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </DeskCard>

          <DeskCard title="Pro-forma" description="All figures computed in AED cents">
            <label className="block">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Hold horizon · {horizon} years
              </span>
              <input
                type="range"
                min={1}
                max={10}
                value={horizon}
                onChange={(e) => setHorizon(Number(e.target.value))}
                className="mt-2 h-11 w-full accent-[var(--color-primary)]"
              />
            </label>

            <dl className="mt-3 space-y-2 text-sm">
              {[
                ["Gross acquisition", formatAed(gross)],
                ["Client equity", formatAed(equity)],
                ["Entry costs", formatAed(totalCosts)],
                ["Total capital deployed", formatAed(sumCents(gross, totalCosts))],
                [`Projected value (${horizon}Y)`, formatAed(projected)],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="tabular text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-3 grid gap-3">
              <Metric
                label="Capital uplift"
                value={formatAedCompact(uplift)}
                delta={
                  gross > 0
                    ? `+${formatBps(Math.round((uplift / gross) * 10000))} over ${horizon}Y`
                    : "—"
                }
                tone="positive"
              />
            </div>
          </DeskCard>
        </div>
      </div>
    </DeskShell>
  );
}