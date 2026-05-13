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
    <article className="rounded-xl border-2 border-dashed border-border bg-muted p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-card px-2 py-0.5 text-xs font-semibold text-card-foreground">
          Modul {moduleNumber} dari {totalModules}
        </span>
        <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
          Segera Hadir
        </span>
      </div>
      <h3 className="mt-2 text-lg font-semibold text-foreground">{title}</h3>
      <hr className="my-3 border-border" />
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>

      {formula && (
        <div className="mt-4 rounded-md border border-border bg-card/70 px-4 py-3 text-foreground">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pratinjau formula
          </p>
          <BlockMath math={formula} />
        </div>
      )}

      <div className="mt-4 rounded-md bg-card/70 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          📋 Rencana interaksi
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">
          {plannedInteractions}
        </p>
      </div>
    </article>
  );
}
