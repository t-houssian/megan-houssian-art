import { NextResponse } from 'next/server';
import { COLLECTOR_ACCESS_COOKIE_NAME } from '../../../lib/collector-access';

const ACCESS_PASSWORD = 'HillCountry26';

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get('password') || '').trim();

  if (password !== ACCESS_PASSWORD) {
    return NextResponse.redirect(new URL('/originals?error=invalid-password#collector-access', request.url), 303);
  }

  const response = NextResponse.redirect(new URL('/originals', request.url), 303);
  response.cookies.set({
    name: COLLECTOR_ACCESS_COOKIE_NAME,
    value: 'granted',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });

  return response;
}
