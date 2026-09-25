import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";

import MobileShell from "@/components/app/MobileShell";
import { Panel, Tag } from "@/components/app/ui";
import type { Buyer } from "@/data/app";
import { formatAed } from "@/lib/money";
import { useFlow } from "@/state/flow";

export const Route = createFileRoute("/clients")({
  head: () => ({
    meta: [
      { title: "Clients — NorthGrid Broker Desk" },
      {
        name: "description",
        content:
          "Buyer directory with budget, funding, purpose, preferred communities and bedroom requirements.",
      },
      { property: "og:title", content: "Clients — NorthGrid Broker Desk" },
      {
        property: "og:description",
        content: "Every buyer with their requirements, viewings, offers and deal history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClientsScreen,
});

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="text-[13px] text-foreground">{value}</p>
    </div>
  );
}

function BuyerCard({ buyer, onSelect }: { buyer: Buyer; onSelect: () => void }) {
  const r = buyer.requirements;
  const low = Math.round(r.budget * 0.8);
  return (
    <Link
      to="/clients/$id"
      params={{ id: buyer.id }}
      onClick={onSelect}
      className="flex flex-col rounded-2xl border border-border bg-card p-4 transition-colors active:bg-secondary/50"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground text-[15px] font-semibold text-background">
          {buyer.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold tracking-tight">{buyer.name}</p>
          <p className="truncate text-[12px] text-muted-foreground">{buyer.phone}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Tag tone="primary">Active</Tag>
          <Tag tone="muted">{buyer.tag}</Tag>
        </div>
      </div>


      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-3">
        <Detail label="Budget" value={`${formatAed(low)} – ${formatAed(r.budget)}`} />
        <Detail label="Intent" value={r.purpose === "INVESTMENT" ? "Investment" : "Living"} />
        <Detail label="Payment" value={r.funding === "CASH" ? "Cash" : "Mortgage"} />
        <Detail label="Location" value={r.locations[0] ?? "Any"} />
      </div>
    </Link>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "touch-target rounded-full bg-primary px-4 text-[12px] font-semibold text-primary-foreground"
          : "touch-target rounded-full border border-border bg-card px-4 text-[12px] font-semibold text-muted-foreground"
      }
    >
      {label}
    </button>
  );
}

const SEGMENTS = ["Investor", "Family Office", "HNW Individual", "First-time Buyer"] as const;


function ClientsScreen() {
  const { buyers, selectBuyer } = useFlow();
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return buyers.filter((b) => {
      if (segment && b.tag !== segment) return false;
      if (!q) return true;
      return [b.name, b.phone, b.tag, ...b.requirements.locations]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [buyers, query, segment]);


  return (
    <MobileShell
      title="Clients"
      subtitle="CRM"
      fullBleed
      trailing={
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clients..."
              aria-label="Search clients"
              className="touch-target w-[220px] max-w-[42vw] rounded-xl border border-border bg-card pl-9 pr-3 text-[14px] text-foreground outline-none focus:border-primary/70"
            />
          </div>
          <Link
            to="/client"
            className="touch-target flex items-center gap-2 rounded-xl bg-primary px-4 text-[14px] font-semibold text-primary-foreground"
          >
            <UserPlus className="h-4 w-4" />
            New Client
          </Link>
        </div>
      }
    >
      <div className="space-y-5 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Filter
          </span>
          <FilterChip label="All" active={segment === null} onClick={() => setSegment(null)} />
          {SEGMENTS.map((s) => (
            <FilterChip
              key={s}
              label={s}
              active={segment === s}
              onClick={() => setSegment(segment === s ? null : s)}
            />
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((b) => (
            <BuyerCard key={b.id} buyer={b} onSelect={() => selectBuyer(b.id)} />
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className="text-[14px] text-muted-foreground">No clients match this filter.</p>
        ) : null}
      </div>

    </MobileShell>
  );
}
