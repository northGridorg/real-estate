import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import {
  BUYERS,
  DOC_TEMPLATES,
  PAYMENT_METHODS,
  type Buyer,
  type BuyerRequirements,
} from "@/data/app";
import { aed, type AedCents } from "@/lib/money";

export type OfferStatus = "DRAFT" | "SENT" | "COUNTERED" | "ACCEPTED";
export type DealStage =
  | "NONE"
  | "OFFER"
  | "ACCEPTED"
  | "ACCEPTANCE_SIGNED"
  | "FORMS_DONE"
  | "PAID"
  | "COMPLETED";

export interface OfferDraft {
  propertyId: string | null;
  buyerId: string | null;
  offerPrice: AedCents;
  deposit: AedCents;
  method: (typeof PAYMENT_METHODS)[number];
  schedule: string;
  conditions: string;
  status: OfferStatus;
}

export interface ViewingRecord {
  id: string;
  propertyId: string;
  buyerId: string;
  date: string;
  interested: boolean | null;
  notes: string;
}

interface FlowValue {
  signedIn: boolean;
  signIn: () => void;
  signOut: () => void;

  buyers: Buyer[];
  addBuyer: (buyer: Omit<Buyer, "id">) => string;
  updateRequirements: (buyerId: string, patch: Partial<BuyerRequirements>) => void;

  selectedPropertyId: string | null;
  selectProperty: (id: string | null) => void;
  activeBuyerId: string | null;
  selectBuyer: (id: string | null) => void;

  shortlist: string[];
  toggleShortlist: (id: string) => void;
  compare: string[];
  toggleCompare: (id: string) => void;
  recent: string[];
  markViewed: (id: string) => void;

  viewings: ViewingRecord[];
  logViewing: (record: Omit<ViewingRecord, "id">) => void;

  offer: OfferDraft;
  setOffer: (patch: Partial<OfferDraft>) => void;

  dealStage: DealStage;
  setDealStage: (stage: DealStage) => void;
  docs: Record<string, "MISSING" | "UPLOADED" | "SIGNED">;
  setDoc: (id: string, state: "MISSING" | "UPLOADED" | "SIGNED") => void;
  paymentProof: boolean;
  setPaymentProof: (v: boolean) => void;
  paymentReceived: boolean;
  setPaymentReceived: (v: boolean) => void;
  completedDeals: { propertyId: string; buyerId: string; price: AedCents }[];
  completeDeal: () => void;
}

const emptyOffer: OfferDraft = {
  propertyId: null,
  buyerId: null,
  offerPrice: 0,
  deposit: 0,
  method: PAYMENT_METHODS[0],
  schedule: "10% deposit on MOU · balance on transfer",
  conditions: "Subject to DLD transfer within 30 days and clear title.",
  status: "DRAFT",
};

const FlowContext = createContext<FlowValue | null>(null);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState(false);
  const [buyers, setBuyers] = useState<Buyer[]>(BUYERS);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [activeBuyerId, setActiveBuyerId] = useState<string | null>(null);
  const [shortlist, setShortlist] = useState<string[]>(["a2"]);
  const [compare, setCompare] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>(["a1", "a3"]);
  const [viewings, setViewings] = useState<ViewingRecord[]>([]);
  const [offer, setOfferState] = useState<OfferDraft>(emptyOffer);
  const [dealStage, setDealStage] = useState<DealStage>("NONE");
  const [docs, setDocs] = useState<Record<string, "MISSING" | "UPLOADED" | "SIGNED">>(
    Object.fromEntries(DOC_TEMPLATES.map((d) => [d.id, "MISSING" as const])),
  );
  const [paymentProof, setPaymentProof] = useState(false);
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [completedDeals, setCompletedDeals] = useState<
    { propertyId: string; buyerId: string; price: AedCents }[]
  >([]);

  const toggleIn = (setter: typeof setShortlist) => (id: string) =>
    setter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const value = useMemo<FlowValue>(
    () => ({
      signedIn,
      signIn: () => setSignedIn(true),
      signOut: () => setSignedIn(false),
      buyers,
      addBuyer: (buyer) => {
        const id = `b${Date.now().toString().slice(-5)}`;
        setBuyers((prev) => [...prev, { ...buyer, id }]);
        setActiveBuyerId(id);
        return id;
      },
      updateRequirements: (buyerId, patch) =>
        setBuyers((prev) =>
          prev.map((b) =>
            b.id === buyerId ? { ...b, requirements: { ...b.requirements, ...patch } } : b,
          ),
        ),
      selectedPropertyId,
      selectProperty: setSelectedPropertyId,
      activeBuyerId,
      selectBuyer: setActiveBuyerId,
      shortlist,
      toggleShortlist: toggleIn(setShortlist),
      compare,
      toggleCompare: (id) =>
        setCompare((prev) =>
          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(-3),
        ),
      recent,
      markViewed: (id) => setRecent((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 6)),
      viewings,
      logViewing: (record) =>
        setViewings((prev) => [{ ...record, id: `v${prev.length + 1}` }, ...prev]),
      offer,
      setOffer: (patch) => setOfferState((prev) => ({ ...prev, ...patch })),
      dealStage,
      setDealStage,
      docs,
      setDoc: (id, state) => setDocs((prev) => ({ ...prev, [id]: state })),
      paymentProof,
      setPaymentProof,
      paymentReceived,
      setPaymentReceived,
      completedDeals,
      completeDeal: () => {
        setDealStage("COMPLETED");
        setCompletedDeals((prev) => [
          ...prev,
          {
            propertyId: offer.propertyId ?? "",
            buyerId: offer.buyerId ?? "",
            price: offer.offerPrice || aed(0),
          },
        ]);
      },
    }),
    [
      signedIn,
      buyers,
      selectedPropertyId,
      activeBuyerId,
      shortlist,
      compare,
      recent,
      viewings,
      offer,
      dealStage,
      docs,
      paymentProof,
      paymentReceived,
      completedDeals,
    ],
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlow() {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error("useFlow must be used inside FlowProvider");
  return ctx;
}

/** Convenience: the deal checklist derived from flow state. */
export function useDealChecklist() {
  const { offer, dealStage, docs, paymentReceived } = useFlow();
  const formsDone = ["form-a", "form-b", "form-f"].every((id) => docs[id] === "SIGNED");
  return useCallback(
    () => [
      { label: "Property", done: Boolean(offer.propertyId) },
      { label: "Buyer", done: Boolean(offer.buyerId) },
      { label: "Seller", done: Boolean(offer.propertyId) },
      { label: "Agreed Price", done: offer.status === "ACCEPTED" },
      {
        label: "Client acceptance",
        done: ["ACCEPTANCE_SIGNED", "FORMS_DONE", "PAID", "COMPLETED"].includes(dealStage),
      },
      { label: "Forms", done: formsDone },
      { label: "Signatures", done: formsDone },
      { label: "Payment", done: paymentReceived },
      { label: "Completion", done: dealStage === "COMPLETED" },
    ],
    [offer, dealStage, formsDone, paymentReceived],
  )();
}
