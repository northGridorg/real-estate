import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import MobileShell from "@/components/app/MobileShell";
import { BigButton, Panel, Segmented, StepRow, Tag } from "@/components/app/ui";
import { buyerById, communityName, propertyById, statusFor } from "@/data/app";
import { formatAed, formatAedCompact } from "@/lib/money";
import { useDealChecklist, useFlow } from "@/state/flow";

export const Route = createFileRoute("/deal/")({
  head: () => ({
    meta: [
      { title: "Deal Workspace — NorthGrid" },
      {
        name: "description",
        content:
          "Track an accepted Dubai property deal through acceptance, forms, signatures, payment and completion.",
      },
      { property: "og:title", content: "Deal Workspace — NorthGrid" },
      {
        property: "og:description",
        content: "Property, client and offer tabs plus an eight-step transaction checklist.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DealWorkspace,
});

const TABS = [
  { value: "property", label: "Property" },
  { value: "client", label: "Client" },
  { value: "offer", label: "Offer" },
] as const;

function DealWorkspace() {
  const { offer, dealStage } = useFlow();
  const steps = useDealChecklist();
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("property");

  const property = propertyById(offer.propertyId);
  const buyer = buyerById(offer.buyerId);

  if (!property) {
    return (
      <MobileShell title="Deals" subtitle="No active deal">
        <Panel>
          <p className="text-sm text-muted-foreground">
            Once an offer is accepted, the deal workspace opens here with the full checklist.
          </p>
        </Panel>
        <BigButton to="/search">Find property</BigButton>
      </MobileShell>
    );
  }

  return (
    <MobileShell
      title="Deal Workspace"
      subtitle={property.title}
      trailing={
        <Tag tone={dealStage === "COMPLETED" ? "primary" : "warning"}>
          {dealStage.replace("_", " ")}
        </Tag>
      }
    >
      <Segmented options={TABS} value={tab} onChange={setTab} />

      {tab === "property" ? (
        <Panel title="Property">
          <div className="tabular space-y-2 text-[14px]">
            <Line label="Unit" value={property.title} />
            <Line label="Community" value={communityName(property)} />
            <Line label="Developer" value={property.developer} />
            <Line label="Status" value={statusFor(property).replace("_", " ")} />
            <Line label="Asking" value={formatAed(property.price)} />
          </div>
        </Panel>
      ) : null}

      {tab === "client" ? (
        <Panel title="Buyer">
          <div className="tabular space-y-2 text-[14px]">
            <Line label="Name" value={buyer?.name ?? "—"} />
            <Line label="Mobile" value={buyer?.phone ?? "—"} />
            <Line label="Segment" value={buyer?.tag ?? "—"} />
            <Line
              label="Budget"
              value={buyer ? formatAedCompact(buyer.requirements.budget) : "—"}
            />
          </div>
        </Panel>
      ) : null}

      {tab === "offer" ? (
        <Panel title="Agreed offer">
          <div className="tabular space-y-2 text-[14px]">
            <Line label="Offer price" value={formatAed(offer.offerPrice)} strong />
            <Line label="Deposit" value={formatAed(offer.deposit)} />
            <Line label="Method" value={offer.method} />
            <Line label="Schedule" value={offer.schedule} />
            <Line label="Conditions" value={offer.conditions} />
          </div>
        </Panel>
      ) : null}

      <Panel title="Transaction checklist" hint={`${steps.filter((s) => s.done).length}/9 complete`}>
        {steps.map((s) => (
          <StepRow key={s.label} label={s.label} done={s.done} />
        ))}
      </Panel>

      <div className="space-y-2">
        <BigButton to="/deal/acceptance">Client Acceptance</BigButton>
        <BigButton tone="outline" to="/deal/forms">
          Forms & Documents
        </BigButton>
        <BigButton tone="outline" to="/deal/payment">
          Payment Information
        </BigButton>
        <BigButton tone="outline" to="/deal/complete">
          Completion
        </BigButton>
      </div>
    </MobileShell>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className={`min-w-0 text-right ${strong ? "font-semibold text-primary" : "font-medium"}`}>
        {value}
      </span>
    </div>
  );
}
