/** Numbered steps joined by a rule. Each step is a title, an optional description and its content. */
export function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="flex flex-col [counter-reset:step]">{children}</ol>;
}

export function Step({
  title,
  description,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <li className="group/step flex gap-4 [counter-increment:step]">
      <div className="flex flex-col items-center">
        <span
          aria-hidden
          className="bg-background flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs before:content-[counter(step)]"
        />
        <span className="bg-border my-2 w-px flex-1 group-last/step:hidden" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 pb-8 group-last/step:pb-0">
        <div className="flex min-h-6 flex-col justify-center gap-1">
          <h3 className="font-medium">{title}</h3>
          {description && <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>}
        </div>
        {children}
      </div>
    </li>
  );
}
