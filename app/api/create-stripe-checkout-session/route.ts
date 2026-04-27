import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { dollarsToCents, roundUpCentsToNearestTenDollars } from '../../../lib/money';
import {
  fetchOriginalCheckoutPricing,
  validateOriginalSoldWriteAccess,
  validateOriginalEarlyAccessForCheckout,
} from '../../../lib/originals';
import { cartToStripeLineItems, validateCartForCheckout } from '../../../lib/cart-checkout';

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
      earlyAccessPassword,
      earlyAccessPasswords,
      cartItems,
    } = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const safeReturnPath = getSafeReturnPath(returnTo);
    const normalizedCheckoutEmail = isValidEmail(checkoutEmail) ? checkoutEmail.trim() : null;
    const isCartCheckout = Array.isArray(cartItems) && cartItems.length > 0;
    const validatedCart = isCartCheckout
      ? await validateCartForCheckout(cartItems, earlyAccessPasswords)
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

    if (!isCartCheckout) {
      const earlyAccessValidation = await validateOriginalEarlyAccessForCheckout(
        originalSlug,
        earlyAccessPassword
      );
      if (!earlyAccessValidation.ok) {
        return NextResponse.json(
          { error: earlyAccessValidation.message },
          { status: 403 }
        );
      }
    }

    const rawAmount = typeof originalPricing?.price === 'number'
      ? dollarsToCents(originalPricing.price)
      : typeof amount === 'number'
        ? amount
        : Number(amount);
    const checkoutAmount = validatedCart?.totalCents ?? (originalPricing?.testProduct
      ? rawAmount
      : roundUpCentsToNearestTenDollars(rawAmount));
    const productName = validatedCart?.productSummary || originalPricing?.title || product || 'Artwork Purchase';
    const originalReferenceSlug = originalPricing?.slug.current || originalSlug || null;
    const originalSlugsForSale = validatedCart?.originalSlugs ?? (originalReferenceSlug ? [originalReferenceSlug] : []);

    // Validate required fields
    if (!checkoutAmount || checkoutAmount <= 0) {
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
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: validatedCart ? cartToStripeLineItems(validatedCart) : [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: `Original artwork by Megan Houssian${shippingOption === 'pickup' ? ' - Local Pickup in Marble Falls, TX' : ''}`,
            },
            unit_amount: checkoutAmount,
          },
          quantity: 1,
        },
      ],
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

    // Only collect shipping address if shipping is selected
    if (shippingOption === 'shipping') {
      sessionConfig.shipping_address_collection = {
        allowed_countries: ['US', 'CA'], // Add more countries as needed
      };
    }

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
