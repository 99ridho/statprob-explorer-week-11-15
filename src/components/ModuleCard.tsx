import type { ReactNode } from "react";

interface ModuleCardProps {
  moduleNumber: number;
  totalModules: number;
  title: string;
  distribution: string;
  context: ReactNode;
  children: ReactNode;
}

export function ModuleCard({
  moduleNumber,
  totalModules,
  title,
  distribution,
  context,
  children,
}: ModuleCardProps) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5 md:p-6">
      <header className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
          Modul {moduleNumber} dari {totalModules}
        </span>
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
          Distribusi: {distribution}
        </span>
      </header>
      <h3 className="mt-2 text-xl font-bold text-card-foreground">{title}</h3>

      <div className="mt-4 rounded-md border-l-4 border-border bg-muted px-4 py-3 text-sm text-foreground">
        {context}
      </div>

      <div className="mt-5 space-y-5 min-w-0">{children}</div>
    </article>
  );
}
