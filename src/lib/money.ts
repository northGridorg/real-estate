/**
 * High-precision money & ownership primitives.
 * - Money is stored as AED *cents* (integers). 10,000,000.50 AED -> 1000000050
 * - Fractional ownership is stored as Basis Points (BPS). 100% -> 10000
 * No floating point math is used for storage or aggregation.
 */

export type AedCents = number;
export type Bps = number;

export const BPS_TOTAL = 10000;

export const aed = (whole: number, cents = 0): AedCents =>
  Math.round(whole) * 100 + Math.round(cents);

/** Adds any number of integer cent amounts (integer-safe). */
export const sumCents = (...values: AedCents[]): AedCents =>
  values.reduce((total, value) => total + Math.trunc(value), 0);

/** Applies a basis-point share to a cent amount, rounding half-up at the cent. */
export const applyBps = (amount: AedCents, bps: Bps): AedCents =>
  Math.round((Math.trunc(amount) * Math.trunc(bps)) / BPS_TOTAL);

export const bpsToPercent = (bps: Bps) => Math.trunc(bps) / 100;

export const formatBps = (bps: Bps) => `${bpsToPercent(bps).toFixed(2)}%`;

/** Full precision: AED 10,000,000.50 */
export const formatAed = (amount: AedCents) => {
  const negative = amount < 0;
  const abs = Math.abs(Math.trunc(amount));
  const body = `${Math.trunc(abs / 100).toLocaleString("en-AE")}.${String(abs % 100).padStart(2, "0")}`;
  return `${negative ? "-" : ""}AED ${body}`;
};

/** Compact desk format: AED 10.0M / AED 850K */
export const formatAedCompact = (amount: AedCents) => {
  const negative = amount < 0;
  const units = Math.abs(Math.trunc(amount)) / 100;
  const sign = negative ? "-" : "";
  if (units >= 1_000_000_000) return `${sign}AED ${(units / 1_000_000_000).toFixed(2)}B`;
  if (units >= 1_000_000) return `${sign}AED ${(units / 1_000_000).toFixed(units >= 10_000_000 ? 1 : 2)}M`;
  if (units >= 1_000) return `${sign}AED ${Math.round(units / 1_000)}K`;
  return `${sign}AED ${units.toFixed(0)}`;
};

export const formatPsf = (amount: AedCents) =>
  `${(Math.trunc(amount) / 100).toLocaleString("en-AE", { maximumFractionDigits: 0 })} /sq.ft`;

/** DLD transfer fee: 4% of price, in cents. */
export const dldFee = (price: AedCents): AedCents => applyBps(price, 400);

/** Total entry cost: price + 4% DLD + admin/trustee + agency (2%). */
export const entryCosts = (price: AedCents) => {
  const dld = dldFee(price);
  const trustee = aed(4200);
  const agency = applyBps(price, 200);
  const admin = aed(5250);
  return { dld, trustee, agency, admin, total: sumCents(dld, trustee, agency, admin) };
};

/** Compounded appreciation projection, all integer cents. */
export const projectValue = (price: AedCents, annualBps: Bps, years: number): AedCents => {
  let value = Math.trunc(price);
  for (let year = 0; year < years; year += 1) value = value + applyBps(value, annualBps);
  return value;
};