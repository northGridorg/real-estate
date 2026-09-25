import { createFileRoute, useParams } from "@tanstack/react-router";
import { FileText } from "lucide-react";

import MobileShell from "@/components/app/MobileShell";
import { BigButton, Panel, Row, Tag } from "@/components/app/ui";
import { DOC_TEMPLATES, communityName, propertyById } from "@/data/app";
import { formatAedCompact } from "@/lib/money";
import { useFlow } from "@/state/flow";

export const Route = createFileRoute("/clients/$id")({
  head: () => ({
    meta: [
      { title: "Client History — NorthGrid" },
      {
        name: "description",
        content:
          "Client file: properties viewed, shortlist, offers, active deals, completed deals and documents.",
      },
      { property: "og:title", content: "Client History — NorthGrid" },
      {
        property: "og:description",
        content: "One buyer timeline from first viewing to completed Dubai property transfer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClientHistoryScreen,
});

function ClientHistoryScreen() {
  const { id } = useParams({ from: "/clients/$id" });
  const { buyers, viewings, shortlist, offer, completedDeals, dealStage, selectBuyer, docs } =
    useFlow();
  const buyer = buyers.find((b) => b.id === id);

  if (!buyer) {
    return (
      <MobileShell title="Client" back>
        <Panel>
          <p className="text-sm text-muted-foreground">This client is no longer on your desk.</p>
        </Panel>
      </MobileShell>
    );
  }

  const viewed = viewings.filter((v) => v.buyerId === buyer.id);
  const saved = shortlist.map(propertyById).filter(Boolean);
  const offers = offer.buyerId === buyer.id && offer.propertyId ? [offer] : [];
  const active = offers.filter(() => dealStage !== "NONE" && dealStage !== "COMPLETED");
  const done = completedDeals.filter((d) => d.buyerId === buyer.id);

  return (
    <MobileShell title={buyer.name} subtitle={buyer.phone} back trailing={<Tag tone="primary">{buyer.tag}</Tag>}>
      <Panel title="Requirements">
        <div className="tabular grid grid-cols-2 gap-2 text-[13px]">
          <Cell label="Budget" value={formatAedCompact(buyer.requirements.budget)} />
          <Cell label="Funding" value={buyer.requirements.funding === "CASH" ? "Cash" : "Mortgage"} />
          <Cell
            label="Purpose"
            value={buyer.requirements.purpose === "INVESTMENT" ? "Investment" : "Own living"}
          />
          <Cell label="Bedrooms" value={`${buyer.requirements.bedrooms}+`} />
          <Cell label="Locations" value={buyer.requirements.locations.join(", ")} />
          <Cell label="Notes" value={buyer.requirements.notes} />
        </div>
      </Panel>

      <Panel title={`Properties viewed · ${viewed.length}`}>
        {viewed.length === 0 ? (
          <p className="text-sm text-muted-foreground">No viewings logged yet.</p>
        ) : (
          <div className="space-y-1">
            {viewed.map((v) => {
              const p = propertyById(v.propertyId);
              return (
                <Row
                  key={v.id}
                  title={p?.title ?? "Unit"}
                  subtitle={`${v.date} · ${v.interested ? "Interested" : "Not interested"}`}
                  to="/property/$id"
                  params={{ id: v.propertyId }}
                />
              );
            })}
          </div>
        )}
      </Panel>

      <Panel title={`Shortlisted · ${saved.length}`}>
        <div className="space-y-1">
          {saved.map((p) => (
            <Row
              key={p!.id}
              title={p!.title}
              subtitle={communityName(p!)}
              value={formatAedCompact(p!.price)}
              to="/property/$id"
              params={{ id: p!.id }}
            />
          ))}
          {saved.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing shortlisted.</p>
          ) : null}
        </div>
      </Panel>

      <Panel title={`Offers · ${offers.length}`}>
        {offers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No offers submitted.</p>
        ) : (
          offers.map((o) => (
            <Row
              key={o.propertyId}
              title={propertyById(o.propertyId)?.title ?? "Unit"}
              subtitle={o.status.toLowerCase()}
              value={formatAedCompact(o.offerPrice)}
              to="/offer"
            />
          ))
        )}
      </Panel>

      <Panel title={`Active deals · ${active.length}`}>
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">No deal in progress.</p>
        ) : (
          <Row
            title={propertyById(active[0].propertyId)?.title ?? "Unit"}
            subtitle={dealStage.replace("_", " ").toLowerCase()}
            to="/deal"
          />
        )}
      </Panel>

      <Panel title={`Completed deals · ${done.length}`}>
        {done.length === 0 ? (
          <p className="text-sm text-muted-foreground">No completions yet.</p>
        ) : (
          done.map((d, i) => (
            <Row
              key={i}
              title={propertyById(d.propertyId)?.title ?? "Unit"}
              subtitle="Transfer completed"
              value={formatAedCompact(d.price)}
            />
          ))
        )}
      </Panel>

      <Panel title="Documents">
        <div className="space-y-1">
          {DOC_TEMPLATES.map((d) => (
            <Row
              key={d.id}
              title={d.label}
              subtitle={`${d.hint} · ${docs[d.id].toLowerCase()}`}
              trailing={<FileText className="h-5 w-5 text-primary" />}
            />
          ))}
        </div>
      </Panel>

      <BigButton to="/client" onClick={() => selectBuyer(buyer.id)}>
        Open viewing form
      </BigButton>
    </MobileShell>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/40 px-3 py-2">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
