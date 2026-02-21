import { NextResponse } from 'next/server';

export async function GET() {
  const publishableKey =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    process.env.STRIPE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return NextResponse.json(
      { error: 'Stripe publishable key is not configured.' },
      { status: 503 }
    );
  }

  if (!publishableKey.startsWith('pk_')) {
    return NextResponse.json(
      { error: 'Invalid Stripe publishable key configuration.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ publishableKey });
}
