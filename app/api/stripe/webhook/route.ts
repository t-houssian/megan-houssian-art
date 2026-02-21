import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sendOrderConfirmationEmail } from '../../../../lib/order-confirmation-email';

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

        try {
          await sendOrderConfirmationEmail({
            customerEmail: session.customer_details?.email || session.customer_email,
            customerName: session.customer_details?.name,
            paymentMethod: 'stripe',
            orderId: session.id,
            product: session.metadata?.product || 'Artwork Purchase',
            amountCents: session.amount_total,
            shippingOption: session.metadata?.shipping_option,
            shippingAddress: {
              line1: session.metadata?.shipping_address,
              city: session.metadata?.shipping_city,
              state: session.metadata?.shipping_state,
              postalCode: session.metadata?.shipping_postal_code,
              country: session.metadata?.shipping_country,
            },
          });
          console.log('Stripe confirmation email sent');
        } catch (emailError) {
          console.error('Failed to send Stripe confirmation email:', emailError);
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
