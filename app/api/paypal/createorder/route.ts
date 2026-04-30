import { NextRequest, NextResponse } from 'next/server';
import { dollarsToCents, roundUpCentsToNearestTenDollars } from '../../../../lib/money';
import {
  fetchOriginalCheckoutPricing,
  validateOriginalSoldWriteAccess,
} from '../../../../lib/originals';
import { cartToPayPalItems, validateCartForCheckout } from '../../../../lib/cart-checkout';
import {
  calculateTexasSalesTaxCents,
  TEXAS_SALES_TAX_PERCENT_LABEL,
} from '../../../../lib/sales-tax';

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
    const {
      amount,
      product,
      originalSlug,
      shippingAddress,
      shippingOption,
      checkoutEmail,
      cartItems,
    } = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const normalizedCheckoutEmail = isValidEmail(checkoutEmail) ? checkoutEmail.trim().toLowerCase() : null;
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

    const parsedAmount = typeof originalPricing?.price === 'number'
      ? originalPricing.price
      : typeof amount === 'number'
        ? amount
        : Number(amount);
    const rawAmountCents = dollarsToCents(parsedAmount);
    const checkoutSubtotalCents = validatedCart?.totalCents ?? (originalPricing?.testProduct
      ? rawAmountCents
      : roundUpCentsToNearestTenDollars(rawAmountCents));
    const salesTaxCents = calculateTexasSalesTaxCents(
      checkoutSubtotalCents,
      shippingOption || 'shipping',
      shippingOption === 'pickup' ? null : shippingAddress
    );
    const checkoutTotalCents = checkoutSubtotalCents + salesTaxCents;
    const formattedCheckoutSubtotal = (checkoutSubtotalCents / 100).toFixed(2);
    const formattedSalesTax = (salesTaxCents / 100).toFixed(2);
    const formattedCheckoutTotal = (checkoutTotalCents / 100).toFixed(2);
    const productName = validatedCart?.productSummary || originalPricing?.title || product || 'Artwork purchase';
    const originalReferenceSlug = originalPricing?.slug.current || originalSlug || null;
    const originalSlugsForSale = validatedCart?.originalSlugs ?? (originalReferenceSlug ? [originalReferenceSlug] : []);

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

    if (!checkoutSubtotalCents || checkoutSubtotalCents <= 0) {
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
          ...(validatedCart?.originalSlugs.length ? { reference_id: `cart_original_slugs:${validatedCart.originalSlugs.join(',')}` } : {}),
          amount: {
            currency_code: 'USD',
            value: formattedCheckoutTotal,
            breakdown: {
              item_total: { currency_code: 'USD', value: formattedCheckoutSubtotal },
              ...(salesTaxCents > 0 ? { tax_total: { currency_code: 'USD', value: formattedSalesTax } } : {}),
            },
          },
          ...(validatedCart ? { items: cartToPayPalItems(validatedCart) } : {
            items: [
              {
                name: productName.slice(0, 127),
                description: `Original artwork by Megan Houssian${shippingOption === 'pickup' ? ' - Local Pickup in Marble Falls, TX' : ''}`.slice(0, 127),
                ...(originalReferenceSlug ? { sku: `original_slug:${originalReferenceSlug}`.slice(0, 127) } : {}),
                quantity: '1',
                unit_amount: {
                  currency_code: 'USD',
                  value: formattedCheckoutSubtotal,
                },
              },
            ],
          }),
          custom_id: `checkout_email:${normalizedCheckoutEmail}`,
          description: `${productName} from Megan Houssian Art${shippingOption === 'pickup' ? ' - Local Pickup in Marble Falls, TX' : ''}${salesTaxCents > 0 ? ` - Texas Sales Tax ${TEXAS_SALES_TAX_PERCENT_LABEL} included` : ''}`,
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
