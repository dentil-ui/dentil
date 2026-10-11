import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { siteConfig } from './site';

/** The copyable agent skill (`lib/agent-skill.md`), with links pointing at this deployment. */
export async function getAgentSkill() {
  const source = await readFile(path.join(process.cwd(), 'lib/agent-skill.md'), 'utf8');
  return source.replaceAll('{{SITE_URL}}', siteConfig.url);
}
