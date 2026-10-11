import { ogImage, ogSize } from '@/components/docs/og-image';
import { getDocsEntry } from '@/lib/site';

const doc = getDocsEntry('/docs/modals');

export const alt = `${doc.title} · dentil`;
export const size = ogSize;
export const contentType = 'image/png';

export default function Image() {
  return ogImage(doc);
}
