import Stripe from 'stripe';
import type { CartPayloadItem } from './cart-types';
import { dollarsToCents, roundUpCentsToNearestTenDollars, roundUpToNearestTenDollars } from './money';
import { fetchOriginalCheckoutPricing } from './originals';
import { sanityClient } from './sanity';

type ValidatedCartLine = {
  title: string;
  description: string;
  amountCents: number;
  amountDollars: number;
  quantity: number;
  originalSlug?: string;
};

export type ValidatedCart = {
  lines: ValidatedCartLine[];
  totalCents: number;
  totalDollars: number;
  productSummary: string;
  originalSlugs: string[];
};

const isCartPayloadItem = (value: unknown): value is CartPayloadItem => {
  if (!value || typeof value !== 'object') return false;
  const item = value as CartPayloadItem;
  return Boolean(item.id && item.title && (item.type === 'original' || item.type === 'print'));
};

const normalizeQuantity = (value: unknown) => {
  const quantity = typeof value === 'number' ? Math.floor(value) : 1;
  return Number.isFinite(quantity) && quantity > 0 ? Math.min(quantity, 20) : 1;
};

const getPrintBySlug = (slug: string) =>
  sanityClient.withConfig({ useCdn: false }).fetch<{
    _id: string;
    title: string;
    soldOut?: boolean;
  } | null>(
    `*[_type == "print" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
      _id,
      title,
      soldOut
    }`,
    { slug },
    { cache: 'no-store' }
  );

export async function validateCartForCheckout(
  rawItems: unknown
): Promise<ValidatedCart> {
  if (!Array.isArray(rawItems)) {
    throw new Error('Cart is empty.');
  }

  const items = rawItems.filter(isCartPayloadItem);
  if (items.length === 0) {
    throw new Error('Cart is empty.');
  }

  const lines: ValidatedCartLine[] = [];
  const originalSlugs: string[] = [];

  for (const item of items) {
    if (item.type === 'original') {
      if (!item.originalSlug) {
        throw new Error('A cart item is missing its original artwork reference.');
      }

      const original = await fetchOriginalCheckoutPricing(item.originalSlug);
      if (!original) {
        throw new Error(`Original artwork "${item.title}" was not found.`);
      }
      if (original.sold) {
        throw new Error(`"${original.title}" has already sold.`);
      }

      const rawAmountCents = dollarsToCents(original.price ?? 0);
      const amountCents = original.testProduct
        ? rawAmountCents
        : roundUpCentsToNearestTenDollars(rawAmountCents);
      if (!amountCents || amountCents <= 0) {
        throw new Error(`"${original.title}" has an invalid price.`);
      }

      lines.push({
        title: original.title,
        description: 'Original artwork by Megan Houssian',
        amountCents,
        amountDollars: amountCents / 100,
        quantity: 1,
        originalSlug: original.slug.current,
      });
      originalSlugs.push(original.slug.current);
      continue;
    }

    if (!item.printSlug) {
      throw new Error('A cart item is missing its print reference.');
    }

    const print = await getPrintBySlug(item.printSlug);
    if (!print) {
      throw new Error(`Print "${item.title}" was not found.`);
    }
    if (print.soldOut) {
      throw new Error(`"${print.title}" is currently unavailable.`);
    }

    const quantity = normalizeQuantity(item.quantity);
    const amountCents = dollarsToCents(Number(item.price));
    if (!amountCents || amountCents <= 0) {
      throw new Error(`"${print.title}" has an invalid print price.`);
    }

    lines.push({
      title: `${print.title} Print`,
      description: [item.printProductName, item.printSizeName].filter(Boolean).join(' - ') || 'Fine art print',
      amountCents,
      amountDollars: amountCents / 100,
      quantity,
    });
  }

  const totalCents = lines.reduce((sum, line) => sum + line.amountCents * line.quantity, 0);
  if (!totalCents || totalCents <= 0) {
    throw new Error('Cart total is invalid.');
  }

  return {
    lines,
    totalCents,
    totalDollars: totalCents / 100,
    productSummary: lines.length === 1 ? lines[0].title : `${lines.length} artwork items`,
    originalSlugs,
  };
}

export function cartToStripeLineItems(cart: ValidatedCart): Stripe.Checkout.SessionCreateParams.LineItem[] {
  return cart.lines.map((line) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: line.title,
        description: line.description,
      },
      unit_amount: line.amountCents,
    },
    quantity: line.quantity,
  }));
}

export function cartToPayPalItems(cart: ValidatedCart) {
  return cart.lines.map((line) => ({
    name: line.title.slice(0, 127),
    description: line.description.slice(0, 127),
    ...(line.originalSlug ? { sku: `original_slug:${line.originalSlug}`.slice(0, 127) } : {}),
    quantity: line.quantity.toString(),
    unit_amount: {
      currency_code: 'USD',
      value: line.amountDollars.toFixed(2),
    },
  }));
}

export function getSingleCheckoutAmountDollars(amount: unknown, isTestProduct?: boolean) {
  const parsedAmount = typeof amount === 'number' ? amount : Number(amount);
  return isTestProduct ? parsedAmount : roundUpToNearestTenDollars(parsedAmount);
}
