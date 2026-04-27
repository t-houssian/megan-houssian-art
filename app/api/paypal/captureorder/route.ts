import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '../../../../lib/order-confirmation-email';
import { fetchOriginalCheckoutPricing, markOriginalSoldBySlug } from '../../../../lib/originals';

type PayPalPurchaseUnit = {
  reference_id?: unknown;
  custom_id?: unknown;
  description?: string;
  items?: Array<{
    sku?: unknown;
  } | null> | null;
  amount?: { value?: unknown } | null;
  payments?: {
    captures?: Array<{
      amount?: { value?: unknown } | null;
    } | null> | null;
  } | null;
  shipping?: {
    address?: {
      address_line_1?: string;
      address_line_2?: string;
      admin_area_2?: string;
      admin_area_1?: string;
      postal_code?: string;
      country_code?: string;
    };
  };
};

type PayPalOrderDetails = {
  purchase_units?: PayPalPurchaseUnit[];
};

const parseCheckoutEmailFromCustomId = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const prefix = 'checkout_email:';
  if (!value.startsWith(prefix)) return null;
  const email = value.slice(prefix.length).trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
};

const parseOriginalSlugFromReferenceId = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const prefix = 'original_slug:';
  if (!value.startsWith(prefix)) return null;
  const slug = value.slice(prefix.length).trim();
  return slug || null;
};

const parseOriginalSlugsFromReferenceId = (value: unknown): string[] => {
  if (typeof value !== 'string') return [];
  if (value.startsWith('cart_original_slugs:')) {
    return value
      .slice('cart_original_slugs:'.length)
      .split(',')
      .map((slug) => slug.trim())
      .filter(Boolean);
  }

  const slug = parseOriginalSlugFromReferenceId(value);
  return slug ? [slug] : [];
};

const getUniqueOriginalSlugs = (slugs: string[]) =>
  Array.from(new Set(slugs.map((slug) => slug.trim()).filter(Boolean)));

const parseOriginalSlugsFromPurchaseUnit = (purchaseUnit: PayPalPurchaseUnit | null | undefined): string[] => {
  const referenceSlugs = parseOriginalSlugsFromReferenceId(purchaseUnit?.reference_id);
  const itemSlugs =
    purchaseUnit?.items
      ?.map((item) => parseOriginalSlugFromReferenceId(item?.sku))
      .filter((slug): slug is string => Boolean(slug)) ?? [];

  return getUniqueOriginalSlugs([...referenceSlugs, ...itemSlugs]);
};

