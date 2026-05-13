# Statistika & Probabilitas — Interactive Explorer

Interactive single-page web app covering **Minggu 11–15** of the *Statistika dan Probabilitas* course at the Faculty of Engineering, Universitas Negeri Jakarta. Built as a teaching companion for the *Sistem dan Teknologi Informasi* programme, with material adapted from Alex Tsun, *Probability & Statistics with Applications to Computing* (2020).

All computation runs in the browser — no backend.

## What's inside

- **Minggu 11 — Estimasi Parameter (fully interactive)**
  - **Modul 1 — MLE: Bernoulli**: toggleable trials, live likelihood curve, candidate-θ table, and step-by-step derivation with `n`/`k` substituted into the LaTeX in real time.
  - **Modul 2 — MLE: Poisson**: editable observations, log-likelihood curve (raw form would underflow), `θ̂ = Σxᵢ/n` shown with an alerting-threshold interpretation.
  - **Modul 3 — Beta Distribution Explorer**: `k` / `m` sliders driving `Beta(k+1, m+1)`, Lanczos-`lnGamma` PDF, mode and mean markers, and four preset scenarios.
  - **Modul 4 — Dirichlet Distribution Explorer**: three count sliders (k₁ / k₂ / k₃) driving `Dir(k₁+1, k₂+1, k₃+1)`, three overlaid marginal-Beta PDFs (one per category), mean markers, and presets including the sentiment-classification kasus from Tsun (2020, p. 270).
- **Minggu 12–15 — placeholders**: each week renders its `WeekHeader` plus the FRD-mandated number of placeholder module cards (3 / 4 / 3 / 2) with KaTeX formula previews and a "Rencana interaksi" note. No interactive controls yet.
- **Persistent shell**: top header, fixed-height sidebar listing all five weeks with active highlighting and a `WEEKS`-driven progress indicator, and a scrollable main content area. Mobile (<768px) collapses the sidebar into a drawer.

## Tech stack

React 19 · React Router v7 · Vite · Recharts · Tailwind CSS v3 · KaTeX (via `react-katex`) · TypeScript

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173/
```

Other scripts:

- `npm run build` — type-check + production build (`tsc -b && vite build`)
- `npm run lint` — ESLint flat config
- `npm run preview` — serve the production build locally

## Repository layout

```
src/
├── App.tsx                  Router + shell layout
├── main.tsx                 Entry; imports KaTeX + Tailwind CSS
├── components/              TopHeader, Sidebar, WeekHeader, ModuleCard,
│                            PlaceholderCard, DerivationPanel
├── pages/                   Week11Page … Week15Page
├── modules/week11/          BernoulliMLE, PoissonMLE, BetaExplorer, DirichletExplorer
└── utils/
    ├── mathUtils.ts         Lanczos lnGamma, betaPDF, dirichletPDF, likelihood helpers
    └── weekConfig.ts        WEEKS array — single source of truth
```

`FRD.md` holds the full functional requirements document, including the math accuracy table (§9), color palette (§8.4), and acceptance criteria (§12). Treat it as the binding spec for any change.

## Adding a new week's content

1. In `src/utils/weekConfig.ts`, flip the week's `status` from `"placeholder"` to `"available"`. The sidebar dot, badge, and progress bar update automatically.
2. Build the interactive modules under `src/modules/weekNN/`, each wrapped in `<ModuleCard>` and using `useState` + `useMemo` for derived values.
3. Replace the placeholder content in `src/pages/WeekNNPage.tsx` with the real modules.

## License

Educational use within Universitas Negeri Jakarta. No license declared upstream.
