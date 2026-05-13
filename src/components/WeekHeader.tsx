import type { WeekConfig } from "../utils/weekConfig";

export function WeekHeader({ week }: { week: WeekConfig }) {
  return (
    <section className="rounded-xl border border-cardBorder bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Minggu {week.number}
        </p>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
          Sub-CPMK
        </span>
      </div>
      <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
        {week.title}
      </h2>
      <p className="mt-1 text-sm text-slate-600">{week.subtitle}</p>
      <hr className="my-4 border-cardBorder" />
      <p className="text-sm leading-relaxed text-slate-700">{week.subCPMK}</p>
    </section>
  );
}
