export const siteConfig = {
  name: 'dentil',
  description: 'Production dashboard primitives for shadcn/ui, installable from the @dentil registry.',
  /** Public URL of this site. Set NEXT_PUBLIC_SITE_URL on deploy. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dentil.dev',
};

export const registryUrl = `${siteConfig.url}/r/{name}.json`;

/** The URL that installs a registry item without adding `@dentil` to components.json. */
export function registryItemUrl(item: string) {
  return registryUrl.replace('{name}', item.replace(/^@dentil\//, ''));
}

export interface DocsEntry {
  href: string;
  title: string;
  description: string;
  /** Registry items documented on the page. */
  items: string[];
}

/** One entry per docs page. Drives the header nav, the docs sidebar, the home page cards and page headers. */
export const docs: DocsEntry[] = [
  {
    href: '/docs/data-table',
    title: 'Data Table',
    description:
      'Server-driven TanStack table with row links, sorting, pagination, tabs, filters, context menus, split view, expandable rows and cross-page selection.',
    items: ['@dentil/data-table', '@dentil/data-table-filter', '@dentil/data-table-url-state'],
  },
  {
    href: '/docs/modals',
    title: 'Modals',
    description:
      'Promise-based modal registry. await openModal(key, props) for a typed result, with lazy-loaded contents and stacking.',
    items: ['@dentil/modals'],
  },
  {
    href: '/docs/sheets',
    title: 'Sheets',
    description:
      'Promise-based side sheets with the same typed registry, plus stacking, minimize-to-dock and draft retention.',
    items: ['@dentil/sheets'],
  },
];

export function getDocsEntry(href: string): DocsEntry {
  const entry = docs.find((doc) => doc.href === href);
  if (!entry) throw new Error(`No docs entry for ${href}`);
  return entry;
}
