import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from './lib/session';

// Routes that require authentication
const PROTECTED = ['/dashboard', '/trips', '/profile', '/admin'];

// Routes that should redirect authenticated users away (e.g., login page)
const AUTH_ONLY = ['/login'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((r) => pathname.startsWith(r));
  const isAuthOnly = AUTH_ONLY.some((r) => pathname.startsWith(r));

  if (!isProtected && !isAuthOnly) {
    return NextResponse.next();
  }

  let user = null;
  try {
    const session = await getIronSession(request.cookies, sessionOptions);
    user = session.user ?? null;
  } catch {
    // Cookie decryption failed — treat as unauthenticated
  }

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthOnly && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/trips/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/login',
  ],
};
