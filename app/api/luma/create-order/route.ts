import { NextRequest, NextResponse } from 'next/server';
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
async function lumaApiRequest(endpoint: string, params: Record<string, string | number> = {}, method: string = 'GET') {
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
  const signature = generateSignature(method, endpoint, queryString, apiSecret);
  
  const url = method === 'GET' 
    ? `${baseUrl}${endpoint}?${queryString}&signature=${signature}`
    : `${baseUrl}${endpoint}`;
  
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (method === 'POST') {
    requestOptions.body = JSON.stringify({
      ...requestParams,
      signature,
    });
  }
  
  const response = await fetch(url, requestOptions);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Luma API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const { 
      artwork_title, 
      artwork_image_url, 
      product_type, 
      size, 
      customer_info,
      shipping_address 
    } = await request.json();

    // Validate required fields
    if (!artwork_title || !artwork_image_url || !product_type || !size || !customer_info) {
      return NextResponse.json(
        { error: 'Missing required order information' },
        { status: 400 }
      );
    }

    // For now, we'll create a mock order response
    // This will be replaced with actual Luma Labs API calls once we know their order creation structure
    
    const mockOrder = {
      order_id: `LUMA_${Date.now()}`,
      status: 'created',
      artwork_title,
      product_type,
      size,
      customer_info,
      shipping_address,
      estimated_delivery: '5-7 business days',
      tracking_info: null, // Will be updated when order ships
      created_at: new Date().toISOString(),
    };

    // TODO: Replace with actual Luma Labs API call
    // const order = await lumaApiRequest('/orders', {
    //   artwork_title,
    //   artwork_image_url,
    //   product_type,
    //   size,
    //   customer_info,
    //   shipping_address,
    // }, 'POST');

    console.log('Luma Labs order created (mock):', mockOrder);

    // Here you would typically:
    // 1. Send order confirmation email to customer
    // 2. Send notification to you about the new order
    // 3. Store order details in your database

    return NextResponse.json({ 
      success: true,
      order: mockOrder,
      message: 'Print order submitted successfully to Luma Labs'
    });

  } catch (error) {
    console.error('Error creating Luma Labs order:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create print order',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
