export interface PropRow {
  name: string;
  type: string;
  default?: string;
  /** Text wrapped in backticks renders as inline code. */
  description: React.ReactNode;
}

function renderDescription(description: React.ReactNode) {
  if (typeof description !== 'string') return description;
  return description.split(/(`[^`]+`)/).map((part, index) =>
    part.startsWith('`') && part.endsWith('`') ? (
      <code key={index} className="bg-muted rounded px-1 py-0.5 font-mono text-[0.85em]">
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    )
  );
}

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/40 text-muted-foreground text-xs">
          <tr>
            <th className="px-4 py-2 font-medium">Prop</th>
            <th className="px-4 py-2 font-medium">Type</th>
            <th className="px-4 py-2 font-medium">Default</th>
            <th className="px-4 py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr key={row.name} className="align-top">
              <td className="px-4 py-2.5 font-mono text-xs font-medium whitespace-nowrap">{row.name}</td>
              <td className="text-muted-foreground min-w-40 px-4 py-2.5 font-mono text-xs">{row.type}</td>
              <td className="text-muted-foreground px-4 py-2.5 font-mono text-xs whitespace-nowrap">
                {row.default ?? '—'}
              </td>
              <td className="min-w-56 px-4 py-2.5 leading-relaxed">{renderDescription(row.description)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