const getPayPalCapturedAmount = (purchaseUnit: PayPalPurchaseUnit | null | undefined): string | null => {
  const captureAmount = purchaseUnit?.payments?.captures?.find((capture) => {
    const value = capture?.amount?.value;
    return typeof value === 'string' || typeof value === 'number';
  })?.amount?.value;
  const fallbackAmount = purchaseUnit?.amount?.value;
  const amount = captureAmount ?? fallbackAmount;

  if (typeof amount === 'number' && Number.isFinite(amount)) {
    return amount.toString();
  }

  if (typeof amount === 'string' && amount.trim()) {
    return amount.trim();
  }

  return null;
};

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

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
        { error: 'Failed to authenticate with PayPal', success: false },
        { status: 500 }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('No access token received from PayPal');
      return NextResponse.json(
        { error: 'Failed to get PayPal access token', success: false },
        { status: 500 }
      );
    }

    const orderDetailsResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const orderDetails = await orderDetailsResponse.json() as PayPalOrderDetails;

    if (!orderDetailsResponse.ok) {
      console.error('PayPal order lookup failed:', orderDetails);
      return NextResponse.json(
        { error: 'Failed to verify PayPal order before capture', success: false },
        { status: 500 }
      );
    }

    const orderPurchaseUnit = orderDetails.purchase_units?.[0];
    const originalSlugs = parseOriginalSlugsFromPurchaseUnit(orderPurchaseUnit);
    const originalSlug = originalSlugs[0] ?? null;

    for (const slug of originalSlugs) {
      const originalPricing = await fetchOriginalCheckoutPricing(slug);

      if (!originalPricing) {
        return NextResponse.json(
          { error: 'Original artwork not found', success: false },
          { status: 404 }
        );
      }

      if (originalPricing.sold) {
        return NextResponse.json(
          { error: 'This original artwork has already sold', success: false },
          { status: 409 }
        );
      }
    }

    // Capture the PayPal order
    const captureResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const captureData = await captureResponse.json();

    if (!captureResponse.ok) {
      console.error('PayPal order capture failed:', captureData);
      return NextResponse.json(
        { error: 'Failed to capture PayPal order', success: false },
        { status: 500 }
      );
    }

    // Check if the capture was successful
    const isSuccessful = captureData.status === 'COMPLETED';

    if (isSuccessful) {
      // Here you can add logic to:
      // - Send confirmation email
      // - Update your database
      // - Fulfill the order
      console.log('PayPal payment captured successfully:', captureData.id);
      const purchaseUnit = (captureData.purchase_units?.[0] as PayPalPurchaseUnit | undefined) ?? orderPurchaseUnit;

      try {
        const capturedOriginalSlugs = parseOriginalSlugsFromPurchaseUnit(purchaseUnit);
        const slugsToMarkSold = capturedOriginalSlugs.length ? capturedOriginalSlugs : originalSlugs;
        const soldResults = await Promise.all(slugsToMarkSold.map((slug) => markOriginalSoldBySlug(slug)));
        console.log('PayPal original sold update:', soldResults);
        const failedSoldResults = soldResults.filter(
          (result) => result.status !== 'updated' && result.status !== 'already_sold'
        );
        if (failedSoldResults.length > 0) {
          console.error('PayPal payment captured but some originals were not marked sold:', failedSoldResults);
        }
      } catch (soldError) {
        console.error('Failed to mark PayPal original as sold:', soldError);
      }

      try {
        const shippingInfo = purchaseUnit?.shipping;
        const checkoutEmailFallback = parseCheckoutEmailFromCustomId(purchaseUnit?.custom_id);
        const amountDollars = getPayPalCapturedAmount(purchaseUnit);

        await sendOrderConfirmationEmail({
          customerEmail: captureData.payer?.email_address || checkoutEmailFallback,
          customerName: [captureData.payer?.name?.given_name, captureData.payer?.name?.surname]
            .filter(Boolean)
            .join(' ')
            .trim(),
          paymentMethod: 'paypal',
          orderId: captureData.id || orderId,
          product: purchaseUnit?.description || 'Artwork Purchase',
          amountDollars,
          shippingOption: shippingInfo ? 'shipping' : 'pickup',
          shippingAddress: shippingInfo
            ? {
                line1: shippingInfo.address?.address_line_1,
                line2: shippingInfo.address?.address_line_2,
                city: shippingInfo.address?.admin_area_2,
                state: shippingInfo.address?.admin_area_1,
                postalCode: shippingInfo.address?.postal_code,
                country: shippingInfo.address?.country_code,
              }
            : null,
        });
        console.log('PayPal confirmation email sent');
      } catch (emailError) {
        console.error('Failed to send PayPal confirmation email:', emailError);
      }
      
      // TODO: For PayPal shipping label purchasing, you'll need to:
      // 1. Store shipment_id and rate_id in a temporary storage (Redis, database, etc.) when creating the order
      // 2. Retrieve that data here using the PayPal order ID
      // 3. Purchase the shipping label similar to the Stripe webhook
      // 
      // Example implementation:
      // const shippingData = await getStoredShippingData(orderId);
      // if (shippingData?.shipmentId && shippingData?.rateId) {
      //   try {
      //     const labelResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/purchase-shipping`, {
      //       method: 'POST',
      //       headers: { 'Content-Type': 'application/json' },
      //       body: JSON.stringify({
      //         shipmentId: shippingData.shipmentId,
      //         rateId: shippingData.rateId,
      //         orderId: captureData.id,
      //       }),
      //     });
      //     // Handle label response...
      //   } catch (error) {
      //     console.error('Error purchasing shipping label:', error);
      //   }
      // }
    }

    return NextResponse.json({ 
      success: isSuccessful,
      captureId: captureData.id,
      status: captureData.status,
      details: captureData
    });
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    return NextResponse.json(
      { error: 'Failed to capture PayPal order', success: false },
      { status: 500 }
    );
  }
}
