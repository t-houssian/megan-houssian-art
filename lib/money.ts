export const roundUpToNearestTenDollars = (amountDollars: number): number => {
  if (!Number.isFinite(amountDollars) || amountDollars <= 0) {
    return 0;
  }
  return Math.ceil(amountDollars / 10) * 10;
};

export const roundUpCentsToNearestTenDollars = (amountCents: number): number => {
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return 0;
  }
  return roundUpToNearestTenDollars(amountCents / 100) * 100;
};

export const formatRoundedDollars = (amountDollars: number): string => {
  return roundUpToNearestTenDollars(amountDollars).toString();
};

export const formatRoundedCents = (amountCents: number): string => {
  return formatRoundedDollars(amountCents / 100);
};
