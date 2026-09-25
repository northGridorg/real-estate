import { createFileRoute } from "@tanstack/react-router";
import {
  Bath,
  BedDouble,
  MapPin,
  Maximize2,
  PanelRightClose,
  PanelRightOpen,

  Search as SearchIcon,
  Share2,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import MobileShell from "@/components/app/MobileShell";
import { Field, Segmented, Tag, inputCls, whatsappLink } from "@/components/app/ui";
import YieldGoogleMap from "@/components/desk/YieldGoogleMap";
import {
  PROPERTIES,
  communityName,
  grossYieldBps,
  photosFor,
  statusFor,
  type Asset,
} from "@/data/app";
import { COMMUNITIES } from "@/data/desk";
import { aed, formatAed, formatBps } from "@/lib/money";
import { useFlow } from "@/state/flow";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Property Search — Dubai Off-Plan & Ready" },
      {
        name: "description",
        content:
          "Search Dubai secondary and off-plan stock on a live map or list, filtered by price, bedrooms, community and yield.",
      },
      { property: "og:title", content: "Property Search — Dubai Off-Plan & Ready" },
      {
        property: "og:description",
        content: "Map and list search across Downtown, Marina, Palm Jumeirah, Business Bay, DIFC and JVC.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchScreen,
});

const VIEWS = [
  { value: "map", label: "Map" },
  { value: "list", label: "List" },
] as const;

function SearchScreen() {
  const { selectProperty, selectedPropertyId } = useFlow();
  const [view, setView] = useState<"list" | "map">("map");
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showList, setShowList] = useState(true);
  const [maxPrice, setMaxPrice] = useState(60);
  const [beds, setBeds] = useState(0);
  const [market, setMarket] = useState<"ALL" | "OFF_PLAN" | "SECONDARY_READY">("ALL");
  const [community, setCommunity] = useState("all");
  const [status, setStatus] = useState("all");

  const results = useMemo(
    () =>
      PROPERTIES.filter((p) => {
        if (p.price > aed(maxPrice * 1_000_000)) return false;
        if (beds && p.bedrooms < beds) return false;
        if (market !== "ALL" && p.marketType !== market) return false;
        if (community !== "all" && p.communityId !== community) return false;
        if (status !== "all" && statusFor(p) !== status) return false;
        if (query.trim()) {
          const hay = `${p.title} ${communityName(p)} ${p.developer} ${p.reference}`.toLowerCase();
          if (!hay.includes(query.trim().toLowerCase())) return false;
        }
        return true;
      }),
    [maxPrice, beds, market, community, status, query],
  );

  // A map marker click should reveal that property's card in the listings panel.
  useEffect(() => {
    if (selectedPropertyId) setShowList(true);
  }, [selectedPropertyId]);



  return (
    <MobileShell
      fullBleed
      title="Find Property"
      subtitle={`${results.length} of ${PROPERTIES.length} units`}
      back
    >

      <div
        className={`grid h-[calc(100dvh-198px)] grid-cols-1 sm:h-[calc(100dvh-104px)] ${
          showList ? "lg:grid-cols-[minmax(0,1fr)_400px]" : "lg:grid-cols-1"
        }`}
      >
        {/* Map pane */}
        <section className={`relative min-h-0 ${view === "map" ? "block" : "hidden"} lg:block`}>
          <YieldGoogleMap
            assets={results}
            matchIds={new Set(results.map((r) => r.id))}
            selectedId={selectedPropertyId}
            onSelect={selectProperty}
            satellite={false}
            heat
          />

          {/* Floating search + filters */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-3 sm:p-4">
            <div className="pointer-events-auto mx-auto flex w-full max-w-[720px] gap-2">
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tower, community, developer, ref"
                  className={`${inputCls} bg-card/95 pl-9 shadow-lg backdrop-blur`}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                aria-label="Filters"
                className="touch-target flex items-center justify-center rounded-xl border border-border bg-card/95 px-3 text-muted-foreground shadow-lg backdrop-blur"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>
            </div>

            {showFilters ? (
              <div className="pointer-events-auto mx-auto mt-2 w-full max-w-[720px] space-y-4 rounded-2xl border border-border bg-card/98 p-4 shadow-xl backdrop-blur">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Filters
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    aria-label="Close filters"
                    className="touch-target flex items-center justify-center rounded-xl text-muted-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <Field label={`Max price · AED ${maxPrice}M`}>
                  <input
                    type="range"
                    min={1}
                    max={60}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="h-10 w-full accent-[var(--color-primary)]"
                  />
                </Field>
                <Field label="Minimum bedrooms">
                  <Segmented
                    options={[
                      { value: "0", label: "Any" },
                      { value: "1", label: "1+" },
                      { value: "2", label: "2+" },
                      { value: "3", label: "3+" },
                      { value: "5", label: "5+" },
                    ]}
                    value={String(beds)}
                    onChange={(v) => setBeds(Number(v))}
                  />
                </Field>
                <Field label="Market">
                  <Segmented
                    options={[
                      { value: "ALL", label: "All" },
                      { value: "SECONDARY_READY", label: "Ready" },
                      { value: "OFF_PLAN", label: "Off-plan" },
                    ]}
                    value={market}
                    onChange={setMarket}
                  />
                </Field>
              </div>
            ) : null}
          </div>

          {/* Mobile view toggle */}
          <div className="absolute inset-x-0 bottom-3 z-10 px-3 lg:hidden">
            <div className="mx-auto max-w-[320px] rounded-xl bg-card/95 p-1 shadow-lg backdrop-blur">
              <Segmented options={VIEWS} value={view} onChange={setView} />
            </div>
          </div>

          {!showList ? (
            <button
              type="button"
              onClick={() => setShowList(true)}
              aria-label="Show listings"
              className="touch-target absolute right-4 top-4 z-30 hidden items-center justify-center rounded-xl border border-border bg-card/95 px-3 text-muted-foreground shadow-lg backdrop-blur lg:flex"
            >
              <PanelRightOpen className="h-5 w-5" />
            </button>
          ) : null}

        </section>

        {/* Listings pane */}
        <aside
          className={`min-h-0 flex-col border-border bg-card lg:flex lg:border-l ${
            view === "list" ? "flex" : "hidden"
          } ${showList ? "" : "lg:hidden"}`}
        >
          <div className="shrink-0 space-y-3 border-b border-border px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-semibold uppercase tracking-[0.08em]">
                Property Listings
              </p>
              <button
                type="button"
                onClick={() => setShowList(false)}
                aria-label="Collapse listings"
                className="touch-target -mr-2 hidden items-center justify-center rounded-xl text-muted-foreground active:bg-secondary lg:flex"
              >
                <PanelRightClose className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={community}
                onChange={(e) => setCommunity(e.target.value)}
                className={`${inputCls} text-[13px]`}
                aria-label="Community"
              >
                <option value="all">All areas</option>
                {COMMUNITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`${inputCls} text-[13px]`}
                aria-label="Status"
              >
                <option value="all">All status</option>
                <option value="AVAILABLE">Available</option>
                <option value="RESERVED">Reserved</option>
                <option value="UNDER_OFFER">Under offer</option>
              </select>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {results.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  selected={p.id === selectedPropertyId}
                  onSelect={() => selectProperty(p.id)}
                />
              ))}
            </div>

            {results.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                No units match these filters. Widen the budget or community.
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </MobileShell>
  );
}

