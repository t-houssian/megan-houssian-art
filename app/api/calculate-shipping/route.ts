import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { shippingAddress } = await request.json();

    if (!shippingAddress || !shippingAddress.country) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    // Free-shipping mode: EasyPost and shipping calculations are disabled.
    return NextResponse.json({
      rates: [
        {
          id: 'free-shipping',
          service: 'Shipping',
          carrier: 'Megan Houssian Art',
          rate: 0,
          delivery_days: 14,
          delivery_date: null,
        },
      ],
      shipmentId: null,
      success: true,
      freeShipping: true,
    });
  } catch (error) {
    console.error('Error returning free shipping:', error);
    return NextResponse.json(
      { error: 'Failed to process shipping request' },
      { status: 500 }
    );
  }
}
