import { createFileRoute, useParams } from "@tanstack/react-router";
import { FileText, Heart, LayoutGrid, Presentation, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

import MobileShell from "@/components/app/MobileShell";
import { BigButton, Panel, Row, Segmented, StepRow, Tag, whatsappLink } from "@/components/app/ui";
import YieldGoogleMap from "@/components/desk/YieldGoogleMap";
import {
  annualRent,
  communityName,
  grossYieldBps,
  photosFor,
  propertyById,
  statusFor,
  transactionsFor,
  verificationFor,
} from "@/data/app";
import { communityById } from "@/data/desk";
import {
  entryCosts,
  formatAed,
  formatAedCompact,
  formatBps,
  formatPsf,
  projectValue,
} from "@/lib/money";
import { useFlow } from "@/state/flow";

export const Route = createFileRoute("/property/$id")({
  head: () => ({
    meta: [
      { title: "Property Presentation — NorthGrid" },
      {
        name: "description",
        content:
          "Full client presentation for a Dubai unit: photos, floor plan, ROI, transaction history, verification and documents.",
      },
      { property: "og:title", content: "Property Presentation — NorthGrid" },
      {
        property: "og:description",
        content: "Present price, size, developer, yield and verified paperwork, then share by WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PropertyScreen,
});

const TABS = [
  { value: "map", label: "Map" },
  { value: "roi", label: "ROI" },
  { value: "tx", label: "Deals" },
  { value: "verify", label: "Verify" },
  { value: "docs", label: "Docs" },
] as const;

function PropertyScreen() {
  const { id } = useParams({ from: "/property/$id" });
  const { selectProperty, markViewed, shortlist, toggleShortlist, compare, toggleCompare } =
    useFlow();
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("map");
  const [photo, setPhoto] = useState(0);
  const [presenting, setPresenting] = useState(false);

  const property = propertyById(id);

  useEffect(() => {
    if (property) {
      selectProperty(property.id);
      markViewed(property.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!property) {
    return (
      <MobileShell title="Property" back>
        <Panel>
          <p className="text-sm text-muted-foreground">This unit is no longer in your inventory.</p>
        </Panel>
      </MobileShell>
    );
  }

  const photos = photosFor(property.id);
  const status = statusFor(property);
  const community = communityById(property.communityId);
  const costs = entryCosts(property.price);
  const shortlisted = shortlist.includes(property.id);
  const comparing = compare.includes(property.id);

  const shareText = `${property.title}
${communityName(property)} · ${property.developer}
${formatAedCompact(property.price)} · ${property.bedrooms} bed · ${property.sqft.toLocaleString()} sq.ft
Gross yield ${formatBps(grossYieldBps(property))} · Ref ${property.reference}`;

  return (
    <MobileShell
      title={presenting ? "Client Presentation" : property.title}
      subtitle={`${communityName(property)} · Ref ${property.reference}`}
      back
      trailing={
        <button
          type="button"
          onClick={() => setPresenting((v) => !v)}
          aria-label="Presentation mode"
          className="touch-target flex items-center justify-center rounded-xl border border-border px-3 text-primary"
        >
          <Presentation className="h-5 w-5" />
        </button>
      }
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <img
          src={photos[photo]}
          alt={`${property.title} view ${photo + 1}`}
          className={presenting ? "h-[46dvh] w-full object-cover" : "h-56 w-full object-cover"}
        />
        <div className="flex gap-2 p-3">
          {photos.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPhoto(i)}
              aria-label={`Photo ${i + 1}`}
              className={`h-12 w-16 overflow-hidden rounded-lg border ${
                i === photo ? "border-primary" : "border-border"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
          <div className="grid flex-1 place-items-center rounded-lg border border-dashed border-border text-[11px] uppercase tracking-widest text-muted-foreground">
            Floor plan
          </div>
        </div>
      </div>

      <Panel>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <p className="tabular text-2xl font-semibold tracking-tight text-primary">
              {formatAedCompact(property.price)}
            </p>
            <p className="tabular text-[12px] text-muted-foreground">
              {formatAed(property.price)} · {formatPsf(property.psf)}
            </p>
          </div>
          <Tag tone={status === "AVAILABLE" ? "primary" : status === "RESERVED" ? "warning" : "pink"}>
            {status.replace("_", " ")}
          </Tag>
        </div>
        <div className="tabular mt-4 grid grid-cols-2 gap-2 text-[13px]">
          <Stat label="Size" value={`${property.sqft.toLocaleString()} sq.ft`} />
          <Stat label="Bedrooms" value={String(property.bedrooms)} />
          <Stat label="Developer" value={property.developer} />
          <Stat
            label="Market"
            value={property.marketType === "OFF_PLAN" ? "Off-plan" : "Ready / secondary"}
          />
          <Stat label="Handover" value={property.plan?.handover ?? "Ready now"} />
          <Stat label="Gross yield" value={formatBps(grossYieldBps(property))} />
        </div>
      </Panel>

      <Segmented options={TABS} value={tab} onChange={setTab} />

      {tab === "map" ? (
        <div className="relative h-[42dvh] overflow-hidden rounded-2xl border border-border">
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

      {tab === "roi" ? (
        <Panel title="ROI & Yield" hint="Integer AED-cent math">
          <div className="tabular space-y-2 text-[14px]">
            <LineItem label="Purchase price" value={formatAed(property.price)} />
            <LineItem label="DLD transfer 4%" value={formatAed(costs.dld)} />
            <LineItem label="Agency 2%" value={formatAed(costs.agency)} />
            <LineItem label="Trustee & admin" value={formatAed(costs.trustee + costs.admin)} />
            <LineItem label="Total entry cost" value={formatAed(property.price + costs.total)} strong />
            <div className="h-px bg-border" />
            <LineItem label="Est. annual rent" value={formatAed(annualRent(property))} />
            <LineItem label="Gross yield" value={formatBps(grossYieldBps(property))} strong />
            <LineItem
              label="Projected value · 5 yrs"
              value={formatAedCompact(projectValue(property.price, property.annualGrowthBps, 5))}
            />
            <LineItem
              label="Capital growth p.a."
              value={formatBps(property.annualGrowthBps)}
              strong
            />
          </div>
        </Panel>
      ) : null}

      {tab === "tx" ? (
        <Panel title="Recent transactions" hint={`DLD registered · ${communityName(property)}`}>
          <div className="tabular space-y-2 text-[13px]">
            {transactionsFor(property).map((t) => (
              <div key={t.date} className="flex items-center gap-3 border-b border-border py-2 last:border-0">
                <span className="w-20 shrink-0 text-muted-foreground">{t.date}</span>
                <span className="min-w-0 flex-1 truncate">{t.unit}</span>
                <span className="shrink-0 font-semibold">{formatAedCompact(t.price)}</span>
              </div>
            ))}
            <p className="pt-2 text-[12px] text-muted-foreground">
              Community T12 volume {formatAedCompact(community?.ttmVolume ?? 0)} across{" "}
              {community?.ttmTransactions.toLocaleString()} deals.
            </p>
          </div>
        </Panel>
      ) : null}

      {tab === "verify" ? (
        <Panel title="Verification" hint="Compliance checklist">
          {verificationFor(property).map((v) => (
            <StepRow key={v.label} label={v.label} done={v.ok} />
          ))}
        </Panel>
      ) : null}

      {tab === "docs" ? (
        <Panel title="Documents">
          <div className="space-y-1">
            <Row title="Brochure & floor plans" subtitle="PDF · 4.2 MB" trailing={<FileText className="h-5 w-5 text-primary" />} />
            <Row title="Payment plan schedule" subtitle={property.plan?.headline ?? "Cash / mortgage"} trailing={<FileText className="h-5 w-5 text-primary" />} />
            <Row title="Title deed extract" subtitle="Uploaded 12 Aug 2026" trailing={<FileText className="h-5 w-5 text-primary" />} />
            {property.plan ? (
              <Row
                title="Escrow confirmation"
                subtitle={`${property.plan.escrowAccount} · ${property.plan.escrowStatus.toLowerCase()}`}
                trailing={<FileText className="h-5 w-5 text-primary" />}
              />
            ) : null}
          </div>
        </Panel>
      ) : null}

      <BigButton
        icon={<Share2 className="h-4 w-4" />}
        onClick={() => window.open(whatsappLink(shareText), "_blank")}
      >
        Share via WhatsApp
      </BigButton>

      <div className="grid grid-cols-2 gap-2">
        <BigButton
          tone="outline"
          icon={<LayoutGrid className="h-4 w-4" />}
          onClick={() => toggleCompare(property.id)}
        >
          {comparing ? "In compare" : "Compare"}
        </BigButton>
        <BigButton
          tone="outline"
          icon={<Heart className={`h-4 w-4 ${shortlisted ? "fill-current" : ""}`} />}
          onClick={() => toggleShortlist(property.id)}
        >
          {shortlisted ? "Shortlisted" : "Shortlist"}
        </BigButton>
      </div>

      <Panel title="Client interested?" hint="Move the viewing forward">
        <div className="space-y-2">
          <BigButton to="/client">Add / select client</BigButton>
          <BigButton
            tone="outline"
            onClick={() =>
              window.open(whatsappLink(`Following up on ${property.title} — ${shareText}`), "_blank")
            }
          >
            Not now · send notes by WhatsApp
          </BigButton>
        </div>
      </Panel>
    </MobileShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/40 px-3 py-2">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="truncate font-semibold">{value}</p>
    </div>
  );
}

function LineItem({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-semibold text-primary" : "font-medium"}>{value}</span>
    </div>
  );
}
