import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Mail } from "lucide-react";
import { toast } from "sonner";

import DeskShell from "@/components/desk/DeskShell";
import { DeskCard, Metric, Pill, QuickAction, Sparkline } from "@/components/desk/primitives";
import { ASSETS, CLIENTS, COMMUNITIES, assetsForClient, communityById } from "@/data/desk";
import {
  applyBps,
  formatAed,
  formatAedCompact,
  formatBps,
  projectValue,
  sumCents,
} from "@/lib/money";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Executive Reports — Portfolio Performance" },
      {
        name: "description",
        content:
          "Executive portfolio reporting for Dubai mandates: capital deployed, equity by basis points, community concentration and projected appreciation.",
      },
      { property: "og:title", content: "Executive Reports — Portfolio Performance" },
      {
        property: "og:description",
        content: "Board-ready portfolio reporting across mandates and communities.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const [clientId, setClientId] = useState<string>("all");

  const holdings = clientId === "all" ? ASSETS : assetsForClient(clientId);
  const gross = sumCents(...holdings.map((a) => a.price));
  const equity = sumCents(...holdings.map((a) => applyBps(a.price, a.ownedBps)));
  const projected = sumCents(...holdings.map((a) => projectValue(a.price, a.annualGrowthBps, 5)));
  const offPlanShare =
    holdings.length > 0
      ? Math.round(
          (holdings.filter((a) => a.marketType === "OFF_PLAN").length / holdings.length) * 10000,
        )
      : 0;

  const byCommunity = COMMUNITIES.map((c) => {
    const items = holdings.filter((a) => a.communityId === c.id);
    return { community: c, value: sumCents(...items.map((a) => a.price)), count: items.length };
  }).filter((row) => row.count > 0);
  const maxValue = Math.max(1, ...byCommunity.map((r) => r.value));

  return (
    <DeskShell
      title="Reports"
      subtitle="Executive portfolio reporting · generated from integer AED ledgers"
      actions={
        <>
          <QuickAction onClick={() => toast.success("Report emailed to the mandate contact")}>
            <Mail className="h-4 w-4" /> Email
          </QuickAction>
          <QuickAction variant="solid" onClick={() => toast.success("PDF export queued")}>
            <Download className="h-4 w-4" /> Export PDF
          </QuickAction>
        </>
      }
    >
      <div className="flex flex-wrap gap-2">
        {[{ id: "all", name: "All mandates" }, ...CLIENTS].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setClientId(c.id)}
            className={cn(
              "touch-target rounded-md border px-4 text-xs font-semibold",
              clientId === c.id
                ? "border-primary/60 bg-primary/15 text-primary"
                : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground",
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Gross asset value" value={formatAedCompact(gross)} />
        <Metric label="Equity (BPS weighted)" value={formatAedCompact(equity)} tone="positive" />
        <Metric
          label="Projected value 5Y"
          value={formatAedCompact(projected)}
          delta={`+${formatAedCompact(projected - gross)} uplift`}
          tone="positive"
        />
        <Metric
          label="Off-plan weighting"
          value={formatBps(offPlanShare)}
          delta={`${holdings.length} positions`}
          tone={offPlanShare > 5000 ? "warning" : "neutral"}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <DeskCard title="Community concentration" description="Exposure by registered community">
          <div className="space-y-3">
            {byCommunity.map((row) => (
              <div key={row.community.id}>
                <div className="flex items-baseline justify-between text-sm">
                  <span>{row.community.name}</span>
                  <span className="tabular text-muted-foreground">
                    {formatAedCompact(row.value)} · {row.count}
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-secondary">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${Math.max(4, (row.value / maxValue) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </DeskCard>

        <DeskCard title="Position ledger" description="Full-precision AED values">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm">
              <thead className="text-[11px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="py-2 text-left font-medium">Reference</th>
                  <th className="py-2 text-right font-medium">Price</th>
                  <th className="py-2 text-right font-medium">Share</th>
                  <th className="py-2 text-right font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="py-2.5 pr-3">
                      <span className="block font-medium">{a.reference}</span>
                      <span className="text-xs text-muted-foreground">
                        {communityById(a.communityId)?.name}
                      </span>
                    </td>
                    <td className="tabular py-2.5 text-right">{formatAed(a.price)}</td>
                    <td className="py-2.5 text-right">
                      <Pill tone={a.ownedBps === 10000 ? "muted" : "primary"}>
                        {formatBps(a.ownedBps)}
                      </Pill>
                    </td>
                    <td className="py-2.5 text-right">
                      <Sparkline
                        points={communityById(a.communityId)?.curve ?? [100, 110]}
                        className="ml-auto"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DeskCard>
      </div>
    </DeskShell>
  );
}