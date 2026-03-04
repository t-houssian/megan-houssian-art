import { NextResponse } from 'next/server';

export async function POST() {
  // Free-shipping mode: label purchasing is intentionally disabled.
  return NextResponse.json(
    {
      success: false,
      disabled: true,
      message: 'Shipping label purchasing is disabled while free shipping mode is active.',
    },
    { status: 503 }
  );
}
