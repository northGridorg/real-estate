import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import MobileShell from "@/components/app/MobileShell";
import { BigButton, Field, Panel, Tag, inputCls } from "@/components/app/ui";
import { PAYMENT_METHODS, buyerById, communityName, propertyById } from "@/data/app";
import { aed, formatAed, formatAedCompact } from "@/lib/money";
import { useFlow } from "@/state/flow";

export const Route = createFileRoute("/offer")({
  head: () => ({
    meta: [
      { title: "Offer & Negotiation — NorthGrid" },
      {
        name: "description",
        content:
          "Build, send and counter offers on Dubai property with deposit, payment schedule and conditions.",
      },
      { property: "og:title", content: "Offer & Negotiation — NorthGrid" },
      {
        property: "og:description",
        content: "Offer price against asking, deposit, payment method and conditions in one sheet.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OfferScreen,
});

const toUnits = (cents: number) => Math.round(cents / 100);

function OfferScreen() {
  const navigate = useNavigate();
  const { offer, setOffer, setDealStage } = useFlow();
  const property = propertyById(offer.propertyId);
  const buyer = buyerById(offer.buyerId) ?? null;

  if (!property) {
    return (
      <MobileShell title="Offer" back>
        <Panel>
          <p className="text-sm text-muted-foreground">Start from a property to draft an offer.</p>
        </Panel>
        <BigButton to="/search">Find property</BigButton>
      </MobileShell>
    );
  }

  const delta = offer.offerPrice - property.price;

  return (
    <MobileShell
      title="Offer"
      subtitle={property.title}
      back
      trailing={<Tag tone={offer.status === "ACCEPTED" ? "primary" : "warning"}>{offer.status}</Tag>}
    >
      <Panel title="Deal parties">
        <div className="tabular space-y-2 text-[14px]">
          <Line label="Property" value={`${property.title}`} />
          <Line label="Community" value={communityName(property)} />
          <Line label="Buyer" value={buyer?.name ?? "Not selected"} />
          <Line label="Asking price" value={formatAed(property.price)} strong />
        </div>
      </Panel>

      <Panel title="Offer terms">
        <div className="space-y-4">
          <Field label="Offer price (AED)">
            <input
              type="number"
              className={inputCls}
              value={toUnits(offer.offerPrice)}
              onChange={(e) => setOffer({ offerPrice: aed(Number(e.target.value || 0)) })}
            />
          </Field>
          <p className={`tabular text-[12px] ${delta < 0 ? "text-status-pending" : "text-primary"}`}>
            {delta === 0
              ? "At asking price"
              : `${delta < 0 ? "Below" : "Above"} asking by ${formatAedCompact(Math.abs(delta))}`}
          </p>
          <Field label="Deposit (AED)">
            <input
              type="number"
              className={inputCls}
              value={toUnits(offer.deposit)}
              onChange={(e) => setOffer({ deposit: aed(Number(e.target.value || 0)) })}
            />
          </Field>
          <Field label="Payment method">
            <select
              className={inputCls}
              value={offer.method}
              onChange={(e) => setOffer({ method: e.target.value as typeof offer.method })}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Payment schedule">
            <textarea
              className={`${inputCls} min-h-[80px] py-2`}
              value={offer.schedule}
              onChange={(e) => setOffer({ schedule: e.target.value })}
            />
          </Field>
          <Field label="Conditions">
            <textarea
              className={`${inputCls} min-h-[96px] py-2`}
              value={offer.conditions}
              onChange={(e) => setOffer({ conditions: e.target.value })}
            />
          </Field>
        </div>
      </Panel>

      <div className="space-y-2">
        <BigButton tone="outline" onClick={() => toast.success("Draft saved to the deal file")}>
          Save Draft
        </BigButton>
        <BigButton
          onClick={() => {
            setOffer({ status: "SENT" });
            setDealStage("OFFER");
            toast.success("Offer sent to the seller's broker");
          }}
        >
          Send Offer
        </BigButton>
        <BigButton
          tone="outline"
          onClick={() => {
            setOffer({
              status: "COUNTERED",
              offerPrice: offer.offerPrice + Math.round(property.price / 50),
            });
            toast("Counter received — price updated");
          }}
        >
          Counter Offer
        </BigButton>
        <BigButton
          onClick={() => {
            setOffer({ status: "ACCEPTED" });
            setDealStage("ACCEPTED");
            navigate({ to: "/deal" });
          }}
        >
          Accept
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
