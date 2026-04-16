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

export const dollarsToCents = (amountDollars: number): number => {
  if (!Number.isFinite(amountDollars) || amountDollars <= 0) {
    return 0;
  }

  return Math.round(amountDollars * 100);
};

export const formatDollars = (amountDollars: number): string => {
  if (!Number.isFinite(amountDollars) || amountDollars <= 0) {
    return '0.00';
  }

  return amountDollars.toLocaleString('en-US', {
    minimumFractionDigits: amountDollars % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

export const formatCents = (amountCents: number): string => {
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return '0.00';
  }

  return (amountCents / 100).toLocaleString('en-US', {
    minimumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

export const formatCurrency = (amountDollars: number): string => {
  if (!Number.isFinite(amountDollars) || amountDollars <= 0) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amountDollars % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amountDollars);
};

export const formatCurrencyFromCents = (amountCents: number): string => {
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return '$0.00';
  }

  return formatCurrency(amountCents / 100);
};
