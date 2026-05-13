interface TopHeaderProps {
  onToggleSidebar: () => void;
}

export function TopHeader({ onToggleSidebar }: TopHeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b border-cardBorder bg-white px-4 py-3 md:px-6">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Buka navigasi"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 md:hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div
        className="flex h-10 w-10 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: "#6366f1" }}
        aria-hidden="true"
      >
        <span className="text-xl font-semibold">σ</span>
      </div>

      <div className="flex min-w-0 flex-col">
        <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
          Statistika &amp; Probabilitas — Interactive Explorer
        </h1>
        <p className="truncate text-xs text-slate-500 sm:text-sm">
          Sistem dan Teknologi Informasi, Fakultas Teknik, Universitas Negeri
          Jakarta
        </p>
      </div>

      <div className="ml-auto hidden shrink-0 rounded-full border border-cardBorder bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 sm:block">
        Tsun, 2020
      </div>
    </header>
  );
}
