import { NextResponse } from 'next/server';

const ACCESS_COOKIE_NAME = 'mha-collectors-access';
const ACCESS_PASSWORD = 'HillCountry26';

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get('password') || '');

  if (password !== ACCESS_PASSWORD) {
    return NextResponse.redirect(new URL('/originals-collectors-access?error=invalid-password', request.url));
  }

  const response = NextResponse.redirect(new URL('/originals-collectors-access', request.url));
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: 'granted',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/originals-collectors-access',
    maxAge: 60 * 60 * 12,
  });

  return response;
}
