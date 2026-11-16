import { packageManagers, shadcnAddCommand } from '@/lib/package-manager';

import { highlight } from './code-block';
import { PackageManagerTabs } from './package-manager-tabs';

/** `shadcn add` for the given registry items, with a tab per package manager. The choice is remembered. */
export async function InstallCommand({ items, title }: { items: string[]; title?: string }) {
  const panels = await Promise.all(
    packageManagers.map(async (packageManager) => {
      const command = shadcnAddCommand(packageManager, items);
      return { packageManager, command, html: await highlight(command, 'bash') };
    })
  );
  return <PackageManagerTabs panels={panels} title={title} item={itemNames(items)} />;
}

/** Bare names, matching the `item` on `registry_install`. Items can be `@dentil/<name>` or a registry URL; flags are dropped. */
function itemNames(items: string[]) {
  return items
    .map((item) => item.match(/^@dentil\/(.+)$/)?.[1] ?? item.match(/\/r\/([^/]+)\.json$/)?.[1])
    .filter(Boolean)
    .join(',');
}
