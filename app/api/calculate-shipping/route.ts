import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { shippingAddress, package: packageDetails } = await request.json();

    // For now, let's implement a simple shipping calculation
    // You can replace this with EasyPost or another shipping service later
    
    if (!shippingAddress || !shippingAddress.country) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    let shippingCost = 0; // in cents

    // Simple shipping calculation based on country
    switch (shippingAddress.country.toUpperCase()) {
      case 'US':
      case 'UNITED STATES':
        // Domestic shipping - $10
        shippingCost = 1000;
        break;
      case 'CA':
      case 'CANADA':
        // Canada shipping - $15
        shippingCost = 1500;
        break;
      default:
        // International shipping - $25
        shippingCost = 2500;
        break;
    }

    // Add weight-based calculation if package details are provided
    if (packageDetails && packageDetails.weight) {
      const weight = packageDetails.weight;
      if (weight > 5) {
        // Add $5 for every pound over 5 lbs
        shippingCost += Math.ceil((weight - 5) * 500);
      }
    }

    return NextResponse.json({ 
      shippingCost,
      currency: 'USD',
      estimatedDays: shippingAddress.country.toUpperCase() === 'US' ? '3-5' : '7-14'
    });
  } catch (error) {
    console.error('Error calculating shipping:', error);
    return NextResponse.json(
      { error: 'Failed to calculate shipping' },
      { status: 500 }
    );
  }
}
