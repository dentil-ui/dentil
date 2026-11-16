import { track } from '@vercel/analytics/server';
import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const item = request.nextUrl.pathname.match(/^\/r\/([^/]+)\.json$/)?.[1];
  if (item && item !== 'registry' && !isBrowser(request)) {
    // scripts/tag-dependencies.mjs adds ?via=<parent> to the URLs that items list as registry dependencies.
    const via = request.nextUrl.searchParams.get('via');
    event.waitUntil(
      via && /^[a-z0-9-]+$/.test(via)
        ? track('registry_dependency', { item, via }, { request })
        : track('registry_install', { item }, { request })
    );
  }
  return NextResponse.next();
}

// Browsers send Sec-Fetch-Dest. Node's fetch and undici, which the shadcn CLI uses, send Sec-Fetch-Mode but not Sec-Fetch-Dest.
function isBrowser(request: NextRequest) {
  return request.headers.has('sec-fetch-dest');
}

export const config = { matcher: '/r/:path*' };
