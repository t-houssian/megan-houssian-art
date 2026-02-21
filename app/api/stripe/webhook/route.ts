import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe only when the secret key is available
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-02-24.acacia',
  });
};

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 503 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

    let event: Stripe.Event;

    // Initialize Stripe
    const stripe = getStripe();

    // Validate webhook secret
    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET not configured, skipping signature verification');
      // In development, you might want to skip webhook verification
      // For production, this should be required
      event = JSON.parse(body);
    } else {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Payment successful:', session.id);
        console.log('Customer email:', session.customer_details?.email);
        console.log('Amount paid:', session.amount_total);
        
        // Extract shipping details from metadata
        const shipmentId = session.metadata?.shipment_id;
        const rateId = session.metadata?.rate_id;
        const shippingOption = session.metadata?.shipping_option;
        
        // If this is a shipping order with EasyPost data, purchase the label
        if (shippingOption === 'shipping' && shipmentId && rateId) {
          try {
            console.log('Purchasing shipping label for order:', session.id);
            const labelResponse = await fetch(`${baseUrl}/api/purchase-shipping`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                shipmentId,
                rateId,
                orderId: session.id,
              }),
            });
            
            const labelResult = await labelResponse.json();
            if (labelResult.success) {
              console.log('Shipping label purchased successfully:', {
                trackingCode: labelResult.trackingCode,
                labelUrl: labelResult.labelUrl,
              });
              
              // TODO: You can add additional logic here such as:
              // - Store tracking code in your database
              // - Send tracking info to customer via email
              // - Update order status
              
            } else {
              console.error('Failed to purchase shipping label:', labelResult.error);
            }
          } catch (labelError) {
            console.error('Error purchasing shipping label:', labelError);
          }
        }
        
        // Here you can also:
        // - Send confirmation email to customer
        // - Update your database with order details
        // - Send notification email to you about the sale
        // - Update inventory
        // - Fulfill the order
        
        break;
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        break;
      case 'checkout.session.expired':
        const expiredSession = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session expired:', expiredSession.id);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
