import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Share2, X } from "lucide-react";
import { useState } from "react";

import MobileShell from "@/components/app/MobileShell";
import { BigButton, Panel, Segmented, whatsappLink } from "@/components/app/ui";
import YieldGoogleMap from "@/components/desk/YieldGoogleMap";
import {
  annualRent,
  communityName,
  grossYieldBps,
  propertyById,
  statusFor,
} from "@/data/app";
import {
  entryCosts,
  formatAed,
  formatAedCompact,
  formatBps,
  projectValue,
} from "@/lib/money";
import { useFlow } from "@/state/flow";

export const Route = createFileRoute("/match")({
  head: () => ({
    meta: [
      { title: "Property ↔ Client Match — NorthGrid" },
      {
        name: "description",
        content:
          "Side-by-side match of client requirements against the selected Dubai unit, with ROI calculator and map.",
      },
      { property: "og:title", content: "Property ↔ Client Match — NorthGrid" },
      {
        property: "og:description",
        content: "Check budget, bedrooms and location fit, run the numbers, then create the offer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MatchScreen,
});

const TABS = [
  { value: "fit", label: "Fit" },
  { value: "roi", label: "ROI" },
  { value: "map", label: "Map" },
  { value: "compare", label: "Compare" },
] as const;

function MatchScreen() {
  const navigate = useNavigate();
  const { buyers, activeBuyerId, selectedPropertyId, compare, setOffer } = useFlow();
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("fit");
  const [years, setYears] = useState(5);

  const buyer = buyers.find((b) => b.id === activeBuyerId);
  const property = propertyById(selectedPropertyId);

  if (!buyer || !property) {
    return (
      <MobileShell title="Property ↔ Client" back>
        <Panel>
          <p className="text-sm text-muted-foreground">
            Pick a property and a client first — then this screen matches them side by side.
          </p>
        </Panel>
        <BigButton to="/search">Find property</BigButton>
      </MobileShell>
    );
  }

  const req = buyer.requirements;
  const checks = [
    { label: `Budget ${formatAedCompact(req.budget)}`, ok: property.price <= req.budget },
    { label: `${req.bedrooms}+ bedrooms`, ok: property.bedrooms >= req.bedrooms },
    { label: req.locations.join(" / "), ok: req.locations.includes(communityName(property)) },
    {
      label: req.purpose === "INVESTMENT" ? "Investment yield 6%+" : "Ready to occupy",
      ok:
        req.purpose === "INVESTMENT"
          ? grossYieldBps(property) >= 600
          : property.marketType === "SECONDARY_READY",
    },
    { label: "Available for offer", ok: statusFor(property) !== "UNDER_OFFER" },
  ];
  const score = checks.filter((c) => c.ok).length;
  const costs = entryCosts(property.price);

  const shareText = `${buyer.name} — proposed match
${property.title} (${communityName(property)})
${formatAedCompact(property.price)} · ${property.bedrooms} bed · ${property.sqft.toLocaleString()} sq.ft
Gross yield ${formatBps(grossYieldBps(property))} · projected ${formatAedCompact(
    projectValue(property.price, property.annualGrowthBps, years),
  )} in ${years} yrs`;

  return (
    <MobileShell title="Property ↔ Client" subtitle={`${buyer.name} · match ${score}/5`} back>
      <Panel>
        <div className="grid grid-cols-2 gap-3 text-[13px]">
          <div className="rounded-xl bg-secondary/40 p-3">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Client</p>
            <p className="mt-1 font-semibold">{buyer.name}</p>
            <p className="tabular text-muted-foreground">{formatAedCompact(req.budget)} budget</p>
            <p className="text-muted-foreground">
              {req.bedrooms}+ bed · {req.funding === "CASH" ? "Cash" : "Mortgage"}
            </p>
            <p className="text-muted-foreground">{req.locations.join(", ")}</p>
          </div>
          <div className="rounded-xl bg-primary/10 p-3">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Property</p>
            <p className="mt-1 font-semibold">{property.title}</p>
            <p className="tabular text-primary">{formatAedCompact(property.price)}</p>
            <p className="text-muted-foreground">
              {property.bedrooms} bed · {property.sqft.toLocaleString()} sq.ft
            </p>
            <p className="text-muted-foreground">{communityName(property)}</p>
          </div>
        </div>
      </Panel>

      <Segmented options={TABS} value={tab} onChange={setTab} />

      {tab === "fit" ? (
        <Panel title="Requirement fit">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center gap-3 py-2">
              {c.ok ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </span>
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/20 text-destructive">
                  <X className="h-4 w-4" />
                </span>
              )}
              <span className="text-[15px]">{c.label}</span>
            </div>
          ))}
        </Panel>
      ) : null}

      {tab === "roi" ? (
        <Panel title="ROI calculator" hint={`${years}-year horizon`}>
          <input
            type="range"
            min={1}
            max={10}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="h-10 w-full accent-[var(--color-primary)]"
          />
          <div className="tabular mt-2 space-y-2 text-[14px]">
            <Line label="Price" value={formatAed(property.price)} />
            <Line label="Entry costs" value={formatAed(costs.total)} />
            <Line label="Annual rent" value={formatAed(annualRent(property))} />
            <Line label="Gross yield" value={formatBps(grossYieldBps(property))} strong />
            <Line
              label={`Value in ${years} yrs`}
              value={formatAedCompact(projectValue(property.price, property.annualGrowthBps, years))}
              strong
            />
          </div>
        </Panel>
      ) : null}

      {tab === "map" ? (
        <div className="relative h-[46dvh] overflow-hidden rounded-2xl border border-border">
          <YieldGoogleMap
            assets={[property]}
            matchIds={new Set([property.id])}
            selectedId={property.id}
            onSelect={() => {}}
            satellite
            heat={false}
          />
        </div>
      ) : null}

      {tab === "compare" ? (
        <Panel title="Compare properties" hint="Up to 3 units">
          {compare.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add units to compare from any property screen.
            </p>
          ) : (
            <div className="tabular space-y-2 text-[13px]">
              {compare.map((id) => {
                const p = propertyById(id)!;
                return (
                  <div key={id} className="rounded-xl bg-secondary/40 p-3">
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-muted-foreground">
                      {formatAedCompact(p.price)} · {p.bedrooms} bed · {p.sqft.toLocaleString()} sq.ft ·{" "}
                      {formatBps(grossYieldBps(p))} yield
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      ) : null}

      <BigButton
        tone="outline"
        icon={<Share2 className="h-4 w-4" />}
        onClick={() => window.open(whatsappLink(shareText), "_blank")}
      >
        Share via WhatsApp
      </BigButton>

      <BigButton
        onClick={() => {
          setOffer({
            propertyId: property.id,
            buyerId: buyer.id,
            offerPrice: property.price,
            deposit: Math.round(property.price / 10),
            status: "DRAFT",
          });
          navigate({ to: "/offer" });
        }}
      >
        Create Offer
      </BigButton>
    </MobileShell>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-semibold text-primary" : "font-medium"}>{value}</span>
    </div>
  );
}
