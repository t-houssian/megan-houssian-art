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

type EasyPostFromAddress = ShipmentData['from_address'];

// Dynamic import for EasyPost to handle potential import issues
let easypost: EasyPostAPI | null = null;

async function initializeEasyPost(): Promise<EasyPostAPI | null> {
  try {
    const easyPostApiKey = process.env.EASYPOST_API_KEY?.trim();
    if (
      easyPostApiKey &&
      easyPostApiKey !== 'EZAK_your_test_api_key_here' &&
      easyPostApiKey !== 'EZTK_your_test_api_key_here'
    ) {
      const EasyPost = (await import('@easypost/api')).default;
      return new EasyPost(easyPostApiKey);
    }
    return null;
  } catch (error) {
    console.error('EasyPost initialization error:', error);
    return null;
  }
}

function getEasyPostFromAddress(): EasyPostFromAddress | null {
  const street1 = process.env.EASYPOST_FROM_STREET1?.trim();
  const city = process.env.EASYPOST_FROM_CITY?.trim();
  const state = process.env.EASYPOST_FROM_STATE?.trim();
  const zip = process.env.EASYPOST_FROM_ZIP?.trim();
  const country = process.env.EASYPOST_FROM_COUNTRY?.trim() || 'US';
  const name = process.env.EASYPOST_FROM_NAME?.trim() || 'Megan Houssian Art';

  if (!street1 || !city || !state || !zip) {
    return null;
  }

  return {
    name,
    street1,
    city,
    state,
    zip,
    country,
  };
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

    const artworkPackage = normalizePackageDetails(packageDetails);
    const boxedPackage = applyPackagingBuffer(artworkPackage, 2);
    const handlingFee = calculateHandlingFeeCents(artworkPackage);

    // Initialize EasyPost if not already done
    if (!easypost) {
      easypost = await initializeEasyPost();
    }

    // If EasyPost is not configured, fall back to simple calculation
    if (!easypost) {
      console.log('EasyPost not configured, using fallback shipping calculation');
      return calculateFallbackShipping(shippingAddress, artworkPackage, handlingFee);
    }

    const fromAddress = getEasyPostFromAddress();
    if (!fromAddress) {
      console.log('EasyPost from address is not configured, using fallback shipping calculation');
      return calculateFallbackShipping(shippingAddress, artworkPackage, handlingFee);
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
        from_address: fromAddress,
        parcel: {
          length: boxedPackage.dimensions.length,
          width: boxedPackage.dimensions.width,
          height: boxedPackage.dimensions.height,
          weight: boxedPackage.weight, // ounces
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

      const cheapestRate = rates[0];
      if (!cheapestRate) {
        console.log('No EasyPost rates returned, using fallback shipping calculation');
        return calculateFallbackShipping(shippingAddress, artworkPackage, handlingFee);
      }

      const shippingAndHandlingRate = cheapestRate.rate + handlingFee;

      return NextResponse.json({ 
        rates: [{
          id: 'shipping-and-handling',
          service: 'Shipping',
          carrier: 'Estimated',
          rate: shippingAndHandlingRate,
          delivery_days: 14,
          delivery_date: null,
        }],
        shipmentId: null,
        success: true,
      });

    } catch (easyPostError) {
      console.error('EasyPost API error:', easyPostError);
      // Fall back to simple calculation if EasyPost fails
      return calculateFallbackShipping(shippingAddress, artworkPackage, handlingFee);
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
  weight?: number;
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
  };
}

function parsePositiveNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }
  return fallback;
}

function normalizePackageDetails(packageDetails?: PackageDetails) {
  return {
    weight: parsePositiveNumber(packageDetails?.weight, 16), // ounces
    dimensions: {
      length: parsePositiveNumber(packageDetails?.dimensions?.length, 12),
      width: parsePositiveNumber(packageDetails?.dimensions?.width, 9),
      height: parsePositiveNumber(packageDetails?.dimensions?.height, 2),
    },
  };
}

function applyPackagingBuffer(packageDetails: ReturnType<typeof normalizePackageDetails>, bufferInches: number) {
  return {
    ...packageDetails,
    dimensions: {
      length: packageDetails.dimensions.length + bufferInches,
      width: packageDetails.dimensions.width + bufferInches,
      height: packageDetails.dimensions.height + bufferInches,
    },
  };
}

function calculateHandlingFeeCents(packageDetails: ReturnType<typeof normalizePackageDetails>): number {
  const sortedDimensions = [
    packageDetails.dimensions.length,
    packageDetails.dimensions.width,
    packageDetails.dimensions.height,
  ].sort((a, b) => b - a);
  const longestSide = sortedDimensions[0];
  const secondLongestSide = sortedDimensions[1];

  if (longestSide >= 48 || secondLongestSide >= 36) return 4000;
  if (longestSide >= 36 || secondLongestSide >= 24) return 3000;
  if (longestSide >= 24 || secondLongestSide >= 18) return 2000;
  return 1000;
}

function calculateDomesticFallbackShippingCost(packageDetails: ReturnType<typeof normalizePackageDetails>): number {
  const { weight, dimensions } = packageDetails;
  const sortedDimensions = [dimensions.length, dimensions.width, dimensions.height].sort((a, b) => b - a);
  const longestSide = sortedDimensions[0];
  const secondLongestSide = sortedDimensions[1];
  const footprint = longestSide * secondLongestSide;

  // Tiered artwork shipping pricing. 48x36 resolves to $200.
  let shippingCost = 3500;
  if (longestSide >= 48 || footprint >= 1700) {
    shippingCost = 20000;
  } else if (longestSide >= 40 || footprint >= 1200) {
    shippingCost = 14500;
  } else if (longestSide >= 30 || footprint >= 700) {
    shippingCost = 9000;
  } else if (longestSide >= 20 || footprint >= 350) {
    shippingCost = 6000;
  }

  // Weight is in ounces; only surcharge above 10 lbs.
  const overweightPounds = Math.max(0, weight - 160) / 16;
  shippingCost += Math.ceil(overweightPounds * 500); // $5/lb over 10 lbs

  return shippingCost;
}

// Fallback shipping calculation
function calculateFallbackShipping(
  shippingAddress: ShippingAddress,
  packageDetails: ReturnType<typeof normalizePackageDetails>,
  handlingFee: number
) {
  const boxedPackage = applyPackagingBuffer(packageDetails, 2);
  const country = shippingAddress.country.toUpperCase();
  const domesticCost = calculateDomesticFallbackShippingCost(boxedPackage);
  let shippingCost = domesticCost;

  switch (country) {
    case 'US':
    case 'UNITED STATES':
      shippingCost = domesticCost;
      break;
    case 'CA':
    case 'CANADA':
      shippingCost = Math.round(domesticCost * 1.35) + 2500;
      break;
    default:
      shippingCost = Math.round(domesticCost * 2.1) + 4000;
      break;
  }

  const totalShippingAndHandling = shippingCost + handlingFee;

  return NextResponse.json({ 
    rates: [{
      id: 'shipping-and-handling',
      service: 'Shipping',
      carrier: 'Estimated',
      rate: totalShippingAndHandling,
      delivery_days: 14,
      delivery_date: null,
    }],
    shipmentId: null,
    success: true,
    fallback: true,
  });
}
