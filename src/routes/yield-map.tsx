import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Layers, Satellite } from "lucide-react";

import DeskShell from "@/components/desk/DeskShell";
import { Pill, QuickAction } from "@/components/desk/primitives";
import YieldGoogleMap from "@/components/desk/YieldGoogleMap";
import { ASSETS, COMMUNITIES, communityById } from "@/data/desk";
import { bpsToPercent, formatAedCompact, formatBps } from "@/lib/money";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/yield-map")({
  head: () => ({
    meta: [
      { title: "Capital Growth & Yield Map — Dubai" },
      {
        name: "description",
        content:
          "Dark satellite-style yield map of Dubai with client-needs filters across communities, handover windows, budget and capital appreciation.",
      },
      { property: "og:title", content: "Capital Growth & Yield Map — Dubai" },
      {
        property: "og:description",
        content: "Filter Dubai inventory by client needs and read capital growth at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: YieldMapPage,
});

const HANDOVERS = ["READY", "2026-2027", "2028+"] as const;

function YieldMapPage() {
  const [communities, setCommunities] = useState<string[]>([]);
  const [handovers, setHandovers] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(50);
  const [minGrowth, setMinGrowth] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [satellite, setSatellite] = useState(true);
  const [heat, setHeat] = useState(true);

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const matches = useMemo(
    () =>
      ASSETS.filter(
        (a) =>
          (communities.length === 0 || communities.includes(a.communityId)) &&
          (handovers.length === 0 || handovers.includes(a.handoverWindow)) &&
          a.price / 100 <= maxPrice * 1_000_000 &&
          bpsToPercent(a.annualGrowthBps) >= minGrowth,
      ),
    [communities, handovers, maxPrice, minGrowth],
  );

  const matchIds = new Set(matches.map((a) => a.id));
  const selected = ASSETS.find((a) => a.id === selectedId);

  return (
    <DeskShell
      title="Capital Growth & Yield Map"
      subtitle="Dubai coordinates 25.20°N 55.27°E · dark satellite layer"
      actions={
        <>
          <QuickAction
            variant={satellite ? "solid" : undefined}
            onClick={() => setSatellite((v) => !v)}
          >
            <Satellite className="h-4 w-4" /> {satellite ? "Satellite" : "Dark vector"}
          </QuickAction>
          <QuickAction variant={heat ? "solid" : undefined} onClick={() => setHeat((v) => !v)}>
            <Layers className="h-4 w-4" /> Growth heat
          </QuickAction>
        </>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[20rem_1fr]">
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Client needs
            </p>
            <div className="mt-2 space-y-1.5">
              {COMMUNITIES.map((c) => (
                <label
                  key={c.id}
                  className="touch-target flex cursor-pointer items-center gap-3 rounded-md px-2 hover:bg-secondary/40"
                >
                  <input
                    type="checkbox"
                    checked={communities.includes(c.id)}
                    onChange={() => toggle(communities, setCommunities, c.id)}
                    className="h-4 w-4 accent-[var(--color-primary)]"
                  />
                  <span className="flex-1 text-sm">{c.name}</span>
                  <span className="tabular text-xs text-primary">+{formatBps(c.growth1yBps)}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Handover window
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {HANDOVERS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => toggle(handovers, setHandovers, h)}
                  className={cn(
                    "touch-target rounded-md border px-3 text-xs font-semibold",
                    handovers.includes(h)
                      ? "border-primary/60 bg-primary/15 text-primary"
                      : "border-border bg-secondary/30 text-muted-foreground",
                  )}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Budget ceiling · AED {maxPrice}M
            </span>
            <input
              type="range"
              min={1}
              max={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-2 h-11 w-full accent-[var(--color-primary)]"
            />
          </label>

          <label className="block">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Min appreciation · {minGrowth.toFixed(0)}% p.a.
            </span>
            <input
              type="range"
              min={0}
              max={18}
              value={minGrowth}
              onChange={(e) => setMinGrowth(Number(e.target.value))}
              className="mt-2 h-11 w-full accent-[var(--color-primary)]"
            />
          </label>

          <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
            {matches.length} of {ASSETS.length} assets match
          </p>
        </div>

        <div className="relative h-[70dvh] min-h-[26rem] overflow-hidden rounded-lg border border-border bg-[oklch(0.16_0.03_240)]">
          <YieldGoogleMap
            assets={ASSETS}
            matchIds={matchIds}
            selectedId={selectedId}
            onSelect={setSelectedId}
            satellite={satellite}
            heat={heat}
          />

          {selected ? (
            <div className="pointer-events-auto absolute bottom-4 left-4 right-4 z-10 rounded-lg border border-border bg-card/95 p-4 backdrop-blur sm:right-auto sm:w-80">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{selected.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {communityById(selected.communityId)?.name} · {selected.developer}
                  </p>
                </div>
                <Pill tone={selected.marketType === "OFF_PLAN" ? "pink" : "primary"}>
                  {selected.marketType === "OFF_PLAN" ? "Off-plan" : "Ready"}
                </Pill>
              </div>
              <p className="tabular mt-2 text-lg font-semibold">
                {formatAedCompact(selected.price)}
              </p>
              <p className="text-xs text-primary">
                +{formatBps(selected.annualGrowthBps)} projected p.a. · handover{" "}
                {selected.handoverWindow}
              </p>
              <div className="mt-3 flex gap-2">
                <QuickAction>Add to prospectus</QuickAction>
                <QuickAction variant="solid" onClick={() => setSelectedId(null)}>
                  Dismiss
                </QuickAction>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </DeskShell>
  );
}