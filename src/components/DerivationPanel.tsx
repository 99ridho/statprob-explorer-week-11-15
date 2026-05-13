import { useState, type ReactNode } from "react";

interface DerivationPanelProps {
  children: ReactNode;
  defaultOpen?: boolean;
}

export function DerivationPanel({
  children,
  defaultOpen = true,
}: DerivationPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-border bg-muted">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/70"
        aria-expanded={open}
      >
        <span>{open ? "Sembunyikan Derivasi" : "Tampilkan Derivasi"}</span>
        <span aria-hidden="true">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-border px-4 py-4 text-sm text-foreground">
          {children}
        </div>
      )}
    </div>
  );
}
