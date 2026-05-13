import type { WeekConfig } from "../utils/weekConfig";

export function WeekHeader({ week }: { week: WeekConfig }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Minggu {week.number}
        </p>
        <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">
          Sub-CPMK
        </span>
      </div>
      <h2 className="mt-1 text-2xl font-bold text-card-foreground sm:text-3xl">
        {week.title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{week.subtitle}</p>
      <hr className="my-4 border-border" />
      <p className="text-sm leading-relaxed text-foreground">{week.subCPMK}</p>
    </section>
  );
}
