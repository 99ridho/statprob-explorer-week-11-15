# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server (default http://localhost:5173/)
- `npm run build` — Runs `tsc -b && vite build`. Use this rather than bare `tsc` to surface build-only TS errors.
- `npm run lint` — ESLint via the flat config in `eslint.config.js`
- `npm run preview` — Serve the production build locally

There are no tests in this project.

## Source of truth

`FRD.md` is the binding spec, should be derived from the files on `references/`. Its acceptance criteria (§12), math accuracy table (§9), and color palette (§8.4) take precedence over taste. When implementing or reviewing changes, consult the relevant FRD section first. Key invariants:

- **Beta α = k + 1, β = m + 1** — the off-by-one is intentional (Tsun 2020, p. 269). Never use `α = k`.
- **Dirichlet αᵢ = kᵢ + 1** — same off-by-one as Beta (Tsun 2020, p. 270). `dirichletPDF` must use the Lanczos `lnGamma` via `lnMultiBeta` in `src/utils/mathUtils.ts`.
- **Poisson uses log-likelihood**, not raw likelihood — raw form underflows.
- **`betaPDF` must use the Lanczos `lnGamma`** in `src/utils/mathUtils.ts`; do not swap in an alternative gamma.

## Architecture

Single-page React app covering Weeks 11–15 of a "Statistika dan Probabilitas" course. All computation is client-side; no backend.

- **Routing shell** (`src/App.tsx`): `BrowserRouter` mounts `Shell`, which lays out `TopHeader` (fixed top, full width) over a flex row of `Sidebar` (240px, fixed height) + `<main>` — the **only vertical scroll area**. Outer container is `h-screen overflow-hidden`. Routes: `/` → `/week/11`, `/week/11..15`; unknown paths redirect to `/week/11`.
- **Week registry** (`src/utils/weekConfig.ts`): one `WEEKS` array drives the sidebar, each page's `<WeekHeader>`, and the progress indicator. Flipping a week's `status` from `"placeholder"` to `"available"` automatically updates sidebar badge + progress (AC-G3). Add new weekly content through this registry, not via ad-hoc state.
- **Page layer** (`src/pages/`): one `WeekNPage` per week. Week 11 composes the four real modules; Weeks 12–15 compose `PlaceholderCard`s with the FRD-mandated counts (3 / 4 / 3 / 2).
- **Module layer** (`src/modules/week11/`): each module is self-contained — owns its `useState`, derives the rest with `useMemo`, and wraps its UI in the shared `ModuleCard`. No global store and no submit buttons; every value updates on input change.
- **Math** (`src/utils/mathUtils.ts`): all distribution math lives here. Modules import these helpers rather than inlining formulas so the accuracy invariants are enforced in one place.

## Conventions worth knowing

- **Recharts tooltips**: `formatter` / `labelFormatter` callbacks receive `ValueType` (untyped). Use `(v) => Number(v).toFixed(...)` — typing the param as `number` passes dev but fails the production build.
- **KaTeX**: `katex/dist/katex.min.css` is imported once in `src/main.tsx`. Use `<BlockMath math="..." />` / `<InlineMath math="..." />` from `react-katex`. In Week 11 derivations, build the `math` string with template literals so live `n`, `k`, `sumX`, etc. get substituted into the LaTeX (AC-11-1, AC-11-3).
- **Tailwind v3** (pinned `tailwindcss@^3`). The palette in `tailwind.config.js` mirrors FRD §8.4 by name (`sidebarBg`, `marker`, `betaStroke`, `placeholderBg`, etc.); prefer these tokens over inline hex.
- **Every interactive module must expose its math as a step-by-step derivation** rendered inside a `<DerivationPanel>` (from `src/components/DerivationPanel.tsx`). The panel must contain at least these labeled steps, each as a `<BlockMath>` from `react-katex`:
  1. **Definisi** — the canonical formula (PDF, estimator, test statistic, CI, etc.) in symbolic form, with a source citation (e.g. "Tsun, 2020, hal. N").
  2. **Parameter dari data** — show how the live inputs map to the formula's parameters (e.g. `α = k + 1 = ${k} + 1 = ${alpha}`).
  3. **Substitusi / komputasi antara** — at least one step that shows the live state values plugged into the formula via `String.raw` template literals, so students see the abstract form and the current concrete instance side by side.
  4. **Hasil** — final computed quantities (estimator, mode, mean, statistic, p-value, etc.) with their numeric values.
  Add further steps (intermediate algebra, edge cases, related identities) as the pedagogy requires. Canonical examples: `BernoulliMLE.tsx`, `PoissonMLE.tsx`, `BetaExplorer.tsx`, `DirichletExplorer.tsx`. This convention applies to every interactive module across all weeks (11–15) — `<DerivationPanel>` is the single place where the math is exposed; do not also duplicate the formula in a separate inline block.
- **Placeholder cards** must stay non-interactive (AC-P4) and visually distinct from real modules — keep the dashed border + `bg-placeholderBg`.
- **TypeScript** project uses two configs via `tsc -b`: `tsconfig.app.json` (src) and `tsconfig.node.json` (Vite config).
