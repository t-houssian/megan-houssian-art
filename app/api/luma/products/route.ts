import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Luma Labs API helper functions
function generateSignature(method: string, path: string, params: string, secret: string): string {
  const data = `${method}${path}${params}`;
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

function buildQueryString(params: Record<string, string | number>): string {
  return Object.keys(params)
    .sort()
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
}

// Note: Currently using mock data - will be replaced with actual Luma Labs API calls
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function lumaApiRequest(endpoint: string, params: Record<string, string | number> = {}) {
  const apiKey = process.env.LUMA_PRINTS_API_KEY;
  const apiSecret = process.env.LUMA_PRINTS_API_SECRET;
  const baseUrl = 'https://api.lumalabs.ai/dream-machine/v1';
  
  if (!apiKey || !apiSecret) {
    throw new Error('Luma Labs API credentials not configured');
  }

  // Add required parameters
  const requestParams = {
    ...params,
    api_key: apiKey,
    timestamp: Math.floor(Date.now() / 1000),
  };

  const queryString = buildQueryString(requestParams);
  const signature = generateSignature('GET', endpoint, queryString, apiSecret);
  
  const url = `${baseUrl}${endpoint}?${queryString}&signature=${signature}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Luma API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function GET() {
  try {
    // Complete Luma Labs print options - expanded with all available types and sizes
    const printOptions = {
      "canvas-075": {
        name: "Canvas Print (0.75″ thick)",
        description: "High-quality stretched canvas on wooden frame. Perfect for framing. Archival poly-cotton mix canvas.",
        sizes: [
          { name: "8×10″", price: 9.89, value: "8x10" },
          { name: "8×12″", price: 15.39, value: "8x12" },
          { name: "10×20″", price: 22.73, value: "10x20" },
          { name: "10×30″", price: 26.40, value: "10x30" },
          { name: "11×14″", price: 12.09, value: "11x14" },
          { name: "12×12″", price: 18.31, value: "12x12" },
          { name: "12×16″", price: 20.44, value: "12x16" },
          { name: "12×18″", price: 21.18, value: "12x18" },
          { name: "16×20″", price: 24.35, value: "16x20" },
          { name: "16×24″", price: 27.30, value: "16x24" },
          { name: "18×24″", price: 28.26, value: "18x24" },
          { name: "20×20″", price: 27.46, value: "20x20" },
          { name: "20×40″", price: 38.96, value: "20x40" },
          { name: "20×60″", price: 66.85, value: "20x60" },
          { name: "24×30″", price: 36.68, value: "24x30" },
          { name: "24×32″", price: 37.64, value: "24x32" },
          { name: "24×36″", price: 39.56, value: "24x36" },
          { name: "30×30″", price: 42.54, value: "30x30" },
          { name: "30×40″", price: 66.85, value: "30x40" },
          { name: "30×60″", price: 93.49, value: "30x60" }
        ]
      },
      "canvas-125": {
        name: "Canvas Print (1.25″ thick)",
        description: "Cost-efficient middle-ground option. Archival polyester canvas with sawtooth hanging.",
        sizes: [
          { name: "8×10″", price: 10.99, value: "8x10" },
          { name: "8×12″", price: 16.23, value: "8x12" },
          { name: "10×20″", price: 24.13, value: "10x20" },
          { name: "10×30″", price: 28.26, value: "10x30" },
          { name: "11×14″", price: 13.19, value: "11x14" },
          { name: "12×12″", price: 19.36, value: "12x12" },
          { name: "12×16″", price: 21.68, value: "12x16" },
          { name: "12×18″", price: 22.50, value: "12x18" },
          { name: "16×20″", price: 25.95, value: "16x20" },
          { name: "16×24″", price: 29.07, value: "16x24" },
          { name: "18×24″", price: 30.12, value: "18x24" },
          { name: "20×20″", price: 29.23, value: "20x20" },
          { name: "20×40″", price: 41.63, value: "20x40" },
          { name: "20×60″", price: 55.34, value: "20x60" },
          { name: "24×30″", price: 39.07, value: "24x30" },
          { name: "24×32″", price: 40.11, value: "24x32" },
          { name: "24×36″", price: 42.21, value: "24x36" },
          { name: "30×30″", price: 45.20, value: "30x30" },
          { name: "30×40″", price: 50.99, value: "30x40" },
          { name: "30×60″", price: 80.03, value: "30x60" },
          { name: "32×48″", price: 79.69, value: "32x48" },
          { name: "36×48″", price: 86.33, value: "36x48" },
          { name: "40×40″", price: 81.37, value: "40x40" },
          { name: "40×60″", price: 112.07, value: "40x60" },
          { name: "45×60″", price: 118.17, value: "45x60" }
        ]
      },
      "canvas-150": {
        name: "Canvas Print (1.50″ thick)",
        description: "Premium thick profile, perfect for hanging without framing. Archival poly-cotton mix canvas.",
        sizes: [
          { name: "8×10″", price: 12.09, value: "8x10" },
          { name: "8×12″", price: 18.76, value: "8x12" },
          { name: "10×20″", price: 28.29, value: "10x20" },
          { name: "10×30″", price: 33.82, value: "10x30" },
          { name: "11×14″", price: 14.29, value: "11x14" },
          { name: "12×12″", price: 22.56, value: "12x12" },
          { name: "12×16″", price: 25.40, value: "12x16" },
          { name: "12×18″", price: 26.49, value: "12x18" },
          { name: "16×20″", price: 30.73, value: "16x20" },
          { name: "16×24″", price: 34.39, value: "16x24" },
          { name: "18×24″", price: 35.69, value: "18x24" },
          { name: "20×20″", price: 34.54, value: "20x20" },
          { name: "20×40″", price: 49.59, value: "20x40" },
          { name: "20×60″", price: 65.97, value: "20x60" },
          { name: "24×30″", price: 46.23, value: "24x30" },
          { name: "24×32″", price: 47.56, value: "24x32" },
          { name: "24×36″", price: 50.19, value: "24x36" },
          { name: "30×30″", price: 53.17, value: "30x30" },
          { name: "30×40″", price: 60.29, value: "30x40" },
          { name: "30×60″", price: 94.26, value: "30x60" },
          { name: "32×48″", price: 93.87, value: "32x48" },
          { name: "36×48″", price: 101.20, value: "36x48" },
          { name: "40×40″", price: 95.54, value: "40x40" },
          { name: "40×60″", price: 131.03, value: "40x60" },
          { name: "45×60″", price: 138.10, value: "45x60" }
        ]
      },
      "canvas-rolled": {
        name: "Canvas Print (Rolled)",
        description: "Unstretched canvas perfect for transport and custom framing. Most affordable option.",
        sizes: [
          { name: "8×10″", price: 9.13, value: "8x10" },
          { name: "8×12″", price: 10.28, value: "8x12" },
          { name: "10×20″", price: 13.05, value: "10x20" },
          { name: "10×30″", price: 14.87, value: "10x30" },
          { name: "11×14″", price: 12.20, value: "11x14" },
          { name: "12×12″", price: 12.02, value: "12x12" },
          { name: "12×16″", price: 12.85, value: "12x16" },
          { name: "12×18″", price: 13.25, value: "12x18" },
          { name: "16×20″", price: 14.92, value: "16x20" },
          { name: "16×24″", price: 15.96, value: "16x24" },
          { name: "18×24″", price: 16.67, value: "18x24" },
          { name: "20×20″", price: 17.74, value: "20x20" },
          { name: "20×40″", price: 23.96, value: "20x40" },
          { name: "20×60″", price: 30.18, value: "20x60" },
          { name: "24×30″", price: 22.62, value: "24x30" },
          { name: "24×32″", price: 23.35, value: "24x32" },
          { name: "24×36″", price: 24.80, value: "24x36" },
          { name: "30×30″", price: 25.26, value: "30x30" },
          { name: "30×40″", price: 32.83, value: "30x40" },
          { name: "30×60″", price: 41.64, value: "30x60" },
          { name: "32×48″", price: 37.70, value: "32x48" },
          { name: "36×48″", price: 40.39, value: "36x48" },
          { name: "40×40″", price: 40.10, value: "40x40" },
          { name: "40×60″", price: 51.51, value: "40x60" },
          { name: "45×60″", price: 55.66, value: "45x60" }
        ]
      },
      "framed-canvas": {
        name: "Framed Canvas Print",
        description: "Canvas print with elegant wooden frame. Ready to hang immediately.",
        sizes: [
          { name: "8×10″", price: 45.00, value: "8x10" },
          { name: "11×14″", price: 65.00, value: "11x14" },
          { name: "16×20″", price: 85.00, value: "16x20" },
          { name: "18×24″", price: 105.00, value: "18x24" },
          { name: "20×24″", price: 115.00, value: "20x24" },
          { name: "24×30″", price: 145.00, value: "24x30" },
          { name: "24×36″", price: 165.00, value: "24x36" }
        ]
      },
      "fine-art-paper": {
        name: "Fine Art Paper Print",
        description: "Premium archival paper with museum-quality pigment inks. Acid-free and pH neutral.",
        sizes: [
          { name: "5×7″", price: 8.50, value: "5x7" },
          { name: "8×10″", price: 12.00, value: "8x10" },
          { name: "8×12″", price: 15.50, value: "8x12" },
          { name: "11×14″", price: 18.00, value: "11x14" },
          { name: "12×16″", price: 22.00, value: "12x16" },
          { name: "12×18″", price: 25.00, value: "12x18" },
          { name: "16×20″", price: 28.00, value: "16x20" },
          { name: "16×24″", price: 32.00, value: "16x24" },
          { name: "18×24″", price: 35.00, value: "18x24" },
          { name: "20×24″", price: 38.00, value: "20x24" },
          { name: "20×30″", price: 42.00, value: "20x30" },
          { name: "24×30″", price: 48.00, value: "24x30" },
          { name: "24×36″", price: 55.00, value: "24x36" }
        ]
      },
      "framed-fine-art": {
        name: "Framed Fine Art Paper",
        description: "Fine art paper with professional matting and elegant frame. Museum-quality presentation.",
        sizes: [
          { name: "8×10″", price: 55.00, value: "8x10" },
          { name: "11×14″", price: 75.00, value: "11x14" },
          { name: "16×20″", price: 95.00, value: "16x20" },
          { name: "18×24″", price: 115.00, value: "18x24" },
          { name: "20×24″", price: 125.00, value: "20x24" },
          { name: "24×30″", price: 155.00, value: "24x30" },
          { name: "24×36″", price: 175.00, value: "24x36" }
        ]
      },
      "foam-mounted": {
        name: "Foam-Mounted Fine Art Paper",
        description: "Fine art paper mounted on foam core for durability and easy display.",
        sizes: [
          { name: "8×10″", price: 25.00, value: "8x10" },
          { name: "11×14″", price: 35.00, value: "11x14" },
          { name: "16×20″", price: 45.00, value: "16x20" },
          { name: "18×24″", price: 55.00, value: "18x24" },
          { name: "20×24″", price: 60.00, value: "20x24" },
          { name: "24×30″", price: 75.00, value: "24x30" },
          { name: "24×36″", price: 85.00, value: "24x36" }
        ]
      },
      "metal-print": {
        name: "Metal Print",
        description: "Vibrant colors on durable aluminum with high gloss finish. Weather-resistant and modern.",
        sizes: [
          { name: "8×10″", price: 40.00, value: "8x10" },
          { name: "11×14″", price: 60.00, value: "11x14" },
          { name: "12×16″", price: 70.00, value: "12x16" },
          { name: "16×20″", price: 80.00, value: "16x20" },
          { name: "16×24″", price: 95.00, value: "16x24" },
          { name: "18×24″", price: 100.00, value: "18x24" },
          { name: "20×24″", price: 110.00, value: "20x24" },
          { name: "20×30″", price: 120.00, value: "20x30" },
          { name: "24×30″", price: 125.00, value: "24x30" },
          { name: "24×36″", price: 145.00, value: "24x36" },
          { name: "30×40″", price: 185.00, value: "30x40" }
        ]
      },
      "peel-and-stick": {
        name: "Peel and Stick Print",
        description: "Removable wall art perfect for renters. Easy application with no damage to walls.",
        sizes: [
          { name: "12×12″", price: 25.00, value: "12x12" },
          { name: "16×20″", price: 35.00, value: "16x20" },
          { name: "18×24″", price: 40.00, value: "18x24" },
          { name: "20×24″", price: 45.00, value: "20x24" },
          { name: "24×30″", price: 55.00, value: "24x30" },
          { name: "24×36″", price: 65.00, value: "24x36" },
          { name: "30×40″", price: 85.00, value: "30x40" }
        ]
      }
    };

    return NextResponse.json({ 
      success: true,
      printOptions,
      message: 'Print options retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching Luma Labs products:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch print options',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
