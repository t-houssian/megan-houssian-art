import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { amount, shippingAddress, shippingOption } = await request.json();

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
          amount: {
            currency_code: 'USD',
            value: amount, // amount in dollars
          },
          description: `Artwork purchase from Megan Houssian Art${shippingOption === 'pickup' ? ' - Local Pickup in Marble Falls, TX' : ''}`,
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
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout`,
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
