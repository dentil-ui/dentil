// Generates registry.json from the files under components/ so the file lists can't drift.
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = 'components/data-table';

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const file = (path, type = typeOf(path)) => ({ path, type, target: path });

function typeOf(path) {
  if (path.endsWith('.ts')) return 'registry:lib';
  if (path.endsWith('.tsx')) return 'registry:component';
  return 'registry:file';
}

const core = [
  'types.ts',
  'primitives.tsx',
  'hooks.ts',
  'error.tsx',
  'tabs.tsx',
  'display.tsx',
  'actions-button.tsx',
  'date-cell.tsx',
  'context-menu.tsx',
  'selection-action-bar.tsx',
  'data-table.tsx',
  'router.tsx',
].map((name) => file(`${root}/${name}`));

const filter = [`${root}/filters.tsx`, ...walk(`${root}/filter`).sort()].map((path) => file(path));

const modals = walk('components/modals')
  .sort()
  .map((path) => file(path));

const sheets = walk('components/sheets')
  .sort()
  .map((path) => file(path));

const folder = (name) =>
  walk(`components/${name}`)
    .sort()
    .map((path) => file(path));

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'dentil',
  homepage: process.env.REGISTRY_HOMEPAGE ?? 'https://dentil.dev',
  items: [
    {
      name: 'data-table',
      type: 'registry:block',
      title: 'Data Table',
      description:
        'Server-driven TanStack data table with row links, sorting, offset or cursor pagination, tabs, column visibility, context menus, split view, expandable rows and cross-page selection.',
      dependencies: ['@tanstack/react-table@^8.21.3', 'lucide-react'],
      registryDependencies: ['button', 'checkbox', 'dropdown-menu', 'context-menu'],
      files: core,
    },
    {
      name: 'data-table-filter',
      type: 'registry:block',
      title: 'Data Table Filter',
      description:
        'Linear-style filter bar (text, option, multi-option, number, date and async options) that reads and writes the data table query.',
      dependencies: ['date-fns', 'react-day-picker', 'lucide-react'],
      registryDependencies: [
        '@dentil/data-table',
        'button',
        'calendar',
        'checkbox',
        'command',
        'input',
        'popover',
        'separator',
        'slider',
        'tabs',
      ],
      files: filter,
    },
    {
      name: 'data-table-url-state',
      type: 'registry:hook',
      title: 'Data Table URL State',
      description: 'useState replacement that syncs the data table query to the URL with history.replaceState.',
      registryDependencies: ['@dentil/data-table'],
      files: [file(`${root}/use-table-query-state.ts`, 'registry:hook')],
    },
    {
      name: 'modals',
      type: 'registry:block',
      title: 'Modals',
      description:
        'Promise-based modal registry: await openModal(key, props) for a typed result, with lazy-loaded contents and stacking.',
      dependencies: ['lucide-react'],
      registryDependencies: ['button', 'dialog'],
      files: modals,
    },
    {
      name: 'sheets',
      type: 'registry:block',
      title: 'Sheets',
      description:
        'Promise-based sheet registry: await openSheet(key, props) for a typed result, with lazy-loaded contents, stacking, minimizing and draft retention.',
      dependencies: ['lucide-react'],
      registryDependencies: ['button', 'input', 'sheet'],
      files: sheets,
    },
    {
      name: 'date-picker',
      type: 'registry:block',
      title: 'Date Picker',
      description:
        'Single-date and range picker with range presets, date shortcuts, billing cycles, min and max dates, an Apply step, and Date or unix timestamp values.',
      dependencies: ['date-fns', 'lucide-react'],
      registryDependencies: ['button', 'calendar', 'input', 'popover'],
      files: folder('date-picker'),
    },
    {
      name: 'date',
      type: 'registry:component',
      title: 'Date',
      description:
        'Compact date formatted in a time zone you supply. Accepts unix seconds, milliseconds, ISO strings or Date, and can underline the date to open that zone beside UTC.',
      registryDependencies: ['popover', 'hover-card'],
      files: folder('date'),
    },
    {
      name: 'object-timeline',
      type: 'registry:component',
      title: 'Object Timeline',
      description: 'Vertical event list with an icon, title, description, date and an optional action on the title.',
      files: folder('object-timeline'),
    },
    {
      name: 'invoice-table',
      type: 'registry:component',
      title: 'Invoice Table',
      description:
        'Invoice line items table with optional quantity, unit price and tax columns, a totals footer, and an optional per-line allocation column for credit notes and part payments.',
      dependencies: ['lucide-react'],
      registryDependencies: ['table', '@dentil/currency-input'],
      files: folder('invoice-table'),
    },
    {
      name: 'select-search',
      type: 'registry:component',
      title: 'Select Search',
      description: 'Searchable single-select combobox built on Popover and Command.',
      dependencies: ['lucide-react'],
      registryDependencies: ['button', 'command', 'popover'],
      files: folder('select-search'),
    },
    {
      name: 'async-select',
      type: 'registry:component',
      title: 'Async Select',
      description:
        'Searchable single-select combobox that loads options from an async fetcher, with debounced search, preloading and custom option rendering.',
      dependencies: ['lucide-react'],
      registryDependencies: ['button', 'command', 'popover'],
      files: folder('async-select'),
    },
    {
      name: 'country-select',
      type: 'registry:component',
      title: 'Country Select',
      description:
        'Searchable country picker with ISO 3166-1 codes, localized names from Intl.DisplayNames, preferred countries listed first, and optional flags.',
      dependencies: ['country-flag-icons@^1.6.14'],
      registryDependencies: ['@dentil/select-search'],
      files: folder('country-select'),
    },
    {
      name: 'address-input',
      type: 'registry:component',
      title: 'Address Input',
      description:
        'Postal address fields that start from a country, with state lists for the US, Canada and Australia and your own lists for any other country.',
      registryDependencies: ['input', 'native-select', '@dentil/country-select'],
      files: folder('address-input'),
    },
    {
      name: 'phone-input',
      type: 'registry:component',
      title: 'Phone Input',
      description: 'International phone number input with a flag country picker that returns E.164 numbers.',
      dependencies: ['react-phone-number-input@^3.4.16', 'lucide-react'],
      registryDependencies: ['input'],
      files: folder('phone-input'),
    },
    {
      name: 'currency-input',
      type: 'registry:component',
      title: 'Currency Input',
      description:
        'Money input that reads and writes minor units, with the currency symbol and decimal places taken from Intl and an optional searchable currency picker.',
      dependencies: ['lucide-react', 'react-number-format@^5.4.5'],
      registryDependencies: ['input-group', '@dentil/select-search'],
      files: folder('currency-input'),
    },
    {
      name: 'dob-input',
      type: 'registry:component',
      title: 'Date of Birth Input',
      description: 'DD / MM / YYYY date of birth fields that auto-advance and only emit real dates.',
      dependencies: ['react-number-format@^5.4.5'],
      registryDependencies: ['input-group'],
      files: folder('dob-input'),
    },
    {
      name: 'switch-label',
      type: 'registry:component',
      title: 'Switch Label',
      description: 'Labeled switch with an optional description aligned to the control or the label text.',
      registryDependencies: ['switch', 'label'],
      files: folder('switch-label'),
    },
    {
      name: 'color-picker',
      type: 'registry:component',
      title: 'Color Picker',
      description:
        'Hex color input that reads and writes a 6-digit hex, with a swatch that opens a saturation and hue picker.',
      dependencies: ['react-colorful@^5.8.1'],
      registryDependencies: ['button', 'input-group', 'popover'],
      files: folder('color-picker'),
    },
  ],
};

writeFileSync('registry.json', JSON.stringify(registry, null, 2) + '\n');
console.log(`registry.json: ${registry.items.map((i) => `${i.name} (${i.files.length} files)`).join(', ')}`);
