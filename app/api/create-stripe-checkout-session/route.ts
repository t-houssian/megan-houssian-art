import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

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

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    const { amount, shippingAddress, product, shippingOption, returnTo } = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const safeReturnPath = getSafeReturnPath(returnTo);

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Initialize Stripe
    const stripe = getStripe();

    // Create session configuration
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product || 'Artwork Purchase',
              description: `Original artwork by Megan Houssian${shippingOption === 'pickup' ? ' - Local Pickup in Marble Falls, TX' : ''}`,
            },
            unit_amount: amount, // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: safeReturnPath ? `${baseUrl}${safeReturnPath}` : `${baseUrl}/checkout`,
      // Always collect billing address
      billing_address_collection: 'required',
      metadata: {
        product: product || 'artwork',
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
