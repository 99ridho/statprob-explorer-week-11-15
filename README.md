# Statistika & Probabilitas — Interactive Explorer

Interactive single-page web app covering **Minggu 11–15** of the *Statistika dan Probabilitas* course at the Faculty of Engineering, Universitas Negeri Jakarta. Built as a teaching companion for the *Sistem dan Teknologi Informasi* programme, with material adapted from Alex Tsun, *Probability & Statistics with Applications to Computing* (2020).

All computation runs in the browser — no backend.

## What's inside

- **Minggu 11 — Estimasi Parameter (fully interactive)**
  - **Modul 1 — MLE: Bernoulli**: toggleable trials, live likelihood curve, candidate-θ table, and step-by-step derivation with `n`/`k` substituted into the LaTeX in real time.
  - **Modul 2 — MLE: Poisson**: editable observations, log-likelihood curve (raw form would underflow), `θ̂ = Σxᵢ/n` shown with an alerting-threshold interpretation.
  - **Modul 3 — Beta Distribution Explorer**: `k` / `m` sliders driving `Beta(k+1, m+1)`, Lanczos-`lnGamma` PDF, mode and mean markers, and four preset scenarios.
  - **Modul 4 — Dirichlet Distribution Explorer**: three count sliders (k₁ / k₂ / k₃) driving `Dir(k₁+1, k₂+1, k₃+1)`, three overlaid marginal-Beta PDFs (one per category), mean markers, and presets including the sentiment-classification kasus from Tsun (2020, p. 270).
- **Minggu 12 — Confidence Interval (fully interactive)**
  - **Modul 1 — CI untuk Proporsi**: Wald CI with `bernoulliCI`; live `z` from `normalInverseCDF`; presets including the Tsun n=400 / k=136 book example.
  - **Modul 2 — CI Width Explorer**: log-x width curves for 90 / 95 / 99 confidence and an inverse "n minimum untuk margin m" calculator.
  - **Modul 3 — CI Interpretation Simulator**: K seeded resamples from a true θ, frequentist coverage bar, and a horizontal-band visualization to demolish the "95% of intervals contain θ" misreading.
  - **Modul 4 — Credible Interval (Bayesian)**: Beta posterior with `α₀`, `β₀` priors; central credible interval via `betaInverseCDF` (Lentz + bisection); collapses to Modul 11.3's Beta when the prior is flat.
- **Minggu 13 — Uji Hipotesis (fully interactive)**
  - **Modul 1 — One-Sample Z-Test untuk Rata-rata**: μ₀, x̄, σ, n, α, alternative; Z-statistic, p-value, decision, and a Normal PDF with rejection region shaded. Tsun SuperSAT + MLOps latency presets.
  - **Modul 2 — One-Sample Z-Test untuk Proporsi**: p₀, k, n with the H₀-variance σ₀; Washington-election and antivirus-claim presets.
  - **Modul 3 — Two-Sample Z-Test (A/B Test)**: difference-of-means with NimbusStore A/B preset (slide 10).
  - **Modul 4 — Kelemahan P-Value**: n-effect sub-demo, p-hacking / optional-stopping sub-demo, and the statistical-vs-practical 2×2 matrix.
- **Minggu 14 — Aplikasi Komputasi (fully interactive)**
  - **Modul 1 — Probability via Simulation**: segmented Geometric / fixed-points / "at least one 6" scenarios with `mulberry32`-seeded convergence chart.
  - **Modul 2 — Bloom Filter Simulator**: exact `bloomFPR = (1 − (1 − 1/m)ⁿ)ᵏ`, bit-array heatmap, theoretical-vs-empirical FPR overlay, and an interactive insert/query panel with `bloomHash`.
  - **Modul 3 — MCMC Visualizer**: TSP / Knapsack toggle driving the same Metropolis-acceptance kernel `e^(−Δ/T)` with Run / Step / Reset and `requestAnimationFrame` auto-step.
- **Minggu 15 — placeholder**: renders its `WeekHeader` plus 2 placeholder module cards with KaTeX formula previews and a "Rencana interaksi" note. No interactive controls yet.
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
├── modules/
│   ├── week11/              BernoulliMLE, PoissonMLE, BetaExplorer, DirichletExplorer
│   ├── week12/              CIProportion, CIWidthExplorer, CIInterpretationSimulator, CredibleInterval
│   ├── week13/              OneSampleMeanTest, OneSampleProportionTest, TwoSampleTest, PValueDrawbacks
│   └── week14/              ProbabilityViaSimulation, BloomFilter, MCMCVisualizer
└── utils/
    ├── mathUtils.ts         Lanczos lnGamma, beta/dirichlet PDF + CDF, normalCDF / inverse,
    │                        mulberry32 PRNG, Z-test helpers, bloomHash / bloomFPR
    └── weekConfig.ts        WEEKS array — single source of truth
```

`FRD.md` holds the full functional requirements document, including the math accuracy table (§9), color palette (§8.4), and acceptance criteria (§12). Treat it as the binding spec for any change.

## Adding a new week's content

1. In `src/utils/weekConfig.ts`, flip the week's `status` from `"placeholder"` to `"available"`. The sidebar dot, badge, and progress bar update automatically.
2. Build the interactive modules under `src/modules/weekNN/`, each wrapped in `<ModuleCard>` and using `useState` + `useMemo` for derived values.
3. Replace the placeholder content in `src/pages/WeekNNPage.tsx` with the real modules.

## License

Educational use within Universitas Negeri Jakarta. No license declared upstream.
