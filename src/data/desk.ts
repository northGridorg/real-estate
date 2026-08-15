import { aed, type AedCents, type Bps } from "@/lib/money";

export type MarketType = "OFF_PLAN" | "SECONDARY_READY";

export interface Community {
  id: string;
  name: string;
  masterDeveloper: string;
  makaniId: string;
  registeredPlots: number;
  /** Trailing 12-month registered sales volume. */
  ttmVolume: AedCents;
  ttmTransactions: number;
  avgPsf: AedCents;
  offPlanAbsorptionBps: Bps;
  growth1yBps: Bps;
  growth3yBps: Bps;
  curve: number[];
  lat: number;
  lng: number;
}

export const DEVELOPERS = ["Emaar", "Nakheel", "Sobha", "Damac", "Meraas", "Select Group"] as const;

export const COMMUNITIES: Community[] = [
  {
    id: "downtown",
    name: "Downtown Dubai",
    masterDeveloper: "Emaar",
    makaniId: "2841 74132",
    registeredPlots: 412,
    ttmVolume: aed(18_420_000_000),
    ttmTransactions: 4821,
    avgPsf: aed(2980),
    offPlanAbsorptionBps: 7820,
    growth1yBps: 1420,
    growth3yBps: 5210,
    curve: [100, 108, 119, 131, 142, 152],
    lat: 25.1972,
    lng: 55.2744,
  },
  {
    id: "marina",
    name: "Dubai Marina",
    masterDeveloper: "Emaar",
    makaniId: "1927 61508",
    registeredPlots: 268,
    ttmVolume: aed(14_180_000_000),
    ttmTransactions: 5230,
    avgPsf: aed(2140),
    offPlanAbsorptionBps: 6510,
    growth1yBps: 1180,
    growth3yBps: 4460,
    curve: [100, 106, 116, 126, 134, 144],
    lat: 25.0805,
    lng: 55.1403,
  },
  {
    id: "palm",
    name: "Palm Jumeirah",
    masterDeveloper: "Nakheel",
    makaniId: "1543 29711",
    registeredPlots: 1802,
    ttmVolume: aed(22_960_000_000),
    ttmTransactions: 1985,
    avgPsf: aed(4260),
    offPlanAbsorptionBps: 8410,
    growth1yBps: 1960,
    growth3yBps: 7340,
    curve: [100, 112, 128, 145, 161, 173],
    lat: 25.1124,
    lng: 55.139,
  },
  {
    id: "business-bay",
    name: "Business Bay",
    masterDeveloper: "Damac",
    makaniId: "2635 81264",
    registeredPlots: 596,
    ttmVolume: aed(11_740_000_000),
    ttmTransactions: 6104,
    avgPsf: aed(1980),
    offPlanAbsorptionBps: 7180,
    growth1yBps: 1310,
    growth3yBps: 4820,
    curve: [100, 107, 117, 128, 137, 148],
    lat: 25.1857,
    lng: 55.2769,
  },
  {
    id: "difc",
    name: "DIFC",
    masterDeveloper: "Meraas",
    makaniId: "2748 69315",
    registeredPlots: 121,
    ttmVolume: aed(6_310_000_000),
    ttmTransactions: 1142,
    avgPsf: aed(3120),
    offPlanAbsorptionBps: 5940,
    growth1yBps: 1520,
    growth3yBps: 5580,
    curve: [100, 109, 121, 133, 145, 156],
    lat: 25.2119,
    lng: 55.2796,
  },
  {
    id: "jvc",
    name: "Jumeirah Village Circle",
    masterDeveloper: "Nakheel",
    makaniId: "1382 55420",
    registeredPlots: 2140,
    ttmVolume: aed(8_960_000_000),
    ttmTransactions: 9418,
    avgPsf: aed(1280),
    offPlanAbsorptionBps: 8820,
    growth1yBps: 1680,
    growth3yBps: 6120,
    curve: [100, 110, 122, 136, 150, 161],
    lat: 25.0592,
    lng: 55.2088,
  },
];

export const communityById = (id: string) => COMMUNITIES.find((c) => c.id === id);

export interface Milestone {
  label: string;
  bps: Bps;
  dueOn: string;
  status: "PAID" | "DUE" | "SCHEDULED";
}

export interface PaymentPlan {
  headline: string;
  postHandover: boolean;
  downpaymentBps: Bps;
  escrowAccount: string;
  escrowStatus: "VERIFIED" | "PENDING_AUDIT";
  handover: string;
  milestones: Milestone[];
}

export interface Asset {
  id: string;
  reference: string;
  title: string;
  communityId: string;
  developer: string;
  marketType: MarketType;
  bedrooms: number;
  sqft: number;
  price: AedCents;
  psf: AedCents;
  /** Client-held fractional equity, in BPS. */
  ownedBps: Bps;
  holderSpvId: string | null;
  annualGrowthBps: Bps;
  handoverWindow: "READY" | "2026-2027" | "2028+";
  plan: PaymentPlan | null;
  x: number;
  y: number;
}

