import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Upload } from "lucide-react";
import { toast } from "sonner";

import MobileShell from "@/components/app/MobileShell";
import { BigButton, Panel, StepRow, Tag } from "@/components/app/ui";
import { propertyById } from "@/data/app";
import { formatAed } from "@/lib/money";
import { useFlow } from "@/state/flow";

export const Route = createFileRoute("/deal/payment")({
  head: () => ({
    meta: [
      { title: "Payment — NorthGrid" },
      {
        name: "description",
        content: "Purchase price, deposit, method and schedule with proof upload and receipt marking.",
      },
      { property: "og:title", content: "Payment — NorthGrid" },
      {
        property: "og:description",
        content: "Confirm deposit and balance payments before DLD transfer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaymentScreen,
});

function PaymentScreen() {
  const navigate = useNavigate();
  const { offer, paymentProof, setPaymentProof, paymentReceived, setPaymentReceived, setDealStage } =
    useFlow();
  const property = propertyById(offer.propertyId);
  const balance = offer.offerPrice - offer.deposit;

  return (
    <MobileShell
      title="Payment"
      subtitle={property?.title ?? "No deal selected"}
      back
      trailing={<Tag tone={paymentReceived ? "primary" : "warning"}>{paymentReceived ? "RECEIVED" : "PENDING"}</Tag>}
    >
      <Panel title="Amounts">
        <div className="tabular space-y-2 text-[15px]">
          <Line label="Purchase price" value={formatAed(offer.offerPrice)} strong />
          <Line label="Deposit" value={formatAed(offer.deposit)} />
          <Line label="Balance on transfer" value={formatAed(balance)} />
          <Line label="Payment method" value={offer.method} />
        </div>
      </Panel>

      <Panel title="Payment schedule">
        <p className="text-[14px] leading-relaxed text-muted-foreground">{offer.schedule}</p>
        <div className="mt-3">
          <StepRow label="Deposit to trustee" done={paymentProof} />
          <StepRow label="Balance cleared" done={paymentReceived} />
        </div>
      </Panel>

      <div className="grid gap-2">
        <BigButton
          tone="outline"
          icon={<Upload className="h-4 w-4" />}
          onClick={() => {
            setPaymentProof(true);
            toast.success("Payment proof uploaded");
          }}
        >
          Upload Proof
        </BigButton>
        <BigButton
          icon={<Check className="h-4 w-4" />}
          onClick={() => {
            setPaymentReceived(true);
            setDealStage("PAID");
            toast.success("Payment marked received");
          }}
        >
          Mark Payment Received
        </BigButton>
        <BigButton
          tone={paymentReceived ? "solid" : "ghost"}
          onClick={() => {
            if (!paymentReceived) {
              toast.error("Mark the payment received first");
              return;
            }
            navigate({ to: "/deal/complete" });
          }}
        >
          Continue →
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
