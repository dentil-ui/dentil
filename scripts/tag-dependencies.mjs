// Runs after `shadcn build`. Rewrites each @dentil/<name> registry dependency in public/r to a full URL tagged with the
// item that pulls it in, so proxy.ts can tell a dependency fetch from a direct install. registry.json keeps the names.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const base = process.env.REGISTRY_URL ?? process.env.REGISTRY_HOMEPAGE ?? 'https://dentil.dev';
const dir = 'public/r';

for (const file of readdirSync(dir)) {
  if (!file.endsWith('.json') || file === 'registry.json') continue;
  const path = join(dir, file);
  const item = JSON.parse(readFileSync(path, 'utf8'));
  if (!item.registryDependencies) continue;
  item.registryDependencies = item.registryDependencies.map((dependency) => {
    const name = dependency.match(/^@dentil\/(.+)$/)?.[1];
    return name ? `${base}/r/${name}.json?via=${item.name}` : dependency;
  });
  writeFileSync(path, JSON.stringify(item, null, 2) + '\n');
}
