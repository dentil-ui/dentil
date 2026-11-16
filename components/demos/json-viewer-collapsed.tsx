'use client';

import { JsonViewer } from '@/components/dentil/json-viewer/json-viewer';

const request = {
  method: 'POST',
  path: '/v1/customers',
  status: 200,
  duration_ms: 182,
  headers: {
    'content-type': 'application/json',
    'idempotency-key': '8c1f0b6e-7a52-4d3e-9a0f-3b2d6c41e9a7',
  },
  body: {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    address: { line1: '12 Analytical Row', city: 'London', postal_code: 'N1 9GU', country: 'GB' },
  },
  tags: ['api', 'live'],
};

export function JsonViewerCollapsedDemo() {
  return <JsonViewer data={request} defaultExpandDepth={1} className="w-full" />;
}
