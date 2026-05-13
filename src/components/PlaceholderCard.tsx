import { BlockMath } from "react-katex";

interface PlaceholderCardProps {
  moduleNumber: number;
  totalModules: number;
  title: string;
  description: string;
  formula?: string;
  plannedInteractions: string;
}

export function PlaceholderCard({
  moduleNumber,
  totalModules,
  title,
  description,
  formula,
  plannedInteractions,
}: PlaceholderCardProps) {
  return (
    <article className="rounded-xl border-2 border-dashed border-slate-300 bg-placeholderBg p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
          Modul {moduleNumber} dari {totalModules}
        </span>
        <span className="rounded-md bg-placeholder px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
          Segera Hadir
        </span>
      </div>
      <h3 className="mt-2 text-lg font-semibold text-slate-800">{title}</h3>
      <hr className="my-3 border-slate-300" />
      <p className="text-sm leading-relaxed text-slate-600">{description}</p>

      {formula && (
        <div className="mt-4 rounded-md border border-slate-200 bg-white/70 px-4 py-3 text-slate-800">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Pratinjau formula
          </p>
          <BlockMath math={formula} />
        </div>
      )}

      <div className="mt-4 rounded-md bg-white/70 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          📋 Rencana interaksi
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">
          {plannedInteractions}
        </p>
      </div>
    </article>
  );
}
