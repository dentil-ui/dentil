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
  return <PackageManagerTabs panels={panels} title={title} />;
}
