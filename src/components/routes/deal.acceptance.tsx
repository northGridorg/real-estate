import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { toast } from "sonner";

import MobileShell from "@/components/app/MobileShell";
import { BigButton, Panel } from "@/components/app/ui";
import { buyerById, communityName, propertyById } from "@/data/app";
import { formatAed } from "@/lib/money";
import { useFlow } from "@/state/flow";

export const Route = createFileRoute("/deal/acceptance")({
  head: () => ({
    meta: [
      { title: "Client Acceptance — NorthGrid" },
      {
        name: "description",
        content: "Purchase summary for the buyer to review, request changes, or accept in one tap.",
      },
      { property: "og:title", content: "Client Acceptance — NorthGrid" },
      {
        property: "og:description",
        content: "Agreed price, deposit, payment method, completion date and important terms.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AcceptanceScreen,
});

function AcceptanceScreen() {
  const navigate = useNavigate();
  const { offer, setDealStage } = useFlow();
  const property = propertyById(offer.propertyId);
  const buyer = buyerById(offer.buyerId);

  if (!property) {
    return (
      <MobileShell title="Client Acceptance" back>
        <Panel>
          <p className="text-sm text-muted-foreground">No deal to accept yet.</p>
        </Panel>
      </MobileShell>
    );
  }

  return (
    <MobileShell title="Client Acceptance" subtitle={buyer?.name ?? property.title} back>
      <Panel title="Purchase summary" hint="Please review carefully">
        <div className="tabular space-y-2 text-[15px]">
          <Line label="Property" value={`${property.title}, ${communityName(property)}`} />
          <Line label="Agreed price" value={formatAed(offer.offerPrice)} strong />
          <Line label="Deposit" value={formatAed(offer.deposit)} />
          <Line label="Payment method" value={offer.method} />
          <Line label="Completion" value="Within 30 days of MOU signature" />
        </div>
      </Panel>

      <Panel title="Important terms">
        <p className="text-[14px] leading-relaxed text-muted-foreground">{offer.conditions}</p>
        <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
          Deposit is held with the registered trustee. DLD transfer fee of 4% and trustee charges are
          payable by the buyer unless agreed otherwise in Form F.
        </p>
      </Panel>

      <div className="grid gap-2">
        <BigButton tone="outline" onClick={() => toast("Change request sent to the broker")}>
          Request Changes
        </BigButton>
        <BigButton
          icon={<Check className="h-4 w-4" />}
          onClick={() => {
            setDealStage("ACCEPTANCE_SIGNED");
            toast.success("Client acceptance recorded");
            navigate({ to: "/deal/forms" });
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
