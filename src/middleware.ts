import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Grab the authorization header from the browser
  const authHeader = req.headers.get('authorization');

  // If they haven't typed a password yet, trigger the browser's login popup
  if (!authHeader) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin Dashboard"' },
    });
  }

  // Decode the username and password they typed
  const authValue = authHeader.split(' ')[1];
  const decodedValue = atob(authValue);
  const [username, password] = decodedValue.split(':');

  // Check it against your secret .env password
  const validPassword = "Gonja420!";

  // We hardcode the username to 'admin' for simplicity
  if (username === 'admin' && password === validPassword) {
    return NextResponse.next(); // Password correct! Let them in.
  }

  // Password wrong! Trigger the popup again.
  return new NextResponse('Invalid credentials', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin Dashboard"' },
  });
}

// Tell the bouncer to ONLY guard the /admin page
export const config = {
  matcher: ['/admin/:path*'],
};