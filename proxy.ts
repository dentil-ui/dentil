import { track } from '@vercel/analytics/server';
import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const item = request.nextUrl.pathname.match(/^\/r\/([^/]+)\.json$/)?.[1];
  if (item && item !== 'registry' && !isBrowser(request)) {
    event.waitUntil(track('registry_install', { item }, { request }));
  }
  return NextResponse.next();
}

// Browsers send Sec-Fetch-Dest. Node's fetch and undici, which the shadcn CLI uses, send Sec-Fetch-Mode but not Sec-Fetch-Dest.
function isBrowser(request: NextRequest) {
  return request.headers.has('sec-fetch-dest');
}

export const config = { matcher: '/r/:path*' };
