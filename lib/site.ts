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

/** Sidebar and card groups, in display order. */
export const docsGroups = ['Components', 'Form inputs'] as const;

export type DocsGroup = (typeof docsGroups)[number];

export interface DocsEntry {
  href: string;
  title: string;
  description: string;
  /** Registry items documented on the page. */
  items: string[];
  group: DocsGroup;
}

/** One entry per docs page. Drives the docs index, the docs sidebar, the home page cards and page headers. */
export const docs: DocsEntry[] = [
  {
    href: '/docs/data-table',
    title: 'Data Table',
    description:
      'Server-driven TanStack table with row links, sorting, pagination, tabs, filters, context menus, split view, expandable rows and cross-page selection.',
    items: ['@dentil/data-table', '@dentil/data-table-filter', '@dentil/data-table-url-state'],
    group: 'Components',
  },
  {
    href: '/docs/modals',
    title: 'Modals',
    description:
      'Promise-based modal registry. await openModal(key, props) for a typed result, with lazy-loaded contents and stacking.',
    items: ['@dentil/modals'],
    group: 'Components',
  },
  {
    href: '/docs/sheets',
    title: 'Sheets',
    description:
      'Promise-based side sheets with the same typed registry, plus stacking, minimize-to-dock and draft retention.',
    items: ['@dentil/sheets'],
    group: 'Components',
  },
  {
    href: '/docs/date-picker',
    title: 'Date Picker',
    description:
      'Single-date and range picker with range presets, date shortcuts, billing cycles, min and max dates, an Apply step, and Date or unix timestamp values.',
    items: ['@dentil/date-picker'],
    group: 'Components',
  },
  {
    href: '/docs/select-search',
    title: 'Select Search',
    description: 'Searchable single-select combobox built on Popover and Command.',
    items: ['@dentil/select-search'],
    group: 'Form inputs',
  },
  {
    href: '/docs/country-select',
    title: 'Country Select',
    description: 'Searchable country picker with ISO 3166-1 codes and localized names from Intl.DisplayNames.',
    items: ['@dentil/country-select'],
    group: 'Form inputs',
  },
  {
    href: '/docs/address-input',
    title: 'Address Input',
    description:
      'Postal address fields that start from a country, with state lists for the US, Canada and Australia and your own lists for any other country.',
    items: ['@dentil/address-input'],
    group: 'Form inputs',
  },
  {
    href: '/docs/phone-input',
    title: 'Phone Input',
    description: 'International phone number input with a flag country picker that returns E.164 numbers.',
    items: ['@dentil/phone-input'],
    group: 'Form inputs',
  },
  {
    href: '/docs/currency-input',
    title: 'Currency Input',
    description:
      'Money input that reads and writes minor units, with the currency symbol and decimal places taken from Intl.',
    items: ['@dentil/currency-input'],
    group: 'Form inputs',
  },
  {
    href: '/docs/dob-input',
    title: 'Date of Birth Input',
    description: 'DD / MM / YYYY date of birth fields that auto-advance and only emit real dates.',
    items: ['@dentil/dob-input'],
    group: 'Form inputs',
  },
];

export function getDocsGroup(group: DocsGroup): DocsEntry[] {
  return docs.filter((doc) => doc.group === group);
}

export function getDocsEntry(href: string): DocsEntry {
  const entry = docs.find((doc) => doc.href === href);
  if (!entry) throw new Error(`No docs entry for ${href}`);
  return entry;
}
