import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { CodeBlock } from './code-block';
import { ExampleTabs } from './example-tabs';

/**
 * Renders a live demo next to its own source file, so the code shown is always the code running. Set `padded` for
 * demos that don't fill the frame themselves (e.g. a row of buttons).
 */
export async function Example({
  file,
  padded,
  children,
}: {
  file: string;
  padded?: boolean;
  children: React.ReactNode;
}) {
  const source = await readFile(path.join(process.cwd(), 'components/demos', file), 'utf8');
  return (
    <ExampleTabs
      preview={children}
      padded={padded}
      code={<CodeBlock code={source} title={`components/demos/${file}`} />}
    />
  );
}
