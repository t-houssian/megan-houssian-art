export const TEXAS_SALES_TAX_RATE = 0.0825;
export const TEXAS_SALES_TAX_PERCENT_LABEL = "8.25%";

type TaxAddress = {
  state?: string | null;
  country?: string | null;
} | null | undefined;

export function isTexasState(value: unknown): boolean {
  if (typeof value !== "string") return false;

  const normalized = value.trim().toLowerCase();
  return normalized === "tx" || normalized === "texas";
}

export function shouldCollectTexasSalesTax(
  shippingOption: unknown,
  shippingAddress?: TaxAddress
): boolean {
  if (shippingOption === "pickup") return true;
  if (shippingOption !== "shipping") return false;

  const country = shippingAddress?.country?.trim().toLowerCase();
  const isUsAddress = !country || country === "us" || country === "usa" || country === "united states";

  return isUsAddress && isTexasState(shippingAddress?.state);
}

export function calculateTexasSalesTaxCents(
  taxableSubtotalCents: number,
  shippingOption: unknown,
  shippingAddress?: TaxAddress
): number {
  if (!Number.isFinite(taxableSubtotalCents) || taxableSubtotalCents <= 0) return 0;
  if (!shouldCollectTexasSalesTax(shippingOption, shippingAddress)) return 0;

  return Math.round(taxableSubtotalCents * TEXAS_SALES_TAX_RATE);
}
