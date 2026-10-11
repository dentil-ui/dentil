import { ogImage, ogSize } from '@/components/docs/og-image';
import { siteConfig } from '@/lib/site';

export const alt = siteConfig.description;
export const size = ogSize;
export const contentType = 'image/png';

export default function Image() {
  return ogImage({
    title: 'Production dashboard primitives for shadcn/ui.',
    description: 'Data tables, modals and sheets you install with the shadcn CLI and own outright.',
    items: ['@dentil/data-table', '@dentil/modals', '@dentil/sheets'],
  });
}