export const ASSETS: Asset[] = [
  {
    id: "a1",
    reference: "DXB-SEC-1042",
    title: "Burj Khalifa · Sky Collection 4402",
    communityId: "downtown",
    developer: "Emaar",
    marketType: "SECONDARY_READY",
    bedrooms: 3,
    sqft: 2480,
    price: aed(11_400_000, 50),
    psf: aed(4596),
    ownedBps: 10000,
    holderSpvId: "spv-1",
    annualGrowthBps: 940,
    handoverWindow: "READY",
    plan: null,
    x: 46,
    y: 44,
  },
  {
    id: "a2",
    reference: "DXB-OFF-2210",
    title: "Sobha Seahaven · Tower B 2708",
    communityId: "marina",
    developer: "Sobha",
    marketType: "OFF_PLAN",
    bedrooms: 2,
    sqft: 1420,
    price: aed(4_850_000),
    psf: aed(3415),
    ownedBps: 5000,
    holderSpvId: "spv-2",
    annualGrowthBps: 1180,
    handoverWindow: "2026-2027",
    plan: {
      headline: "20 / 40 / 40",
      postHandover: false,
      downpaymentBps: 2000,
      escrowAccount: "ESCROW-SBH-88412",
      escrowStatus: "VERIFIED",
      handover: "Q4 2027",
      milestones: [
        { label: "Downpayment", bps: 2000, dueOn: "2025-06-12", status: "PAID" },
        { label: "30% Construction", bps: 2000, dueOn: "2026-01-20", status: "PAID" },
        { label: "60% Construction", bps: 2000, dueOn: "2026-11-05", status: "DUE" },
        { label: "On Handover", bps: 4000, dueOn: "2027-10-30", status: "SCHEDULED" },
      ],
    },
    x: 24,
    y: 62,
  },
  {
    id: "a3",
    reference: "DXB-SEC-1188",
    title: "Palm Jumeirah · Signature Villa F-14",
    communityId: "palm",
    developer: "Nakheel",
    marketType: "SECONDARY_READY",
    bedrooms: 5,
    sqft: 7100,
    price: aed(48_500_000),
    psf: aed(6830),
    ownedBps: 3333,
    holderSpvId: "spv-3",
    annualGrowthBps: 1320,
    handoverWindow: "READY",
    plan: null,
    x: 18,
    y: 34,
  },
  {
    id: "a4",
    reference: "DXB-OFF-2354",
    title: "Damac Bay · Cavalli 3105",
    communityId: "business-bay",
    developer: "Damac",
    marketType: "OFF_PLAN",
    bedrooms: 1,
    sqft: 780,
    price: aed(1_920_000),
    psf: aed(2461),
    ownedBps: 10000,
    holderSpvId: "spv-2",
    annualGrowthBps: 1420,
    handoverWindow: "2028+",
    plan: {
      headline: "10 / 50 / 40 Post-Handover",
      postHandover: true,
      downpaymentBps: 1000,
      escrowAccount: "ESCROW-DMC-20913",
      escrowStatus: "PENDING_AUDIT",
      handover: "Q2 2028",
      milestones: [
        { label: "Downpayment", bps: 1000, dueOn: "2026-03-01", status: "PAID" },
        { label: "During Construction", bps: 5000, dueOn: "2027-09-15", status: "DUE" },
        { label: "Post-Handover 24 mo", bps: 4000, dueOn: "2030-06-01", status: "SCHEDULED" },
      ],
    },
    x: 52,
    y: 52,
  },
  {
    id: "a5",
    reference: "DXB-SEC-1290",
    title: "Index Tower · DIFC Full Floor",
    communityId: "difc",
    developer: "Meraas",
    marketType: "SECONDARY_READY",
    bedrooms: 4,
    sqft: 4120,
    price: aed(19_250_000),
    psf: aed(4672),
    ownedBps: 6667,
    holderSpvId: "spv-1",
    annualGrowthBps: 1050,
    handoverWindow: "READY",
    plan: null,
    x: 60,
    y: 40,
  },
  {
    id: "a6",
    reference: "DXB-OFF-2481",
    title: "Nakheel JVC · Garden Residences 1204",
    communityId: "jvc",
    developer: "Nakheel",
    marketType: "OFF_PLAN",
    bedrooms: 2,
    sqft: 1150,
    price: aed(1_480_000),
    psf: aed(1287),
    ownedBps: 10000,
    holderSpvId: "spv-4",
    annualGrowthBps: 1620,
    handoverWindow: "2026-2027",
    plan: {
      headline: "15 / 45 / 40",
      postHandover: true,
      downpaymentBps: 1500,
      escrowAccount: "ESCROW-NKL-71204",
      escrowStatus: "VERIFIED",
      handover: "Q1 2027",
      milestones: [
        { label: "Downpayment", bps: 1500, dueOn: "2026-02-18", status: "DUE" },
        { label: "During Construction", bps: 4500, dueOn: "2026-12-01", status: "SCHEDULED" },
        { label: "Post-Handover 12 mo", bps: 4000, dueOn: "2028-01-15", status: "SCHEDULED" },
      ],
    },
    x: 34,
    y: 74,
  },
  {
    id: "a7",
    reference: "DXB-SEC-1355",
    title: "Marina Gate · Penthouse 5601",
    communityId: "marina",
    developer: "Select Group",
    marketType: "SECONDARY_READY",
    bedrooms: 4,
    sqft: 3320,
    price: aed(9_150_000),
    psf: aed(2756),
    ownedBps: 10000,
    holderSpvId: "spv-3",
    annualGrowthBps: 880,
    handoverWindow: "READY",
    plan: null,
    x: 28,
    y: 58,
  },
  {
    id: "a8",
    reference: "DXB-OFF-2502",
    title: "Emaar Grande · Opera District 3810",
    communityId: "downtown",
    developer: "Emaar",
    marketType: "OFF_PLAN",
    bedrooms: 3,
    sqft: 1980,
    price: aed(6_740_000),
    psf: aed(3404),
    ownedBps: 2500,
    holderSpvId: "spv-4",
    annualGrowthBps: 1240,
    handoverWindow: "2028+",
    plan: {
      headline: "20 / 60 / 20",
      postHandover: false,
      downpaymentBps: 2000,
      escrowAccount: "ESCROW-EMR-33810",
      escrowStatus: "VERIFIED",
      handover: "Q3 2028",
      milestones: [
        { label: "Downpayment", bps: 2000, dueOn: "2026-05-09", status: "SCHEDULED" },
        { label: "During Construction", bps: 6000, dueOn: "2027-11-20", status: "SCHEDULED" },
        { label: "On Handover", bps: 2000, dueOn: "2028-08-14", status: "SCHEDULED" },
      ],
    },
    x: 44,
    y: 48,
  },
];

