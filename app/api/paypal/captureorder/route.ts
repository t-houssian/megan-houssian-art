import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '../../../../lib/order-confirmation-email';

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

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

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

      try {
        const purchaseUnit = captureData.purchase_units?.[0];
        const shippingInfo = purchaseUnit?.shipping;

        await sendOrderConfirmationEmail({
          customerEmail: captureData.payer?.email_address,
          customerName: [captureData.payer?.name?.given_name, captureData.payer?.name?.surname]
            .filter(Boolean)
            .join(' ')
            .trim(),
          paymentMethod: 'paypal',
          orderId: captureData.id || orderId,
          product: purchaseUnit?.description || 'Artwork Purchase',
          amountDollars: purchaseUnit?.amount?.value,
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
