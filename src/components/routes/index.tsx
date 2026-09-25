import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, Handshake, MapPin, Search, Users } from "lucide-react";

import MobileShell from "@/components/app/MobileShell";
import { Panel, Row, Tag, Tile } from "@/components/app/ui";
import {
  SHOWINGS,
  buyerById,
  communityName,
  propertyById,
  statusFor,
} from "@/data/app";
import { formatAedCompact } from "@/lib/money";
import { useFlow } from "@/state/flow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today — NorthGrid Broker Desk" },
      {
        name: "description",
        content:
          "Your broker day at a glance: find property, clients, today's showings and active Dubai deals.",
      },
      { property: "og:title", content: "Today — NorthGrid Broker Desk" },
      {
        property: "og:description",
        content: "Mobile broker home for Dubai property: showings, saved units and live deals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TodayScreen,
});

function TodayScreen() {
  const { recent, shortlist, selectProperty, dealStage, offer, signedIn } = useFlow();
  const saved = shortlist.map(propertyById).filter(Boolean);
  const recents = recent.map(propertyById).filter(Boolean);
  const dealLive = dealStage !== "NONE" && dealStage !== "COMPLETED";

  return (
    <MobileShell
      title="Today"
      subtitle="Wed 16 Sep · Y. Haddad"
      trailing={
        signedIn ? (
          <Tag tone="primary">On desk</Tag>
        ) : (
          <Link
            to="/login"
            className="touch-target flex items-center rounded-xl px-3 text-[13px] font-semibold text-primary"
          >
            Sign in
          </Link>
        )
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Tile to="/search" label="Find Property" hint="Map & list search" icon={<Search className="h-5 w-5" />} />
        <Tile to="/clients" label="Clients" hint="Requirements & history" icon={<Users className="h-5 w-5" />} />
        <Tile
          to="/showings"
          label="Today's Showings"
          hint={`${SHOWINGS.length} scheduled`}
          icon={<CalendarClock className="h-5 w-5" />}
        />
        <Tile
          to="/deal"
          label="Active Deals"
          hint={dealLive ? "1 in progress" : "None in progress"}
          icon={<Handshake className="h-5 w-5" />}
        />
      </div>

      {dealLive ? (
        <Panel title="Deal in progress" hint={offer.status.toLowerCase()}>
          <Row
            title={propertyById(offer.propertyId)?.title ?? "Unassigned unit"}
            subtitle={buyerById(offer.buyerId)?.name ?? "No buyer selected"}
            value={offer.offerPrice ? formatAedCompact(offer.offerPrice) : undefined}
            to="/deal"
          />
        </Panel>
      ) : null}

      <Panel title="Next showing" hint={`${SHOWINGS[0].time} · ${SHOWINGS[0].place}`}>
        <Row
          title={propertyById(SHOWINGS[0].propertyId)?.title ?? ""}
          subtitle={buyerById(SHOWINGS[0].buyerId)?.name}
          to="/showings"
          trailing={<MapPin className="h-5 w-5 text-primary" />}
        />
      </Panel>

      <Panel title="Saved properties" hint="Shortlisted for clients">
        <div className="space-y-1">
          {saved.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing shortlisted yet.</p>
          ) : (
            saved.map((p) => (
              <Row
                key={p!.id}
                title={p!.title}
                subtitle={`${communityName(p!)} · ${p!.bedrooms} bed · ${statusFor(p!).replace("_", " ").toLowerCase()}`}
                value={formatAedCompact(p!.price)}
                to="/property/$id"
                onClick={() => selectProperty(p!.id)}
              />
            ))
          )}
        </div>
      </Panel>

      <Panel title="Recently viewed">
        <div className="space-y-1">
          {recents.map((p) => (
            <Row
              key={p!.id}
              title={p!.title}
              subtitle={`${communityName(p!)} · ${p!.sqft.toLocaleString()} sq.ft`}
              value={formatAedCompact(p!.price)}
              to="/property/$id"
              onClick={() => selectProperty(p!.id)}
            />
          ))}
        </div>
      </Panel>
    </MobileShell>
  );
}
