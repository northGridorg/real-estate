import { createFileRoute } from "@tanstack/react-router";
import { PartyPopper } from "lucide-react";

import MobileShell from "@/components/app/MobileShell";
import { BigButton, Panel, StepRow, whatsappLink } from "@/components/app/ui";
import { buyerById, communityName, propertyById } from "@/data/app";
import { formatAed } from "@/lib/money";
import { useFlow } from "@/state/flow";

export const Route = createFileRoute("/deal/complete")({
  head: () => ({
    meta: [
      { title: "Completion — NorthGrid" },
      {
        name: "description",
        content: "Final completion check: acceptance, offer, forms, signatures and payment confirmed.",
      },
      { property: "og:title", content: "Completion — NorthGrid" },
      {
        property: "og:description",
        content: "Close the Dubai property transaction and file it to client history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CompleteScreen,
});

function CompleteScreen() {
  const { offer, dealStage, docs, paymentReceived, completeDeal } = useFlow();
  const property = propertyById(offer.propertyId);
  const buyer = buyerById(offer.buyerId);
  const formsSigned = ["form-a", "form-b", "form-f"].every((id) => docs[id] === "SIGNED");

  const checks = [
    {
      label: "Client acceptance signed",
      done: ["ACCEPTANCE_SIGNED", "FORMS_DONE", "PAID", "COMPLETED"].includes(dealStage),
    },
    { label: "Offer accepted", done: offer.status === "ACCEPTED" },
    { label: "Forms completed", done: formsSigned },
    { label: "Signatures collected", done: formsSigned },
    { label: "Payment received", done: paymentReceived },
  ];
  const ready = checks.every((c) => c.done);
  const completed = dealStage === "COMPLETED";

  return (
    <MobileShell title="Completion" subtitle={property?.title ?? "No deal selected"} back>
      {completed ? (
        <Panel>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
              <PartyPopper className="h-8 w-8" />
            </span>
            <p className="text-xl font-semibold tracking-tight">Deal completed</p>
            <p className="tabular text-sm text-muted-foreground">
              {property?.title} · {formatAed(offer.offerPrice)}
            </p>
          </div>
        </Panel>
      ) : null}

      <Panel title="Final checks">
        {checks.map((c) => (
          <StepRow key={c.label} label={c.label} done={c.done} />
        ))}
      </Panel>

      <BigButton
        tone={ready && !completed ? "solid" : "ghost"}
        onClick={() => {
          if (ready && !completed) completeDeal();
        }}
      >
        {completed ? "Deal completed ✓" : ready ? "Complete Deal" : "Finish the outstanding steps"}
      </BigButton>

      {completed && buyer ? (
        <div className="grid gap-2">
          <BigButton
            tone="outline"
            onClick={() =>
              window.open(
                whatsappLink(
                  `Congratulations ${buyer.name}! ${property?.title} in ${
                    property ? communityName(property) : "Dubai"
                  } is now transferred at ${formatAed(offer.offerPrice)}.`,
                ),
                "_blank",
              )
            }
          >
            Send congratulations
          </BigButton>
          <BigButton tone="outline" to="/clients/$id" params={{ id: buyer.id }}>
            Open client history
          </BigButton>
        </div>
      ) : null}
    </MobileShell>
  );
}
