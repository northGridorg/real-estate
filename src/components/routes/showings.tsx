import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";

import MobileShell from "@/components/app/MobileShell";
import { BigButton, Panel, Row, Tag, whatsappLink } from "@/components/app/ui";
import { SHOWINGS, buyerById, communityName, propertyById } from "@/data/app";
import { formatAedCompact } from "@/lib/money";
import { useFlow } from "@/state/flow";

export const Route = createFileRoute("/showings")({
  head: () => ({
    meta: [
      { title: "Today's Showings — NorthGrid" },
      {
        name: "description",
        content: "Your scheduled Dubai property viewings for today with client and unit details.",
      },
      { property: "og:title", content: "Today's Showings — NorthGrid" },
      {
        property: "og:description",
        content: "Viewing schedule with client, unit, meeting point and quick WhatsApp confirmation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShowingsScreen,
});

function ShowingsScreen() {
  const { selectProperty, selectBuyer } = useFlow();

  return (
    <MobileShell title="Today's Showings" subtitle="Wed 16 Sep · 3 viewings" back>
      {SHOWINGS.map((s) => {
        const property = propertyById(s.propertyId)!;
        const buyer = buyerById(s.buyerId)!;
        return (
          <Panel
            key={s.id}
            title={`${s.time} · ${buyer.name}`}
            hint={s.place}
            trailing={<Tag tone="primary">Confirmed</Tag>}
          >
            <div className="space-y-3">
              <Row
                title={property.title}
                subtitle={`${communityName(property)} · ${property.bedrooms} bed · ${property.sqft.toLocaleString()} sq.ft`}
                value={formatAedCompact(property.price)}
                to="/property/$id"
                params={{ id: property.id }}
                onClick={() => {
                  selectProperty(property.id);
                  selectBuyer(buyer.id);
                }}
              />
              <div className="grid grid-cols-2 gap-2">
                <BigButton
                  tone="outline"
                  icon={<MapPin className="h-4 w-4" />}
                  onClick={() =>
                    window.open(
                      `https://maps.google.com/?q=${encodeURIComponent(s.place + ", Dubai")}`,
                      "_blank",
                    )
                  }
                >
                  Directions
                </BigButton>
                <BigButton
                  tone="outline"
                  onClick={() =>
                    window.open(
                      whatsappLink(
                        `Hi ${buyer.name}, confirming our viewing at ${s.time} today — ${property.title}, ${s.place}.`,
                      ),
                      "_blank",
                    )
                  }
                >
                  WhatsApp
                </BigButton>
              </div>
            </div>
          </Panel>
        );
      })}
    </MobileShell>
  );
}
