import { NextRequest, NextResponse } from 'next/server';
import { roundUpToNearestTenDollars } from '../../../../lib/money';
import { fetchOriginalCheckoutPricing } from '../../../../lib/originals';

const isValidEmail = (value: unknown): value is string =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export async function POST(request: NextRequest) {
  try {
    const { amount, product, originalSlug, shippingAddress, shippingOption, checkoutEmail } = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const normalizedCheckoutEmail = isValidEmail(checkoutEmail) ? checkoutEmail.trim().toLowerCase() : null;
    const originalPricing = typeof originalSlug === 'string' && originalSlug
      ? await fetchOriginalCheckoutPricing(originalSlug)
      : null;
    if (originalSlug && !originalPricing) {
      return NextResponse.json(
        { error: 'Original artwork not found' },
        { status: 404 }
      );
    }

    if (originalPricing?.sold) {
      return NextResponse.json(
        { error: 'This original artwork has already sold' },
        { status: 409 }
      );
    }

    const parsedAmount = typeof originalPricing?.price === 'number'
      ? originalPricing.price
      : typeof amount === 'number'
        ? amount
        : Number(amount);
    const checkoutAmount = originalPricing?.testProduct
      ? parsedAmount
      : roundUpToNearestTenDollars(parsedAmount);
    const formattedCheckoutAmount = checkoutAmount.toFixed(2);
    const productName = originalPricing?.title || product || 'Artwork purchase';
    const originalReferenceSlug = originalPricing?.slug.current || originalSlug || null;

    // PayPal API configuration
    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
    const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
      ? 'https://api.paypal.com' 
      : 'https://api.sandbox.paypal.com';

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'PayPal configuration missing' },
        { status: 500 }
      );
    }

    if (!normalizedCheckoutEmail) {
      return NextResponse.json(
        { error: 'Valid checkout email is required' },
        { status: 400 }
      );
    }

    if (!checkoutAmount || checkoutAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Get PayPal access token
    const tokenResponse = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      console.error('PayPal token request failed:', await tokenResponse.text());
      return NextResponse.json(
        { error: 'Failed to authenticate with PayPal' },
        { status: 500 }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('No access token received from PayPal');
      return NextResponse.json(
        { error: 'Failed to get PayPal access token' },
        { status: 500 }
      );
    }

    // Create PayPal order
    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          ...(originalReferenceSlug ? { reference_id: `original_slug:${originalReferenceSlug}` } : {}),
          amount: {
            currency_code: 'USD',
            value: formattedCheckoutAmount,
          },
          custom_id: `checkout_email:${normalizedCheckoutEmail}`,
          description: `${productName} from Megan Houssian Art${shippingOption === 'pickup' ? ' - Local Pickup in Marble Falls, TX' : ''}`,
          ...(shippingOption === 'shipping' && shippingAddress ? {
            shipping: {
              name: {
                full_name: shippingAddress.name || 'Customer',
              },
              address: {
                address_line_1: shippingAddress.addressLine1 || '',
                admin_area_2: shippingAddress.city || '',
                admin_area_1: shippingAddress.state || '',
                postal_code: shippingAddress.postalCode || '',
                country_code: shippingAddress.country || 'US',
              },
            },
          } : {}),
        },
      ],
      application_context: {
        return_url: `${baseUrl}/success`,
        cancel_url: `${baseUrl}/checkout`,
        shipping_preference: shippingOption === 'pickup' ? 'NO_SHIPPING' : 'SET_PROVIDED_ADDRESS',
      },
    };

    const orderResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderPayload),
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      console.error('PayPal order creation failed:', {
        status: orderResponse.status,
        statusText: orderResponse.statusText,
        error: orderData,
        payload: orderPayload
      });
      return NextResponse.json(
        { error: `Failed to create PayPal order: ${orderData.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    if (!orderData.id) {
      console.error('PayPal order created but no ID returned:', orderData);
      return NextResponse.json(
        { error: 'PayPal order created but no ID returned' },
        { status: 500 }
      );
    }

    console.log('PayPal order created successfully:', orderData.id);
    return NextResponse.json({ orderId: orderData.id });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return NextResponse.json(
      { error: 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}
