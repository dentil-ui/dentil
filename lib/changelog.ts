export interface ChangelogEntry {
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  title: string;
  /** Registry items the entry touches. */
  items: string[];
  /** One sentence per change. Wrap code in backticks. Start a change that needs consumer edits with "Breaking:". */
  changes: string[];
}

/** Newest first. Rendered at /docs/changelog and linked from /llms.txt. */
export const changelog: ChangelogEntry[] = [
  {
    date: '2026-10-11',
    title: 'Initial release',
    items: [
      '@dentil/data-table',
      '@dentil/data-table-filter',
      '@dentil/data-table-url-state',
      '@dentil/modals',
      '@dentil/sheets',
    ],
    changes: [
      '`@dentil/data-table`: `DataTable` with row links, server-side sorting, offset or cursor pagination, tabs, column visibility, context menus, split view, expandable rows and cross-page selection.',
      '`@dentil/data-table-filter`: Linear-style filter bar adapted from bazza/ui. Ships its MIT license as `components/data-table/filter/LICENSE.md`.',
      '`@dentil/data-table-url-state`: `useTableQueryState`, which syncs the table query to the URL.',
      '`@dentil/modals`: promise-based modal registry with lazy-loaded contents and stacking.',
      '`@dentil/sheets`: the same registry for side sheets, plus minimize-to-dock and draft retention.',
      'Every item works with Radix styles (`new-york`, `radix-*`) and Base UI styles (`base-*`).',
    ],
  },
];
