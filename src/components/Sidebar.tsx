import { NavLink } from "react-router-dom";
import { WEEKS } from "../utils/weekConfig";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const availableCount = WEEKS.filter((w) => w.status === "available").length;
  const totalCount = WEEKS.length;
  const percent = Math.round((availableCount / totalCount) * 100);
  const filledSegments = Math.round((availableCount / totalCount) * 10);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          "fixed left-0 top-0 z-40 flex h-full w-60 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
          "md:static md:h-full md:translate-x-0",
        ].join(" ")}
        aria-label="Navigasi minggu"
      >
        <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3 md:hidden">
          <span className="text-sm font-semibold tracking-wide text-sidebar-foreground">
            MATERI KULIAH
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup navigasi"
            className="text-muted-foreground hover:text-sidebar-foreground"
          >
            ✕
          </button>
        </div>

        <div className="hidden border-b border-sidebar-border px-4 py-4 md:block">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Materi Kuliah
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="space-y-1">
            {WEEKS.map((week) => (
              <li key={week.number}>
                <NavLink
                  to={`/week/${week.number}`}
                  onClick={onClose}
                  className={({ isActive }) =>
                    [
                      "flex flex-col gap-1 rounded-md px-3 py-2 transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    ].join(" ")
                  }
                  style={({ isActive }) =>
                    isActive
                      ? { borderLeft: "3px solid var(--sidebar-primary-foreground)" }
                      : { borderLeft: "3px solid transparent" }
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-sm font-medium">
                          {week.status === "available" ? (
                            <span
                              className="inline-block h-2 w-2 rounded-full bg-chart-5"
                              aria-hidden="true"
                            />
                          ) : (
                            <span
                              className="inline-block h-2 w-2 rounded-full bg-muted-foreground"
                              aria-hidden="true"
                            />
                          )}
                          Minggu {week.number}
                        </span>
                        {week.status === "placeholder" && (
                          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
                            Segera Hadir
                          </span>
                        )}
                      </div>
                      <span
                        className={[
                          "pl-4 text-xs",
                          isActive
                            ? "text-sidebar-primary-foreground"
                            : "text-muted-foreground",
                        ].join(" ")}
                      >
                        {week.title}
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Progress
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {availableCount} dari {totalCount} minggu tersedia
          </p>
          <div
            className="mt-2 flex gap-0.5"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-label="Progress minggu yang tersedia"
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={[
                  "h-2 flex-1 rounded-sm",
                  i < filledSegments ? "bg-primary" : "bg-muted",
                ].join(" ")}
              />
            ))}
          </div>
          <p className="mt-1 text-right text-[10px] text-muted-foreground">{percent}%</p>
        </div>
      </aside>
    </>
  );
}
