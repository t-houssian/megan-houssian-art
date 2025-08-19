import { NextRequest, NextResponse } from 'next/server';

// Type definitions for EasyPost (until proper types are available)
interface EasyPostRate {
  id: string;
  service: string;
  carrier: string;
  rate: string;
  delivery_days?: number;
  delivery_date?: string;
  est_delivery_date?: string;
}

interface EasyPostShipment {
  id: string;
  rates: EasyPostRate[];
}

interface ShipmentData {
  to_address: {
    name: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  from_address: {
    name: string;
    street1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  parcel: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
}

interface EasyPostAPI {
  Shipment: {
    create: (shipmentData: ShipmentData) => Promise<EasyPostShipment>;
  };
}

// Dynamic import for EasyPost to handle potential import issues
let easypost: EasyPostAPI | null = null;

async function initializeEasyPost(): Promise<EasyPostAPI | null> {
  try {
    if (process.env.EASYPOST_API_KEY && process.env.EASYPOST_API_KEY !== 'EZAK_your_test_api_key_here') {
      const EasyPost = (await import('@easypost/api')).default;
      return new EasyPost(process.env.EASYPOST_API_KEY);
    }
    return null;
  } catch (error) {
    console.error('EasyPost initialization error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { shippingAddress, package: packageDetails } = await request.json();

    if (!shippingAddress || !shippingAddress.country) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    // Initialize EasyPost if not already done
    if (!easypost) {
      easypost = await initializeEasyPost();
    }

    // If EasyPost is not configured, fall back to simple calculation
    if (!easypost) {
      console.log('EasyPost not configured, using fallback shipping calculation');
      return calculateFallbackShipping(shippingAddress, packageDetails);
    }

    try {
      // Create shipment to get rates from EasyPost
      const shipment = await easypost.Shipment.create({
        to_address: {
          name: shippingAddress.name,
          street1: shippingAddress.addressLine1,
          street2: shippingAddress.addressLine2 || '',
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip: shippingAddress.postalCode,
          country: shippingAddress.country,
        },
        from_address: {
          name: "Megan Houssian Art",
          street1: "Your Gallery Address", // TODO: Replace with actual address
          city: "Marble Falls",
          state: "TX",
          zip: "78654",
          country: "US",
        },
        parcel: {
          length: packageDetails?.dimensions?.length || 12,
          width: packageDetails?.dimensions?.width || 9,
          height: packageDetails?.dimensions?.height || 2,
          weight: packageDetails?.weight || 16, // ounces
        },
      });

      // Get available shipping rates
      const rates = shipment.rates.map((rate: EasyPostRate) => ({
        id: rate.id,
        service: rate.service,
        carrier: rate.carrier,
        rate: Math.round(parseFloat(rate.rate) * 100), // Convert to cents
        delivery_days: rate.delivery_days,
        delivery_date: rate.delivery_date,
        est_delivery_date: rate.est_delivery_date,
      }));

      // Sort rates by price (cheapest first)
      rates.sort((a: { rate: number }, b: { rate: number }) => a.rate - b.rate);

      return NextResponse.json({ 
        rates,
        shipmentId: shipment.id, // Store this for label purchase
        success: true,
      });

    } catch (easyPostError) {
      console.error('EasyPost API error:', easyPostError);
      // Fall back to simple calculation if EasyPost fails
      return calculateFallbackShipping(shippingAddress, packageDetails);
    }

  } catch (error) {
    console.error('Error calculating shipping:', error);
    return NextResponse.json(
      { error: 'Failed to calculate shipping' },
      { status: 500 }
    );
  }
}

interface ShippingAddress {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface PackageDetails {
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

// Fallback shipping calculation (your original logic)
function calculateFallbackShipping(shippingAddress: ShippingAddress, packageDetails: PackageDetails) {
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
    rates: [{
      id: 'fallback-standard',
      service: 'Standard Shipping',
      carrier: 'USPS',
      rate: shippingCost,
      delivery_days: shippingAddress.country.toUpperCase() === 'US' ? 5 : 14,
      delivery_date: null,
    }],
    shipmentId: null,
    success: true,
    fallback: true,
  });
}
