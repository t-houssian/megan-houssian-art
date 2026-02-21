import { NextRequest, NextResponse } from 'next/server';

// Dynamic import for EasyPost
async function initializeEasyPost(): Promise<unknown | null> {
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

export async function POST(request: NextRequest) {
  try {
    const { shipmentId, rateId, orderId } = await request.json();

    if (!shipmentId || !rateId) {
      return NextResponse.json(
        { error: 'Shipment ID and Rate ID are required' },
        { status: 400 }
      );
    }

    // Initialize EasyPost
    const easypost = await initializeEasyPost();
    if (!easypost) {
      console.log('EasyPost not configured, cannot purchase shipping label');
      return NextResponse.json(
        { error: 'Shipping service not configured' },
        { status: 500 }
      );
    }

    try {
      // Retrieve the shipment and purchase the label
      const easypostAPI = easypost as { Shipment: { retrieve: (id: string) => Promise<unknown> } };
      const shipment = await easypostAPI.Shipment.retrieve(shipmentId);
      
      // Buy the shipping label  
      const shipmentWithLabel = await (shipment as { buy: (rateId: string) => Promise<unknown> }).buy(rateId);
      
      // Cast to access properties
      const labelData = shipmentWithLabel as {
        postage_label?: { label_url?: string; label_pdf_url?: string };
        tracking_code?: string;
        selected_rate?: { rate?: string };
      };

      // Extract label information
      const labelUrl = labelData.postage_label?.label_url;
      const labelPdfUrl = labelData.postage_label?.label_pdf_url;
      const trackingCode = labelData.tracking_code;
      const shippingCost = labelData.selected_rate?.rate;

      // Log the successful label purchase
      console.log('Shipping label purchased successfully:', {
        orderId,
        shipmentId,
        trackingCode,
        shippingCost,
        labelUrl: labelUrl ? 'Available' : 'Not available',
      });

      // TODO: Store this information in your database
      // You might want to:
      // 1. Save the tracking code to your order record
      // 2. Save the label URL for easy access
      // 3. Send tracking info to customer via email
      // 4. Update order status to "shipped" or "label_created"

      return NextResponse.json({
        success: true,
        trackingCode,
        labelUrl,
        labelPdfUrl,
        shippingCost: shippingCost ? parseFloat(shippingCost) : null,
        message: 'Shipping label purchased successfully',
      });

    } catch (easyPostError) {
      console.error('EasyPost label purchase error:', easyPostError);
      return NextResponse.json(
        { error: 'Failed to purchase shipping label' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error purchasing shipping label:', error);
    return NextResponse.json(
      { error: 'Failed to purchase shipping label' },
      { status: 500 }
    );
  }
}
