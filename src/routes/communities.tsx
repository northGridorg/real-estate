import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Filter } from "lucide-react";
import { toast } from "sonner";

import DeskShell from "@/components/desk/DeskShell";
import { DeskCard, Metric, Pill, QuickAction, Sparkline } from "@/components/desk/primitives";
import { COMMUNITIES } from "@/data/desk";
import { bpsToPercent, formatAedCompact, formatBps, formatPsf, sumCents } from "@/lib/money";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/communities")({
  head: () => ({
    meta: [
      { title: "Dubai Communities — DLD Market Metrics" },
      {
        name: "description",
        content:
          "Dubai Land Department metrics by community: trailing 12-month sales volume, average AED per sq.ft, off-plan absorption and capital appreciation.",
      },
      { property: "og:title", content: "Dubai Communities — DLD Market Metrics" },
      {
        property: "og:description",
        content: "TTM volume, price per sq.ft, absorption rates and growth curves per community.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommunitiesPage,
});

type SortKey = "ttmVolume" | "avgPsf" | "offPlanAbsorptionBps" | "growth1yBps";

function CommunitiesPage() {
  const [sort, setSort] = useState<SortKey>("ttmVolume");
  const rows = [...COMMUNITIES].sort((a, b) => b[sort] - a[sort]);
  const totalVolume = sumCents(...COMMUNITIES.map((c) => c.ttmVolume));
  const totalTx = COMMUNITIES.reduce((n, c) => n + c.ttmTransactions, 0);
  const avgGrowth =
    COMMUNITIES.reduce((n, c) => n + c.growth1yBps, 0) / COMMUNITIES.length;

  const columns: { key: SortKey; label: string }[] = [
    { key: "ttmVolume", label: "TTM volume" },
    { key: "avgPsf", label: "Avg AED/sq.ft" },
    { key: "offPlanAbsorptionBps", label: "Off-plan absorption" },
    { key: "growth1yBps", label: "1Y appreciation" },
  ];

  return (
    <DeskShell
      title="Communities"
      subtitle="Dubai Land Department open data · refreshed nightly from me-central-1"
      actions={
        <>
          <QuickAction onClick={() => toast.info("Filter drawer is on the roadmap")}>
            <Filter className="h-4 w-4" /> Filters
          </QuickAction>
          <QuickAction variant="solid" onClick={() => toast.success("DLD extract queued as CSV")}>
            <Download className="h-4 w-4" /> Export DLD extract
          </QuickAction>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Tracked TTM volume" value={formatAedCompact(totalVolume)} />
        <Metric label="Registered transactions" value={totalTx.toLocaleString("en-AE")} />
        <Metric
          label="Mean 1Y appreciation"
          value={`${bpsToPercent(avgGrowth).toFixed(2)}%`}
          tone="positive"
          delta="Weighted across 6 communities"
        />
      </div>

      <DeskCard
        className="mt-4"
        title="Community performance"
        description="Tap a column heading to re-rank the desk"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-sm">
            <thead className="text-[11px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="py-2 text-left font-medium">Community</th>
                {columns.map((col) => (
                  <th key={col.key} className="py-2 text-right font-medium">
                    <button
                      type="button"
                      onClick={() => setSort(col.key)}
                      className={cn(
                        "rounded px-1 py-2 uppercase tracking-widest",
                        sort === col.key ? "text-primary" : "hover:text-foreground",
                      )}
                    >
                      {col.label}
                    </button>
                  </th>
                ))}
                <th className="py-2 text-right font-medium">3Y curve</th>
                <th className="py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t border-border align-middle">
                  <td className="py-3 pr-3">
                    <span className="block font-medium">{c.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {c.masterDeveloper} · Makani {c.makaniId}
                    </span>
                  </td>
                  <td className="tabular py-3 text-right">
                    <span className="block">{formatAedCompact(c.ttmVolume)}</span>
                    <span className="text-xs text-muted-foreground">
                      {c.ttmTransactions.toLocaleString("en-AE")} txns
                    </span>
                  </td>
                  <td className="tabular py-3 text-right">{formatPsf(c.avgPsf)}</td>
                  <td className="py-3 text-right">
                    <Pill tone={c.offPlanAbsorptionBps >= 8000 ? "primary" : "warning"}>
                      {formatBps(c.offPlanAbsorptionBps)}
                    </Pill>
                  </td>
                  <td className="tabular py-3 text-right text-primary">
                    +{formatBps(c.growth1yBps)}
                    <span className="block text-xs text-muted-foreground">
                      3Y +{formatBps(c.growth3yBps)}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Sparkline points={c.curve} className="ml-auto" />
                  </td>
                  <td className="py-3 text-right">
                    <QuickAction onClick={() => toast.info(`${c.name} comparables opened`)}>
                      Comps
                    </QuickAction>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DeskCard>
    </DeskShell>
  );
}