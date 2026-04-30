import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { dollarsToCents, roundUpCentsToNearestTenDollars } from '../../../lib/money';
import {
  fetchOriginalCheckoutPricing,
  validateOriginalSoldWriteAccess,
} from '../../../lib/originals';
import { cartToStripeLineItems, validateCartForCheckout } from '../../../lib/cart-checkout';
import {
  calculateTexasSalesTaxCents,
  TEXAS_SALES_TAX_PERCENT_LABEL,
} from '../../../lib/sales-tax';

// Initialize Stripe only when the secret key is available
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-02-24.acacia',
  });
};

const getSafeReturnPath = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  if (!value.startsWith('/') || value.startsWith('//')) return null;
  return value;
};

const isValidEmail = (value: unknown): value is string =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const hasRequiredShippingAddress = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') return false;
  const address = value as {
    name?: unknown;
    addressLine1?: unknown;
    city?: unknown;
    state?: unknown;
    postalCode?: unknown;
    country?: unknown;
  };

  return [address.name, address.addressLine1, address.city, address.state, address.postalCode, address.country]
    .every((field) => typeof field === 'string' && field.trim().length > 0);
};

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    const {
      amount,
      shippingAddress,
      product,
      originalSlug,
      shippingOption,
      returnTo,
      checkoutEmail,
      cartItems,
    } = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const safeReturnPath = getSafeReturnPath(returnTo);
    const normalizedCheckoutEmail = isValidEmail(checkoutEmail) ? checkoutEmail.trim() : null;
    const isCartCheckout = Array.isArray(cartItems) && cartItems.length > 0;
    const validatedCart = isCartCheckout
      ? await validateCartForCheckout(cartItems)
      : null;
    const originalPricing = !isCartCheckout && typeof originalSlug === 'string' && originalSlug
      ? await fetchOriginalCheckoutPricing(originalSlug)
      : null;
    if (!isCartCheckout && originalSlug && !originalPricing) {
      return NextResponse.json(
        { error: 'Original artwork not found' },
        { status: 404 }
      );
    }

    if (!isCartCheckout && originalPricing?.sold) {
      return NextResponse.json(
        { error: 'This original artwork has already sold' },
        { status: 409 }
      );
    }

    const rawAmount = typeof originalPricing?.price === 'number'
      ? dollarsToCents(originalPricing.price)
      : typeof amount === 'number'
        ? amount
        : Number(amount);
    const checkoutSubtotalAmount = validatedCart?.totalCents ?? (originalPricing?.testProduct
      ? rawAmount
      : roundUpCentsToNearestTenDollars(rawAmount));
    const salesTaxAmount = calculateTexasSalesTaxCents(
      checkoutSubtotalAmount,
      shippingOption || 'shipping',
      shippingOption === 'pickup' ? null : shippingAddress
    );
    const productName = validatedCart?.productSummary || originalPricing?.title || product || 'Artwork Purchase';
    const originalReferenceSlug = originalPricing?.slug.current || originalSlug || null;
    const originalSlugsForSale = validatedCart?.originalSlugs ?? (originalReferenceSlug ? [originalReferenceSlug] : []);

    // Validate required fields
    if (!checkoutSubtotalAmount || checkoutSubtotalAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!normalizedCheckoutEmail) {
      return NextResponse.json(
        { error: 'Valid checkout email is required' },
        { status: 400 }
      );
    }

    if ((shippingOption || 'shipping') === 'shipping' && !hasRequiredShippingAddress(shippingAddress)) {
      return NextResponse.json(
        { error: 'A complete shipping address is required' },
        { status: 400 }
      );
    }

    if (originalSlugsForSale.length > 0) {
      const writeAccessValidation = await validateOriginalSoldWriteAccess();
      if (!writeAccessValidation.ok) {
        return NextResponse.json(
          { error: writeAccessValidation.message },
          { status: 503 }
        );
      }
    }

    // Initialize Stripe
    const stripe = getStripe();

    // Create session configuration
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = validatedCart ? cartToStripeLineItems(validatedCart) : [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: productName,
            description: `Original artwork by Megan Houssian${shippingOption === 'pickup' ? ' - Local Pickup in Marble Falls, TX' : ''}`,
          },
          unit_amount: checkoutSubtotalAmount,
        },
        quantity: 1,
      },
    ];

    if (salesTaxAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Texas Sales Tax (${TEXAS_SALES_TAX_PERCENT_LABEL})`,
          },
          unit_amount: salesTaxAmount,
        },
        quantity: 1,
      });
    }

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: normalizedCheckoutEmail,
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: safeReturnPath ? `${baseUrl}${safeReturnPath}` : `${baseUrl}/checkout`,
      // Always collect billing address
      billing_address_collection: 'required',
      metadata: {
        product: productName,
        original_slug: originalReferenceSlug || '',
        original_slugs: validatedCart?.originalSlugs.join(',') || '',
        cart_checkout: validatedCart ? 'true' : 'false',
        test_product: originalPricing?.testProduct ? 'true' : 'false',
        checkout_email: normalizedCheckoutEmail,
        shipping_option: shippingOption || 'shipping',
        taxable_subtotal_cents: checkoutSubtotalAmount.toString(),
        sales_tax_cents: salesTaxAmount.toString(),
        sales_tax_rate: salesTaxAmount > 0 ? TEXAS_SALES_TAX_PERCENT_LABEL : '0%',
        ...(shippingOption === 'shipping' && shippingAddress ? {
          shipping_name: shippingAddress.name,
          shipping_address: shippingAddress.addressLine1,
          shipping_city: shippingAddress.city,
          shipping_state: shippingAddress.state,
          shipping_postal_code: shippingAddress.postalCode,
          shipping_country: shippingAddress.country,
        } : {}),
      },
    };

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
