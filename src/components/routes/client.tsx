import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import MobileShell from "@/components/app/MobileShell";
import { BigButton, Field, Panel, Row, Segmented, inputCls } from "@/components/app/ui";
import { communityName, propertyById } from "@/data/app";
import { COMMUNITIES } from "@/data/desk";
import { aed, formatAedCompact } from "@/lib/money";
import { useFlow } from "@/state/flow";

export const Route = createFileRoute("/client")({
  head: () => ({
    meta: [
      { title: "Client & Viewing — NorthGrid" },
      {
        name: "description",
        content:
          "Capture buyer requirements, log the viewing and record interest against the selected Dubai unit.",
      },
      { property: "og:title", content: "Client & Viewing — NorthGrid" },
      {
        property: "og:description",
        content: "Budget, funding, purpose, location and bedroom needs plus a viewing form and notes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClientViewingScreen,
});

function ClientViewingScreen() {
  const navigate = useNavigate();
  const {
    buyers,
    activeBuyerId,
    selectBuyer,
    addBuyer,
    updateRequirements,
    selectedPropertyId,
    logViewing,
  } = useFlow();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [interested, setInterested] = useState<boolean | null>(null);

  const property = propertyById(selectedPropertyId);
  const buyer = buyers.find((b) => b.id === activeBuyerId);

  const createClient = () => {
    if (!name.trim()) {
      toast.error("Add the client's name first");
      return;
    }
    addBuyer({
      name: name.trim(),
      phone: phone.trim() || "+971 ",
      tag: "Investor",
      requirements: {
        budget: aed(3_000_000),
        funding: "CASH",
        purpose: "INVESTMENT",
        locations: ["Dubai Marina"],
        bedrooms: 2,
        notes: "",
      },
    });
    setCreating(false);
    setName("");
    setPhone("");
    toast.success("Client added");
  };

  const cont = () => {
    if (!buyer) {
      toast.error("Select or add a client first");
      return;
    }
    if (property) {
      logViewing({
        propertyId: property.id,
        buyerId: buyer.id,
        date: new Date().toISOString().slice(0, 10),
        interested,
        notes,
      });
    }
    navigate({ to: "/match" });
  };

  return (
    <MobileShell
      title="Client & Viewing"
      subtitle={property ? property.title : "No property selected"}
      back
    >
      <Panel title="Client" hint="Existing or new">
        <div className="space-y-1">
          {buyers.map((b) => (
            <Row
              key={b.id}
              title={b.name}
              subtitle={`${b.tag} · ${b.phone}`}
              value={formatAedCompact(b.requirements.budget)}
              active={b.id === activeBuyerId}
              onClick={() => selectBuyer(b.id)}
              trailing={<span />}
            />
          ))}
        </div>
        <div className="mt-3">
          {creating ? (
            <div className="space-y-3">
              <Field label="Full name">
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Mobile">
                <input
                  className={inputCls}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+971 50 000 0000"
                />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <BigButton tone="outline" onClick={() => setCreating(false)}>
                  Cancel
                </BigButton>
                <BigButton onClick={createClient}>Save client</BigButton>
              </div>
            </div>
          ) : (
            <BigButton tone="outline" icon={<UserPlus className="h-4 w-4" />} onClick={() => setCreating(true)}>
              New client
            </BigButton>
          )}
        </div>
      </Panel>

      {buyer ? (
        <Panel title="Client requirements" hint={buyer.name}>
          <div className="space-y-4">
            <Field label={`Budget · ${formatAedCompact(buyer.requirements.budget)}`}>
              <input
                type="range"
                min={1}
                max={60}
                value={Math.round(buyer.requirements.budget / 100 / 1_000_000)}
                onChange={(e) =>
                  updateRequirements(buyer.id, { budget: aed(Number(e.target.value) * 1_000_000) })
                }
                className="h-10 w-full accent-[var(--color-primary)]"
              />
            </Field>
            <Field label="Funding">
              <Segmented
                options={[
                  { value: "CASH", label: "Cash" },
                  { value: "MORTGAGE", label: "Mortgage" },
                ]}
                value={buyer.requirements.funding}
                onChange={(v) => updateRequirements(buyer.id, { funding: v })}
              />
            </Field>
            <Field label="Purpose">
              <Segmented
                options={[
                  { value: "INVESTMENT", label: "Investment" },
                  { value: "LIVING", label: "Living" },
                ]}
                value={buyer.requirements.purpose}
                onChange={(v) => updateRequirements(buyer.id, { purpose: v })}
              />
            </Field>
            <Field label="Desired location">
              <select
                className={inputCls}
                value={buyer.requirements.locations[0] ?? ""}
                onChange={(e) => updateRequirements(buyer.id, { locations: [e.target.value] })}
              >
                {COMMUNITIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Bedrooms">
              <Segmented
                options={[
                  { value: "1", label: "1" },
                  { value: "2", label: "2" },
                  { value: "3", label: "3" },
                  { value: "4", label: "4" },
                  { value: "5", label: "5+" },
                ]}
                value={String(buyer.requirements.bedrooms)}
                onChange={(v) => updateRequirements(buyer.id, { bedrooms: Number(v) })}
              />
            </Field>
            <Field label="Preferences">
              <textarea
                className={`${inputCls} min-h-[88px] py-2`}
                value={buyer.requirements.notes}
                onChange={(e) => updateRequirements(buyer.id, { notes: e.target.value })}
              />
            </Field>
          </div>
        </Panel>
      ) : null}

      <Panel title="Viewing form" hint={property ? communityName(property) : "Pick a unit first"}>
        <div className="space-y-4">
          <Field label="Viewing date">
            <input type="date" className={inputCls} defaultValue={new Date().toISOString().slice(0, 10)} />
          </Field>
          <Field label="Attendees">
            <input className={inputCls} defaultValue={buyer ? `${buyer.name} + broker` : "Broker"} />
          </Field>
          <Field label="Notes">
            <textarea
              className={`${inputCls} min-h-[96px] py-2`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Feedback on layout, view, finishes, price expectation…"
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <BigButton
              tone={interested === true ? "solid" : "outline"}
              onClick={() => setInterested(true)}
            >
              Interested
            </BigButton>
            <BigButton
              tone={interested === false ? "danger" : "outline"}
              onClick={() => setInterested(false)}
            >
              Not interested
            </BigButton>
          </div>
        </div>
      </Panel>

      <BigButton onClick={cont}>Continue →</BigButton>
    </MobileShell>
  );
}
