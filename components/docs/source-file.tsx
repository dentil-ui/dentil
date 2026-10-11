import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { CodeBlock } from './code-block';

/** Renders a source file from the repo, so the docs stay in sync with the code. Long files collapse. */
export async function SourceFile({ file }: { file: string }) {
  const source = await readFile(path.join(process.cwd(), file), 'utf8');
  return <CodeBlock code={source} title={file} collapsible />;
}
