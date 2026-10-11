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
  ],
};

writeFileSync('registry.json', JSON.stringify(registry, null, 2) + '\n');
console.log(`registry.json: ${registry.items.map((i) => `${i.name} (${i.files.length} files)`).join(', ')}`);