function PropertyCard({
  property,
  onSelect,
  selected = false,
}: {
  property: Asset;
  onSelect: () => void;
  selected?: boolean;
}) {
  const status = statusFor(property);
  const { shortlist, toggleShortlist } = useFlow();
  const saved = shortlist.includes(property.id);
  const ref = useRef<HTMLElement | null>(null);
  const share = whatsappLink(
    `${property.title} — ${communityName(property)}\n${formatAed(property.price)}\n${property.bedrooms} bd · ${property.sqft.toLocaleString()} sq.ft · ${formatBps(grossYieldBps(property))} gross yield`,
  );

  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selected]);

  return (
    <article
      ref={ref}
      className={`relative overflow-hidden rounded-2xl border bg-card transition ${
        selected ? "border-primary ring-2 ring-primary/40" : "border-border"
      }`}
    >

      <Link
        to="/property/$id"
        params={{ id: property.id }}
        onClick={onSelect}
        className="block active:bg-secondary/40"
      >
        <div className="relative">
          <img
            src={photosFor(property.id)[0]}
            alt={property.title}
            loading="lazy"
            className="h-[168px] w-full object-cover"
          />
          <span className="absolute left-3 top-3">
            <Tag
              tone={status === "AVAILABLE" ? "primary" : status === "RESERVED" ? "warning" : "pink"}
            >
              {status.replace("_", " ")}
            </Tag>
          </span>
        </div>

        <div className="space-y-2 p-3">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <h3 className="truncate text-[16px] font-semibold tracking-tight">{property.title}</h3>
            <span className="tabular shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
              {formatBps(grossYieldBps(property))} Yield
            </span>
          </div>
          <p className="flex items-center gap-1.5 truncate text-[12px] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {communityName(property)}
          </p>
          <div className="tabular flex items-center gap-4 text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BedDouble className="h-3.5 w-3.5" />
              {property.bedrooms}
            </span>
            <span className="flex items-center gap-1.5">
              <Bath className="h-3.5 w-3.5" />
              {property.bedrooms + 1}
            </span>
            <span className="flex items-center gap-1.5">
              <Maximize2 className="h-3.5 w-3.5" />
              {property.sqft.toLocaleString()} sq.ft
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2.5">
            <p className="tabular text-[15px] font-semibold tracking-tight">
              {formatAed(property.price).replace(".00", "")}
            </p>
            <span className="h-5 w-16" aria-hidden />
          </div>
        </div>
      </Link>

      <button
        type="button"
        aria-label={saved ? "Remove from shortlist" : "Add to shortlist"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleShortlist(property.id);
        }}
        className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-card/95 shadow-md backdrop-blur"
      >
        <Star
          className={`h-5 w-5 ${saved ? "fill-status-pending text-status-pending" : "text-muted-foreground"}`}
        />
      </button>

      <a
        href={share}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] font-semibold text-primary"
      >
        <Share2 className="h-3.5 w-3.5" />
        Share
      </a>
    </article>
  );
}
