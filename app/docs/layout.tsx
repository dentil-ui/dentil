import { DocsSidebar } from '@/components/docs/docs-sidebar';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[200px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <DocsSidebar />
      </aside>
      {children}
    </div>
  );
}
