import registry from '@/registry.json';
import { docs, registryItemUrl, registryUrl, siteConfig } from '@/lib/site';

export const dynamic = 'force-static';

/** The llms.txt index (https://llmstxt.org): what dentil is, how to install it, and where the docs and skill live. */
export function GET() {
  const { url } = siteConfig;
  const body = `# ${siteConfig.name}

> ${siteConfig.description}

dentil is a shadcn/ui registry. The shadcn CLI copies its components into the project, which then owns the code. They compose the project's existing shadcn/ui primitives and theme. Requires React 19 and Tailwind v4. Works with Radix styles (\`new-york\`, \`radix-*\`) and Base UI styles (\`base-*\`).

Install by name after adding \`"@dentil": "${registryUrl}"\` to \`registries\` in components.json:

\`\`\`bash
npx shadcn@latest add @dentil/data-table
\`\`\`

Or install by URL with no config: \`npx shadcn@latest add ${registryItemUrl('@dentil/data-table')}\`.

## Docs

${docs.map((doc) => `- [${doc.title}](${url}${doc.href}): ${doc.description} Items: ${doc.items.map((item) => `\`${item}\``).join(', ')}.`).join('\n')}
- [Changelog](${url}/docs/changelog): What changed in each item, and how to diff your copy against the latest.

## Agent skill

- [skill.md](${url}/skill.md): Setup steps and usage rules for coding agents adding dentil to a project.

## Registry

- [registry.json](${url}/r/registry.json): Index of every item.
${registry.items.map((item) => `- [@dentil/${item.name}](${registryItemUrl(item.name)}): ${item.description}`).join('\n')}
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