export interface Spv {
  id: string;
  name: string;
  jurisdiction: "RAK ICC" | "DIFC" | "ADGM";
  parentId: string | null;
  clientId: string;
}

export interface ClientPermissions {
  hidePurchasePrice: boolean;
  capitalAppreciationOnly: boolean;
  restrictPdfDownload: boolean;
}

export interface Client {
  id: string;
  name: string;
  type: "Family Office" | "HNW Individual" | "Institutional";
  holdingCompany: string;
  relationshipSince: string;
  advisor: string;
  mobileToken: string;
  permissions: ClientPermissions;
}

export const CLIENTS: Client[] = [
  {
    id: "c1",
    name: "Al Naboodah Private Office",
    type: "Family Office",
    holdingCompany: "ANPO Holdings Ltd (DIFC)",
    relationshipSince: "2019",
    advisor: "Y. Haddad",
    mobileToken: "NG-DXB-9842-88",
    permissions: {
      hidePurchasePrice: true,
      capitalAppreciationOnly: true,
      restrictPdfDownload: false,
    },
  },
  {
    id: "c2",
    name: "Kestrel Capital (Singapore)",
    type: "Institutional",
    holdingCompany: "Kestrel Global Pte Holdings",
    relationshipSince: "2022",
    advisor: "R. Mansouri",
    mobileToken: "NG-DXB-4471-12",
    permissions: {
      hidePurchasePrice: false,
      capitalAppreciationOnly: false,
      restrictPdfDownload: true,
    },
  },
  {
    id: "c3",
    name: "H.E. Sheikha R. Portfolio",
    type: "HNW Individual",
    holdingCompany: "Rhodium Trust Holdings",
    relationshipSince: "2016",
    advisor: "Y. Haddad",
    mobileToken: "NG-DXB-2205-77",
    permissions: {
      hidePurchasePrice: true,
      capitalAppreciationOnly: false,
      restrictPdfDownload: true,
    },
  },
];

export const SPVS: Spv[] = [
  { id: "spv-1", name: "ANPO Downtown SPV I", jurisdiction: "DIFC", parentId: null, clientId: "c1" },
  { id: "spv-2", name: "ANPO Marina Growth SPV", jurisdiction: "RAK ICC", parentId: "spv-1", clientId: "c1" },
  { id: "spv-3", name: "Kestrel Palm Assets Ltd", jurisdiction: "RAK ICC", parentId: null, clientId: "c2" },
  { id: "spv-4", name: "Rhodium Yield SPV", jurisdiction: "ADGM", parentId: null, clientId: "c3" },
];

export const spvById = (id: string | null) => SPVS.find((s) => s.id === id);

export const assetsForClient = (clientId: string) => {
  const ids = SPVS.filter((s) => s.clientId === clientId).map((s) => s.id);
  return ASSETS.filter((a) => a.holderSpvId && ids.includes(a.holderSpvId));
};

export const generateToken = () => {
  const block = () => String(Math.floor(1000 + Math.random() * 9000));
  const pair = () => String(Math.floor(10 + Math.random() * 90));
  return `NG-DXB-${block()}-${pair()}`;
};