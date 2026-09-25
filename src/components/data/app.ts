import propA1 from "@/assets/prop-a1.jpg";
import propA2 from "@/assets/prop-a2.jpg";
import propA3 from "@/assets/prop-a3.jpg";
import propA4 from "@/assets/prop-a4.jpg";
import propA5 from "@/assets/prop-a5.jpg";
import propA6 from "@/assets/prop-a6.jpg";
import propA7 from "@/assets/prop-a7.jpg";
import propA8 from "@/assets/prop-a8.jpg";
import { ASSETS, communityById, type Asset } from "@/data/desk";
import { aed, applyBps, type AedCents, type Bps } from "@/lib/money";

export type { Asset } from "@/data/desk";

/** Hero photo per property id — Dubai towers / villas matching each listing. */
export const PROPERTY_PHOTOS: Record<string, string> = {
  a1: propA1,
  a2: propA2,
  a3: propA3,
  a4: propA4,
  a5: propA5,
  a6: propA6,
  a7: propA7,
  a8: propA8,
};

export const PHOTOS = [propA1, propA2, propA4, propA5, propA7, propA8];

export const photosFor = (id: string) => {
  const hero = PROPERTY_PHOTOS[id] ?? propA1;
  const rest = PHOTOS.filter((p) => p !== hero);
  return [hero, rest[0], rest[1]];
};

export type PropertyStatus = "AVAILABLE" | "RESERVED" | "UNDER_OFFER";

export const statusFor = (a: Asset): PropertyStatus =>
  a.id === "a4" ? "UNDER_OFFER" : a.id === "a6" ? "RESERVED" : "AVAILABLE";

/** Gross rental yield in BPS, derived from community PSF and unit size. */
export const grossYieldBps = (a: Asset): Bps => {
  const c = communityById(a.communityId);
  const base = a.marketType === "OFF_PLAN" ? 620 : 720;
  const tilt = c ? Math.round((c.growth1yBps - 1400) / 20) : 0;
  return Math.max(430, base + tilt);
};

export const annualRent = (a: Asset): AedCents => applyBps(a.price, grossYieldBps(a));

export const communityName = (a: Asset) => communityById(a.communityId)?.name ?? "Dubai";

export const PROPERTIES = ASSETS;

export const propertyById = (id: string | null) =>
  id ? PROPERTIES.find((p) => p.id === id) : undefined;

export interface Transaction {
  date: string;
  unit: string;
  price: AedCents;
  psf: AedCents;
}

export const transactionsFor = (a: Asset): Transaction[] => {
  const step = Math.round(a.price / 100 / 40);
  return [
    { date: "2026-06-18", unit: "Similar line unit", price: a.price - aed(step * 0), psf: a.psf },
    { date: "2026-03-02", unit: "Lower floor", price: a.price - aed(step * 6), psf: a.psf - aed(80) },
    { date: "2025-11-24", unit: "Same layout", price: a.price - aed(step * 14), psf: a.psf - aed(160) },
    { date: "2025-07-09", unit: "Adjacent tower", price: a.price - aed(step * 22), psf: a.psf - aed(240) },
  ];
};

export const verificationFor = (a: Asset) => [
  { label: "Title deed sighted", ok: a.marketType === "SECONDARY_READY" },
  { label: "DLD listing permit", ok: true },
  { label: "Trakheesi advert number", ok: true },
  { label: "Escrow account verified", ok: a.plan ? a.plan.escrowStatus === "VERIFIED" : true },
  { label: "Owner NOC on file", ok: a.id !== "a4" },
];

export interface BuyerRequirements {
  budget: AedCents;
  funding: "CASH" | "MORTGAGE";
  purpose: "INVESTMENT" | "LIVING";
  locations: string[];
  bedrooms: number;
  notes: string;
}

export interface Buyer {
  id: string;
  name: string;
  phone: string;
  tag: "HNW Individual" | "Family Office" | "First-time Buyer" | "Investor";
  requirements: BuyerRequirements;
}

export const BUYERS: Buyer[] = [
  {
    id: "b1",
    name: "Omar Al Fardan",
    phone: "+971 50 118 4402",
    tag: "Investor",
    requirements: {
      budget: aed(5_500_000),
      funding: "CASH",
      purpose: "INVESTMENT",
      locations: ["Dubai Marina", "Business Bay"],
      bedrooms: 2,
      notes: "Wants 7%+ gross yield, handover before 2028.",
    },
  },
  {
    id: "b2",
    name: "Sheikha R. Family Office",
    phone: "+971 55 204 7781",
    tag: "Family Office",
    requirements: {
      budget: aed(52_000_000),
      funding: "CASH",
      purpose: "LIVING",
      locations: ["Palm Jumeirah", "Downtown Dubai"],
      bedrooms: 5,
      notes: "Beachfront villa, privacy and staff quarters essential.",
    },
  },
  {
    id: "b3",
    name: "Priya & Rahul Menon",
    phone: "+971 52 663 9017",
    tag: "First-time Buyer",
    requirements: {
      budget: aed(2_100_000),
      funding: "MORTGAGE",
      purpose: "LIVING",
      locations: ["Jumeirah Village Circle", "Business Bay"],
      bedrooms: 2,
      notes: "Pre-approved with Emirates NBD, 80% LTV.",
    },
  },
  {
    id: "b4",
    name: "Kestrel Capital (SG)",
    phone: "+65 8112 4471",
    tag: "HNW Individual",
    requirements: {
      budget: aed(20_000_000),
      funding: "CASH",
      purpose: "INVESTMENT",
      locations: ["DIFC", "Downtown Dubai"],
      bedrooms: 4,
      notes: "Prefers full-floor commercial-grade stock in DIFC.",
    },
  },
];

export interface Showing {
  id: string;
  time: string;
  buyerId: string;
  propertyId: string;
  place: string;
}

export const SHOWINGS: Showing[] = [
  { id: "s1", time: "11:00", buyerId: "b1", propertyId: "a2", place: "Sobha Seahaven sales centre" },
  { id: "s2", time: "14:30", buyerId: "b2", propertyId: "a3", place: "Signature Villas gate F" },
  { id: "s3", time: "17:15", buyerId: "b3", propertyId: "a6", place: "JVC Garden Residences" },
];

export const DOC_TEMPLATES = [
  { id: "form-a", label: "Form A", hint: "Seller / broker listing agreement" },
  { id: "form-b", label: "Form B", hint: "Buyer / broker agreement" },
  { id: "form-f", label: "Form F", hint: "Memorandum of understanding (MOU)" },
  { id: "passport", label: "Passport & Emirates ID", hint: "Buyer KYC pack" },
  { id: "proof", label: "Proof of funds", hint: "Bank letter or pre-approval" },
] as const;

export const PAYMENT_METHODS = ["Manager's cheque", "Bank transfer", "Mortgage drawdown", "Escrow instalments"] as const;

export const buyerById = (id: string | null) => (id ? BUYERS.find((b) => b.id === id) : undefined);
