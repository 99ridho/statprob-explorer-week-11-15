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
    <article className="rounded-xl border border-cardBorder bg-white p-5 shadow-sm sm:p-6">
      <header className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
          Modul {moduleNumber} dari {totalModules}
        </span>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
          Distribusi: {distribution}
        </span>
      </header>
      <h3 className="mt-2 text-xl font-bold text-slate-900">{title}</h3>

      <div className="mt-4 rounded-md border-l-4 border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        {context}
      </div>

      <div className="mt-5 space-y-5">{children}</div>
    </article>
  );
}
