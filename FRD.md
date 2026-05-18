# Functional Requirements Document

## Statistika & Probabilitas — Interactive Learning App

**Mata Kuliah:** Statistika dan Probabilitas  
**Target pengguna:** Mahasiswa Program Studi Sistem dan Teknologi Informasi, Fakultas Teknik, Universitas Negeri Jakarta  
**Referensi materi:** Alex Tsun, _Probability & Statistics with Applications to Computing_, 2020  
**Dokumen ini ditujukan untuk:** Implementasi via Claude Code  
**Versi:** 2.2 — Weeks 11–14 fully implemented; Week 15 placeholder

---

## 1. Overview

A single-page web application (SPA) covering **Weeks 11–15** of the Statistika dan Probabilitas course. The app uses a **persistent week-based navigation sidebar** to switch between weekly content views. Each week renders its own set of interactive modules on the main content area — all computation runs client-side, no backend required.

The app is designed for **incremental development**: Weeks 11–14 are fully implemented (Week 11: MLE Bernoulli, MLE Poisson, Beta + Dirichlet Explorers; Week 12: CI for Proportion, CI Width, CI Interpretation, Credible Interval; Week 13: One-/Two-Sample Z-Tests, Z-Test untuk Proporsi, P-Value Drawbacks; Week 14: Probability via Simulation, Bloom Filter, MCMC for TSP/Knapsack). Week 15 ships as a structured placeholder ready to be filled in a subsequent development session.

**Tech stack (required):**

- React (functional components + hooks)
- React Router DOM v6 — for week-based routing (`/week/11`, `/week/12`, etc.)
- Vite for build system
- Recharts — all chart/graph rendering
- Tailwind CSS — styling
- KaTeX — LaTeX formula rendering (do NOT use MathJax)
- No backend — all computation is client-side JavaScript

---

## 2. Application Shell & Navigation

### 2.1 Overall layout

```
┌──────────────────────────────────────────────────────┐
│                     Top Header Bar                   │
├────────────────┬─────────────────────────────────────┤
│                │                                     │
│   Sidebar Nav  │        Main Content Area            │
│   (fixed)      │        (scrollable)                 │
│                │                                     │
│  Week 11  ←    │   [Week content renders here]       │
│  Week 12       │                                     │
│  Week 13       │                                     │
│  Week 14       │                                     │
│  Week 15       │                                     │
│                │                                     │
└────────────────┴─────────────────────────────────────┘
```

- **Sidebar width:** 240px, fixed position, full viewport height, does not scroll with content
- **Main content area:** fills remaining width, scrollable independently
- **On mobile (< 768px):** sidebar collapses to a top navigation bar with a hamburger menu; content takes full width below

### 2.2 Top Header Bar

**Content (left to right):**

- App icon / logo (a small σ or ∑ symbol in a colored circle)
- App title: **"Statistika & Probabilitas — Interactive Explorer"**
- Subtitle (smaller text): "Fakultas Teknik, Universitas Negeri Jakarta"
- Reference badge (right-aligned): "Tsun, 2020"

### 2.3 Sidebar Navigation

Each week is a nav item in the sidebar. Structure:

```
━━━━━━━━━━━━━━━━━━━
 MATERI KULIAH
━━━━━━━━━━━━━━━━━━━
 ✅ Minggu 11
    Estimasi Parameter

 🔲 Minggu 12
    Confidence Interval

 🔲 Minggu 13
    Uji Hipotesis

 🔲 Minggu 14
    Aplikasi Komputasi

 🔲 Minggu 15
    Review & UAS
━━━━━━━━━━━━━━━━━━━
```

**Nav item states:**

- **Active (current week):** highlighted background (indigo, `#6366f1`), white text, left accent border (3px solid white)
- **Available (implemented):** normal text, hover effect (light indigo background)
- **Placeholder (not yet implemented):** normal text with a `[Segera Hadir]` badge in gray — still clickable, routes to the placeholder view
- Week 11 is the only `Available` week on initial release. Weeks 12–15 are `Placeholder`.

**On click:** React Router navigates to `/week/{number}`. The active week highlight updates accordingly.

### 2.4 Routing

| Route      | Component               | Status            |
| ---------- | ----------------------- | ----------------- |
| `/`        | Redirects to `/week/11` | —                 |
| `/week/11` | `Week11Page`            | Fully implemented |
| `/week/12` | `Week12Page`            | Placeholder       |
| `/week/13` | `Week13Page`            | Placeholder       |
| `/week/14` | `Week14Page`            | Placeholder       |
| `/week/15` | `Week15Page`            | Placeholder       |

### 2.5 Week header (inside main content area)

Every week page (implemented or placeholder) must render a **week header** at the top of the main content area:

```
┌─────────────────────────────────────────────────────┐
│  Minggu 11                          [Sub-CPMK badge]│
│  Estimasi Parameter                                  │
│  MLE · Point Estimation · Beta & Dirichlet           │
│  ─────────────────────────────────────────────────  │
│  Mahasiswa mampu melakukan estimasi titik            │
│  menggunakan MLE dan MAP.                            │
└─────────────────────────────────────────────────────┘
```

Fields per week:

| Week | Title                  | Subtitle (topics)                                           | Sub-CPMK                                                                                                                                           |
| ---- | ---------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 11   | Estimasi Parameter     | MLE · Point Estimation · Beta & Dirichlet Distribution      | Mahasiswa mampu melakukan estimasi titik menggunakan MLE dan MAP                                                                                   |
| 12   | Confidence Interval    | Z-Score · Frequentist CI · Credible Interval · Interpretasi | Mahasiswa mampu membangun dan menginterpretasikan confidence interval                                                                              |
| 13   | Uji Hipotesis          | Z-Test · Proporsi · A/B Test · P-Value Drawbacks            | Mahasiswa mampu merumuskan hipotesis nol dan alternatif dengan benar serta mampu melakukan uji hipotesis rata-rata dan menginterpretasikan p-value |
| 14   | Aplikasi Komputasi     | Simulasi · MCMC · Bloom Filters                             | Mahasiswa mampu melakukan simulasi probabilitas menggunakan tools komputasi dan menerapkan MCMC serta Bloom Filters                                |
| 15   | Review & Persiapan UAS | Rangkuman Minggu 9–14                                       | Ujian Akhir Semester                                                                                                                               |

---

## 3. Week 11 — Estimasi Parameter (FULLY IMPLEMENTED)

Week 11 renders four interactive modules sequentially in the main content area, each in its own card.

### Module structure per card:

1. Module title + number badge (e.g. "Modul 1 dari 4")
2. Distribution label (e.g. "Distribusi: Bernoulli")
3. Context/kasus label (gray callout box)
4. Input controls
5. Computed values summary (live)
6. Step-by-step derivation panel (collapsible, open by default)
7. Chart
8. Supporting table or interpretation box

---

### Module 11.1 — MLE: Bernoulli

#### Purpose

Demonstrate MLE derivation for Bernoulli distribution. Show that θ̂ = k/n always, with full derivation rendered in LaTeX and live likelihood curve.

#### Context label

> **Kasus:** Tim QA menguji sejumlah fitur. Setiap fitur: ✅ lulus (1) atau ❌ gagal (0). Berapa estimasi probabilitas lulus (θ)?

#### Input

- A row of toggle buttons, each toggled between ✅ (1) and ❌ (0)
- Min 1 trial, max 10 trials
- Buttons: **"+ Tambah Fitur"** / **"− Hapus"**
- Default: 5 trials = (1, 1, 0, 1, 0)

#### Computed values

Let dataset = $(x_1, \ldots, x_n)$, each $x_i \in \{0,1\}$

| Symbol | Formula                                 |
| ------ | --------------------------------------- |
| n      | count of all trials                     |
| k      | $\sum x_i$                              |
| θ̂_MLE  | $k / n$                                 |
| L(θ̂)   | $\hat{\theta}^k (1-\hat{\theta})^{n-k}$ |

#### Derivation panel (LaTeX, live substitution of k and n)

Step 1 — Likelihood:
$$L(\theta) = \theta^k (1-\theta)^{n-k}$$

Step 2 — Log-likelihood:
$$\ln L(\theta) = k \ln\theta + (n-k)\ln(1-\theta)$$

Step 3 — Derivative, set to zero:
$$\frac{d \ln L}{d\theta} = \frac{k}{\theta} - \frac{n-k}{1-\theta} = 0$$

Step 4 — Solve:
$$k(1-\theta) = (n-k)\theta \implies k = n\theta \implies \hat{\theta}_{MLE} = \frac{k}{n}$$

#### Likelihood curve chart

- X-axis: θ ∈ [0, 1], 101 points
- Y-axis: $L(\theta) = \theta^k(1-\theta)^{n-k}$
- Recharts `LineChart`
- Vertical dashed red line at θ = k/n, labeled "θ̂ = {value}"
- Edge case k=0: note "Semua gagal → θ̂ = 0"; edge case k=n: note "Semua lulus → θ̂ = 1"

#### Candidate θ comparison table

| θ         | L(θ)         | Note                    |
| --------- | ------------ | ----------------------- |
| 0.10      | computed     |                         |
| 0.30      | computed     |                         |
| **θ̂_MLE** | **computed** | ← tertinggi (green row) |
| 0.80      | computed     |                         |
| 1.00      | computed     |                         |

---

### Module 11.2 — MLE: Poisson

#### Purpose

Demonstrate MLE for Poisson. Show θ̂ = x̄ via derivation and log-likelihood curve.

#### Context label

> **Kasus:** Sistem DevOps mencatat jumlah error API per jam. Berapa estimasi rata-rata error per jam (λ)?

#### Input

- List of integer inputs (each ≥ 0, max value 20)
- Min 1 observation, max 8
- Buttons: **"+ Tambah Jam"** / **"− Hapus"**
- Default: [3, 0, 2, 7]

#### Computed values

| Symbol | Formula               |
| ------ | --------------------- |
| n      | count of observations |
| Σxᵢ    | $\sum_{i=1}^{n} x_i$  |
| θ̂_MLE  | $\sum x_i / n$        |

#### Derivation panel (LaTeX, live substitution)

Step 1 — Likelihood:
$$L(\theta) = \prod_{i=1}^{n} \frac{e^{-\theta}\theta^{x_i}}{x_i!} = \frac{e^{-n\theta} \cdot \theta^{\sum x_i}}{\prod x_i!}$$

Step 2 — Log-likelihood (drop constant $C = -\sum \ln(x_i!)$):
$$\ln L(\theta) = -n\theta + \left(\sum x_i\right)\ln\theta + C$$

Step 3 — Derivative, set to zero:
$$\frac{d \ln L}{d\theta} = -n + \frac{\sum x_i}{\theta} = 0$$

Step 4 — Solve:
$$\hat{\theta}_{MLE} = \frac{\sum x_i}{n}$$

#### Log-likelihood curve chart

- X-axis: θ ∈ [0.01, max(2×θ̂, 10)], 200 points — dynamically scaled
- Y-axis: $\ln L(\theta) = -n\theta + (\sum x_i)\ln\theta$ (omit constant C)
- **Use log-likelihood, not raw likelihood** — prevents floating-point underflow
- Vertical dashed red line at θ = θ̂, labeled "θ̂ = {value} error/jam"
- Edge case Σxᵢ = 0: show notice, suppress chart (ln(0) undefined)

#### Interpretation box

> Estimasi MLE: rata-rata **{θ̂} error per jam**.
> Sistem alerting: kirim notifikasi jika error > **{2×θ̂} per jam**.

---

### Module 11.3 — Beta Distribution Explorer

#### Purpose

Show how Beta(α,β) represents belief about an unknown probability, and how it narrows as data accumulates.

#### Context label

> **Kasus:** Anda memantau _click-through rate_ (CTR) fitur baru. Sebelum ada data, semua nilai CTR dianggap sama mungkin. Seiring data terkumpul, keyakinan Anda menguat.

#### Input

| Slider                        | Range | Default |
| ----------------------------- | ----- | ------- |
| k — Jumlah Klik (sukses)      | 0–100 | 0       |
| m — Jumlah Tidak Klik (gagal) | 0–100 | 0       |

Parameters: **α = k + 1**, **β = m + 1** (off-by-one per Tsun, 2020, p. 269 — must be exact)

#### Computed values

| Symbol | Formula                                       | Edge case         |
| ------ | --------------------------------------------- | ----------------- |
| α      | k + 1                                         | —                 |
| β      | m + 1                                         | —                 |
| Mode   | $(k) / (k+m)$ = $(\alpha-1)/(\alpha+\beta-2)$ | "—" when k=0, m=0 |
| Mean   | $(k+1)/(k+m+2)$ = $\alpha/(\alpha+\beta)$     | —                 |

When k=0, m=0: display "Beta(1,1) = Uniform(0,1) — Tidak ada modus, semua nilai CTR sama mungkin."

#### Beta PDF chart

- X-axis: x ∈ [0, 1], 201 points
- Y-axis: $f(x) = x^{\alpha-1}(1-x)^{\beta-1} / B(\alpha,\beta)$
- Recharts `AreaChart` with filled area
- Dashed red line at Mode (when defined); dotted orange line at Mean
- Y-axis auto-scaled; min Y-max = 1.5 (for uniform case)

**Required betaPDF implementation (Lanczos log-gamma — do not deviate):**

```javascript
function lnGamma(z) {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5)
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return (
    0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x)
  );
}

function betaPDF(x, alpha, beta) {
  if (x <= 0 || x >= 1) return 0;
  const lnB = lnGamma(alpha) + lnGamma(beta) - lnGamma(alpha + beta);
  return Math.exp(
    (alpha - 1) * Math.log(x) + (beta - 1) * Math.log(1 - x) - lnB,
  );
}
```

#### Preset scenario buttons (from Tsun, 2020, p. 269–270)

| Label               | k   | m   | α   | β   |
| ------------------- | --- | --- | --- | --- |
| "Belum ada data"    | 0   | 0   | 1   | 1   |
| "8 klik, 2 tidak"   | 8   | 2   | 9   | 3   |
| "80 klik, 20 tidak" | 80  | 20  | 81  | 21  |
| "2 klik, 3 tidak"   | 2   | 3   | 3   | 4   |

#### Parameter summary card

```
Beta(α={α}, β={β})
Modus : {mode or "—"}
Mean  : {mean, 3 dp}
Interpretasi: Seolah-olah sudah mengamati {k} klik dan {m} tidak klik.
```

---

### Module 11.4 — Dirichlet Distribution Explorer

#### Purpose

Show how Dirichlet(α₁, …, αᵣ) generalizes Beta to r categories, and how each category's marginal belief narrows as observations accumulate. Source: Tsun (2020, p. 270, Definition 7.4.2).

#### Context label

> **Kasus:** Sebuah platform e-commerce mengklasifikasikan sentimen ulasan produk menjadi tiga kategori: 😊 Positif, 😐 Netral, 😞 Negatif. Sistem memperbarui distribusi Dirichlet setiap kali ulasan baru masuk — tanpa melatih ulang model dari nol.

#### Input

| Slider              | Range  | Default |
| ------------------- | ------ | ------- |
| k₁ — Ulasan Positif | 0–1000 | 0       |
| k₂ — Ulasan Netral  | 0–1000 | 0       |
| k₃ — Ulasan Negatif | 0–1000 | 0       |

Parameters: **αᵢ = kᵢ + 1** (mirror Beta off-by-one per Tsun, 2020, p. 269–270 — must be exact). Total concentration **α₀ = Σ αⱼ**.

#### Computed values

| Symbol  | Formula                                              | Edge case           |
| ------- | ---------------------------------------------------- | ------------------- |
| αᵢ      | kᵢ + 1                                               | —                   |
| α₀      | Σ αⱼ                                                 | —                   |
| Mode pᵢ | $k_i / \sum_j k_j$ = $(\alpha_i - 1)/(\alpha_0 - r)$ | "—" when all kᵢ = 0 |
| Mean pᵢ | $\alpha_i / \alpha_0$                                | —                   |

When all kᵢ = 0: display "Dir(1, 1, 1) = Uniform pada simplex — semua proporsi sama mungkin."

#### Marginal Beta chart

Each marginal of a Dirichlet is a Beta: **Xᵢ ~ Beta(αᵢ, α₀ − αᵢ)**. The chart overlays three marginal Beta PDFs on a single [0, 1] axis so students can see directly how each category's belief sharpens around its proportion.

- X-axis: x ∈ [0, 1], 201 points
- Y-axis: `betaPDF(x, αᵢ, α₀ − αᵢ)` for i = 1, 2, 3
- Recharts `AreaChart` with three filled `<Area>` series (Positif / Netral / Negatif) in distinct colors
- Dotted reference line at each category's mean
- Y-axis auto-scaled; min Y-max = 1.5 (for uniform case)

**Required dirichletPDF implementation (Lanczos log-gamma — do not deviate):**

```javascript
function lnMultiBeta(alphas) {
  let sumAlpha = 0;
  let sumLnGamma = 0;
  for (const a of alphas) {
    sumAlpha += a;
    sumLnGamma += lnGamma(a);
  }
  return sumLnGamma - lnGamma(sumAlpha);
}

function dirichletPDF(xs, alphas) {
  if (xs.length !== alphas.length) return 0;
  let logTerm = 0;
  for (let i = 0; i < xs.length; i++) {
    if (xs[i] <= 0 || xs[i] >= 1) return 0;
    logTerm += (alphas[i] - 1) * Math.log(xs[i]);
  }
  return Math.exp(logTerm - lnMultiBeta(alphas));
}
```

The chart renders via marginal `betaPDF`, but `dirichletPDF` is the authoritative joint-density formula and must be present in `mathUtils`.

#### Preset scenario buttons (from Tsun, 2020, p. 270)

| Label                       | k₁  | k₂  | k₃  | α₁  | α₂  | α₃  |
| --------------------------- | --- | --- | --- | --- | --- | --- |
| "Belum ada data"            | 0   | 0   | 0   | 1   | 1   | 1   |
| "Ulasan awal (600/250/150)" | 600 | 250 | 150 | 601 | 251 | 151 |
| "Imbang (10/10/10)"         | 10  | 10  | 10  | 11  | 11  | 11  |
| "Polar (50/5/45)"           | 50  | 5   | 45  | 51  | 6   | 46  |

#### Parameter summary card

```
Dir(α₁={α₁}, α₂={α₂}, α₃={α₃})
Modus : ({p̂₁ or "—"}, {p̂₂ or "—"}, {p̂₃ or "—"})
Mean  : ({mean₁, 3 dp}, {mean₂, 3 dp}, {mean₃, 3 dp})
Interpretasi: Seolah-olah sudah mengamati {k₁} positif, {k₂} netral, {k₃} negatif.
```

**Hubungan Beta–Dirichlet:** Jika k₃ = 0 (slider fixed di nol) dan hanya k₁, k₂ yang divariasikan, marginal pertama harus cocok dengan Beta(k₁+1, k₂+1) di Module 11.3 — yaitu Dirichlet runtuh menjadi Beta untuk r = 2.

---

## 4. Week 12 — Confidence Interval (FULLY IMPLEMENTED)

**Source:** Tsun, 2020, Ch. 8 (§8.1 & §8.2); RPS Sub-CPMK: "Mahasiswa mampu membangun dan menginterpretasikan confidence interval"

**Slide deck of record:** `references/week12.md` (16 slides). Module pedagogy is derived from slides 7–13.

Week 12 renders four interactive modules in the main content area, each in its own `ModuleCard`. The slide-9 Bernoulli book example (n=400, k=136, 99%) is the canonical reference instance and surfaces as a preset in Module 12.1.

### Module 12.1 — Confidence Interval untuk Proporsi (Bernoulli)

#### Purpose

Walk the canonical book example (Tsun, 2020, hal. 300–301): build a 100(1−α)% CI for Bernoulli θ from $n$ and $k = \sum x_i$ using the CLT-based Z formula. Mirrors the slide-9 derivation, live.

#### Context label

> **Kasus:** Tim QA NimbusStore mengamati upload success rate dari $n$ percobaan. Bangun confidence interval untuk θ sesungguhnya menggunakan CLT.

#### Input

| Control                | Range                                        | Default |
| ---------------------- | -------------------------------------------- | ------- |
| $n$ slider             | 10–2000                                      | 400     |
| $k$ slider             | 0–$n$ (clamps if $n$ shrinks)                | 136     |
| Confidence level radio | 90% (z=1.645) / 95% (z=1.96) / 99% (z=2.576) | 99%     |

#### Computed values

| Symbol         | Formula                                                          |
| -------------- | ---------------------------------------------------------------- |
| $\hat{\theta}$ | $k / n$                                                          |
| $\hat{\sigma}$ | $\sqrt{\hat{\theta}(1-\hat{\theta})}$                            |
| $\Delta$       | $z_{1-\alpha/2} \cdot \hat{\sigma} / \sqrt{n}$                   |
| CI             | $[\max(0, \hat{\theta}-\Delta),\; \min(1, \hat{\theta}+\Delta)]$ |

#### Derivation panel (4 steps, live substitution)

1. **Definisi** — boxed formula $\hat{\theta} \pm z_{1-\alpha/2}\cdot \sigma/\sqrt{n}$ with citation (Tsun, 2020, hal. 300).
2. **Parameter dari data** — $\hat{\theta}=k/n$ and $\hat{\sigma}\approx\sqrt{\hat{\theta}(1-\hat{\theta})}$ with live numbers; $\alpha$ and $z$ stated explicitly.
3. **Substitusi** — $\hat{\theta} \pm z\cdot\hat{\sigma}/\sqrt{n}$ filled with live numbers, matching slide-9 step 4.
4. **Hasil** — `[lower, upper]` with 3 dp, plus the natural-language sentence: "Kami $X$% yakin bahwa θ sesungguhnya berada di antara $\ldots$ dan $\ldots$. Titik estimasi terbaik kami: $\ldots$."

#### Chart

A Recharts `AreaChart` plotting the Normal sampling distribution of $\hat\theta$ — i.e. $N(\hat\theta, \hat\sigma^2/n)$ — over the auto-zoomed x-range $[\hat\theta - 4\hat\sigma/\sqrt n,\; \hat\theta + 4\hat\sigma/\sqrt n]$ clamped to $[0,1]$. A second `Area` series shades only the CI band $[\text{lower}, \text{upper}]$ at higher opacity. `ReferenceLine`s mark $\hat\theta$ (dashed) and each CI endpoint.

#### Preset buttons

| Label                                  | n   | k   | level |
| -------------------------------------- | --- | --- | ----- |
| "Buku Tsun (n=400, k=136)"             | 400 | 136 | 99%   |
| "NimbusStore upload (n=200, k=154)"    | 200 | 154 | 95%   |
| "Retention smart-sync (n=300, k=210)"  | 300 | 210 | 95%   |
| "E-commerce gagal bayar (n=500, k=45)" | 500 | 45  | 95%   |

---

### Module 12.2 — Width Explorer: Pengaruh n dan Confidence Level

#### Purpose

Make slide 10 interactive: show that CI width scales as $z\sigma/\sqrt n$, that halving the width requires $4\times$ the sample, and that higher confidence levels widen the interval. Includes an inverse calculation for the minimum $n$ needed to hit a target margin.

#### Context label

> **Kasus:** Tim produk menjalankan A/B test; berapa $n$ minimum agar margin error ≤ ±2% pada confidence 95%? Eksplorasi trade-off antara ukuran sampel, tingkat keyakinan, dan presisi.

#### Input

| Control                        | Range                 | Default                         |
| ------------------------------ | --------------------- | ------------------------------- |
| $n$ slider (log-position)      | 10–10000              | 400                             |
| $\sigma$ slider                | 0.05–0.5              | 0.5 (slide-10 conservative max) |
| Confidence level radio         | 90% / 95% / 98% / 99% | 95%                             |
| Target margin $m$ number input | 0.001–0.5             | 0.02                            |

#### Computed values

| Symbol     | Formula                         |
| ---------- | ------------------------------- |
| $\Delta$   | $z \sigma / \sqrt n$            |
| Lebar      | $2\Delta$                       |
| $n_{\min}$ | $\lceil (z\sigma / m)^2 \rceil$ |

#### Derivation panel

1. **Definisi** — $\text{Lebar} = 2 z_{1-\alpha/2}\cdot\sigma/\sqrt n$ (Tsun, 2020, hal. 300).
2. **Parameter dari data** — current $z$, $\sigma$, $n$.
3. **Substitusi** — $\Delta = z\sigma/\sqrt n$ with live numbers; full width $2\Delta$.
4. **Hasil** — current Δ and 2Δ; the inverse $n_{\min} = \lceil (z\sigma/m)^2 \rceil$ derivation; reminder that halving Δ costs $4\times$ the data.

#### Chart

Recharts `LineChart` of $\Delta(n) = z\sigma/\sqrt n$ vs $n$ on a `scale="log"` x-axis, 80 log-spaced points 10–10000. Three lines overlay levels 90% / 95% / 99% in distinct colours. Vertical `ReferenceLine` at current $n$; horizontal `ReferenceLine` at the target margin $m$.

#### Supporting table

For the current $\sigma$, show Δ values at $n \in \{25, 100, 400, 1600\}$ across the 90% / 95% / 99% levels (slide-10 table form, live $\sigma$).

#### Preset buttons

| Label                              | n    | σ   | level | m    |
| ---------------------------------- | ---- | --- | ----- | ---- |
| "Slide 10 default (σ=0.5, n=100)"  | 100  | 0.5 | 95%   | 0.05 |
| "A/B test margin ±2% (n_min=2401)" | 2401 | 0.5 | 95%   | 0.02 |
| "Survei politik (σ=0.5, n=1000)"   | 1000 | 0.5 | 95%   | 0.03 |

---

### Module 12.3 — Interpretation Simulator: Apa Artinya "95% Confident"?

#### Purpose

Make slide 11 visceral. Fix a known true $\theta$, draw $K$ independent samples of size $n$ using a seeded PRNG, build each CI, and show that ≈ $(1-\alpha)\cdot K$ of them actually contain $\theta$. Demolishes the "95% probability $\theta$ is in this interval" misconception.

#### Context label

> **Kasus:** Simulasikan prosedur survei berulang kali — dengan θ yang sebenarnya diketahui — lalu hitung berapa persen interval yang benar-benar mengandung θ. Ini membongkar miskonsepsi paling umum tentang CI.

#### Input

| Control                     | Range                 | Default                                                         |
| --------------------------- | --------------------- | --------------------------------------------------------------- |
| True $\theta$ slider        | 0.05–0.95             | 0.5                                                             |
| Sample size $n$ slider      | 30–500                | 100                                                             |
| Number of trials $K$ slider | 20–200                | 100                                                             |
| Confidence level radio      | 80% / 90% / 95% / 99% | 95%                                                             |
| **"Jalankan Ulang"** button | —                     | re-seeds the simulation by incrementing an internal run counter |

#### Randomness

Simulation uses `mulberry32(seed)` from `src/utils/mathUtils.ts` with `seed = 1000 + runCounter * 7919`. Each button click increments `runCounter`, producing a fresh deterministic sequence — no `Math.random` anywhere.

#### Computed values

Per trial $i$: $k_i$, $\hat{\theta}_i = k_i/n$, $CI_i$, indicator $[\theta \in CI_i]$. Summary: hit count, observed coverage rate, expected coverage = $(1-\alpha)\cdot 100\%$.

#### Derivation panel

1. **Definisi** — $P(\theta \in [\hat\theta-\Delta, \hat\theta+\Delta]) = 1-\alpha$ with the slide-11 correct interpretation quote (Tsun, 2020, hal. 301).
2. **Parameter dari data** — current $\theta$, $n$, $K$, $z$.
3. **Substitusi** — generative form for trial $i$: $x_{i,j} \sim \mathrm{Ber}(\theta)$, $\hat\theta_i = \frac{1}{n}\sum_j x_{i,j}$.
4. **Hasil** — observed coverage rate $\#\{i: \theta \in CI_i\}/K$ vs nominal $(1-\alpha)$.

#### Chart

Custom SVG-via-CSS visualization (not Recharts) since Recharts has no native horizontal-range-segment shape. The chart is a `<div>` with `position: relative` and bars positioned in percentage units: each bar at `top: i*(100/K)%`, `left: lower*100%`, `width: (upper-lower)*100%`, height auto-derived from $K$. Colour: `--chart-5` (green) if contains $\theta$, `--destructive` (red) otherwise. A vertical line at `left: theta*100%` marks the true $\theta$. The container has fixed pixel height capped between 220 and 420 to keep bars legible at low/high $K$.

#### Interpretation box

Side-by-side wrong-vs-right table from slide 11: the "❌ Salah" column quotes the misconception (using the live $X$% level); the "✅ Benar" column quotes the textbook correction.

---

### Module 12.4 — Credible Interval (Bayesian) vs Confidence Interval

#### Purpose

Make slides 12–13 interactive: build a Bayesian credible interval from a Beta posterior using the conjugate Beta–Bernoulli update, and compare side-by-side with the frequentist CI from Module 12.1. Connects back to Week 11's `BetaExplorer`: when $\alpha_0 = \beta_0 = 1$ (uniform prior), the posterior collapses to Beta(k+1, m+1), identical to Module 11.3.

#### Context label

> **Kasus:** NimbusStore mengestimasi retention rate fitur baru. Kombinasikan prior dari data historis dengan observasi baru. Bandingkan credible interval (Bayesian) dengan confidence interval (frequentist).

#### Input

| Control                 | Range                 | Default                    |
| ----------------------- | --------------------- | -------------------------- |
| Prior $\alpha_0$ slider | 1–50                  | 7                          |
| Prior $\beta_0$ slider  | 1–50                  | 3                          |
| $k$ slider (sukses)     | 0–500                 | 11                         |
| $m$ slider (gagal)      | 0–500                 | 1                          |
| Credible level radio    | 80% / 90% / 95% / 99% | 80% (matches book example) |

#### Computed values

| Symbol                      | Formula                                                                                                                      |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Posterior $\alpha$          | $\alpha_0 + k$                                                                                                               |
| Posterior $\beta$           | $\beta_0 + m$                                                                                                                |
| Posterior mean              | $\alpha/(\alpha+\beta)$                                                                                                      |
| Posterior mode              | $(\alpha-1)/(\alpha+\beta-2)$ if $\alpha,\beta > 1$ else "—"                                                                 |
| Credible interval           | $[F^{-1}_{\text{Beta}(\alpha,\beta)}(\alpha_{\text{lvl}}/2),\; F^{-1}_{\text{Beta}(\alpha,\beta)}(1-\alpha_{\text{lvl}}/2)]$ |
| Frequentist CI (comparison) | `bernoulliCI(k, k+m, z)`                                                                                                     |

#### Derivation panel

1. **Definisi** — credible interval definition (Tsun, 2020, hal. 304, Def 8.2.1).
2. **Parameter dari data** — posterior $\mathrm{Beta}(\alpha_0+k,\;\beta_0+m)$ with live numbers.
3. **Substitusi** — explicit $a = F^{-1}_{\text{Beta}(\alpha,\beta)}(\alpha_{\text{lvl}}/2)$, $b = F^{-1}_{\text{Beta}(\alpha,\beta)}(1-\alpha_{\text{lvl}}/2)$.
4. **Hasil** — credible interval $[a, b]$ with 4 dp.

#### Chart

Recharts `AreaChart` of the posterior Beta PDF on $[0, 1]$ (201 points). A second `Area` series gated to the credible-interval x-range shades the band at higher opacity. `ReferenceLine`s mark posterior mean, posterior mode (when defined), and the credible-interval endpoints.

#### Comparison table

Direct slide-13 dimension matrix populated with the **live** credible interval and the live frequentist CI for the same $k, m$:

| Dimensi                | Credible Interval (Bayesian)                                        | Confidence Interval (Frequentist)                                     |
| ---------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Apa itu θ?             | Variabel acak Θ                                                     | Tetap, tidak diketahui                                                |
| Interval pada data ini | live `[a, b]`                                                       | live `bernoulliCI` result                                             |
| Rumus                  | $[F^{-1}(\alpha/2), F^{-1}(1-\alpha/2)]$                            | $\hat\theta \pm z\hat\sigma/\sqrt n$                                  |
| Interpretasi           | $P(\Theta \in [a,b]) = 1-\alpha$ — pernyataan probabilitas langsung | $1-\alpha$ dari prosedur akan menghasilkan interval yang mengandung θ |
| Butuh prior?           | Ya — Beta(α₀, β₀)                                                   | Tidak                                                                 |

#### Preset buttons

| Label                                   | α₀  | β₀  | k   | m   | level | Expected credible interval   |
| --------------------------------------- | --- | --- | --- | --- | ----- | ---------------------------- |
| "Buku Tsun (n=12, k=11)"                | 7   | 3   | 11  | 1   | 80%   | ≈ [0.7089, 0.9142]           |
| "Retention smart-sync (prior historis)" | 14  | 6   | 210 | 90  | 95%   | ≈ [0.638, 0.745]             |
| "Uninformative + Bernoulli buku"        | 1   | 1   | 136 | 264 | 99%   | compare to CI [0.279, 0.401] |

---

### Week 12 acceptance criteria

| #       | Criterion                                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| AC-12-1 | Module 12.1 with preset "Buku Tsun (n=400, k=136)" and level 99% produces CI ≈ [0.279, 0.401] within ±0.001                           |
| AC-12-2 | Module 12.1 derivation panel substitutes live $n$, $k$, $z$; all formulas render as KaTeX (not raw strings)                           |
| AC-12-3 | Module 12.2 log-x width plot's vertical reference line tracks the current $n$ slider; lines for 90/95/99 are visually distinct        |
| AC-12-4 | Module 12.2 inverse calculation: σ=0.5, level=95%, m=0.02 produces $n_{\min} = 2401$                                                  |
| AC-12-5 | Module 12.3 with K=200, level=95%, default seed produces coverage rate within ±5 percentage points of 95%                             |
| AC-12-6 | Module 12.3 "Jalankan Ulang" produces a different deterministic sample sequence each click (seeded by run counter)                    |
| AC-12-7 | Module 12.4 with preset "Buku Tsun (n=12, k=11)" produces credible interval ≈ [0.7089, 0.9142] within ±0.001                          |
| AC-12-8 | Module 12.4 with α₀=1, β₀=1 collapses to Beta(k+1, m+1) — visually identical posterior to Module 11.3 `BetaExplorer` for the same k,m |

### Week 13 Modules

| #       | Criterion                                                                                                                              |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| AC-13-1 | Module 13.1 preset "Buku Tsun SuperSAT" (μ₀=1059, σ=210, n=100, x̄=1113, right) produces Z = 54/21 ≈ 2.571 and p ≈ 0.0051 (note: Tsun 2020 p. 306 rounds Z to 2.14 by typo; our preset shows the correct arithmetic) |
| AC-13-2 | Module 13.1 preset "MLOps latency" (μ₀=120, σ=24, n=64, x̄=113, left) produces Z ≈ −2.33 and p ≈ 0.0099 within ±0.001                   |
| AC-13-3 | Module 13.1 chart shades the rejection region(s) per the selected alternative and highlights the observed Z                            |
| AC-13-4 | Module 13.2 preset "Buku Washington" (p₀=0.75, n=137, k=131, right, α=0.01) produces Z ≈ 5.57 (book quotes 5.43 — same arithmetic typo as 13.1) and rejects H₀ at p ≪ 0.01 |
| AC-13-5 | Module 13.2 preset "Antivirus 95% claim" (p₀=0.95, n=200, k=188, left, α=0.05) produces Z ≈ −0.65 and fails to reject                  |
| AC-13-6 | Module 13.3 preset "NimbusStore A/B UI" produces Z ≈ 2.66 and two-sided p ≈ 0.008 within ±0.001                                        |
| AC-13-7 | Module 13.4 n-effect sub-demo with δ=0.001 shows p < 0.05 at n ≳ 10⁶ while the "practically significant" verdict stays "tidak"          |
| AC-13-8 | Module 13.4 p-hacking sub-demo (K seeded trials, peek-every-step) reports an inflated family-wise FPR well above the nominal α        |
| AC-13-9 | All Week 13 derivation panels render the 4 mandated steps (Definisi → Parameter → Substitusi → Hasil) with live `String.raw` values   |

### Week 14 Modules

| #       | Criterion                                                                                                                              |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| AC-14-1 | Module 14.1 scenario "Setidaknya satu 6" with n_trials = 100 000 produces an estimate within ±0.005 of the analytic 1 − (5/6)³ ≈ 0.421 |
| AC-14-2 | Module 14.1 convergence chart is downsampled to ≤ ~500 points at large n_trials and includes a reference line at the analytic value   |
| AC-14-3 | Module 14.1 "Re-run" advances the seed so the deterministic sample sequence differs on each click                                     |
| AC-14-4 | Module 14.2 uses the EXACT `bloomFPR(m, k, n) = (1 − (1 − 1/m)ⁿ)ᵏ`; the asymptotic `e^(−kn/m)` form is NOT substituted                |
| AC-14-5 | Module 14.2 `bloomHash(s, salt, m)` returns the same bit index on repeated calls with identical `(s, salt, m)` (determinism)          |
| AC-14-6 | Module 14.2 insert/query panel reports TRUE-mungkin / FALSE-pasti-tidak based on whether all k bit indices for the query are set      |
| AC-14-7 | Module 14.3 TSP "Auto-step" runs via `requestAnimationFrame`; resetting the seed reproduces the same trajectory bit-for-bit            |
| AC-14-8 | Module 14.3 Knapsack mode rejects MCMC proposals that violate the capacity constraint and surfaces the rejected-move counter         |
| AC-14-9 | All Week 14 derivation panels render the 4 mandated steps and (for 14.2/14.3) cite Theorem 9.4.39 / Algorithm 3 & 4 respectively      |

---

## 5. Week 13 — Uji Hipotesis (FULLY IMPLEMENTED)

**Source:** Tsun, 2020, Ch. 8.3 (hal. 305–315); RPS Sub-CPMK: "Mahasiswa mampu merumuskan hipotesis nol dan alternatif dengan benar serta mampu melakukan uji hipotesis rata-rata dan menginterpretasikan p-value"

**Slide deck of record:** `references/week13.md`. Module pedagogy is derived from slides 4–13.

Week 13 renders four interactive modules in the main content area, each in its own `ModuleCard`. All Z-test math is centralized in `src/utils/mathUtils.ts` (`pValueFromZ`, `oneSampleZ`, `oneSampleZProportion`, `twoSampleZ`).

### Module 13.1 — One-Sample Z-Test untuk Rata-rata

Inputs: μ₀, x̄, σ, n, α, alternative direction (`>`, `<`, `≠`). Computes Z = (x̄ − μ₀)/(σ/√n), p-value via `pValueFromZ`, and a tolak/gagal-tolak decision against α. The chart shows the standard Normal PDF with the rejection region(s) shaded and the observed Z marker; the p-value tail is shaded distinctly.

**Presets:**
- "Buku Tsun SuperSAT" — μ₀=1059, σ=210, n=100, x̄=1113, right-tail → Z = 54/21 ≈ 2.571, p ≈ 0.0051 (Tsun 2020 p. 306 quotes Z ≈ 2.14 / p ≈ 0.0162 by arithmetic typo; the module displays the correct value)
- "MLOps latency" — μ₀=120, σ=24, n=64, x̄=113, left-tail → Z ≈ −2.33, p ≈ 0.0099

### Module 13.2 — One-Sample Z-Test untuk Proporsi

Inputs: p₀, n, k (jumlah sukses), α, alternative. Computes σ₀ = √(p₀(1−p₀)/n), Z = (k/n − p₀)/σ₀, p-value, and decision. Chart shape mirrors 13.1.

**Presets:**
- "Buku Washington" — p₀=0.75, n=137, k=131, right-tail, α=0.01 → Z ≈ 5.57 (book quotes 5.43, same arithmetic typo), reject H₀
- "Antivirus 95% claim" — p₀=0.95, n=200, k=188, left-tail, α=0.05 → Z ≈ −0.65, fail to reject

### Module 13.3 — Two-Sample Z-Test (A/B Test)

Inputs: x̄₁, σ₁, n₁, x̄₂, σ₂, n₂, α, alternative. Computes Z = (x̄₁ − x̄₂)/√(σ₁²/n₁ + σ₂²/n₂), p-value (two-sided default), and decision.

**Preset:**
- "NimbusStore A/B UI" (slide 10) — A: x̄=4.2 σ=1.0 n=80; B: x̄=3.8 σ=0.9 n=80; two-sided, α=0.05 → Z ≈ 2.66, p ≈ 0.008

### Module 13.4 — Kelemahan P-Value

Pedagogical module surfacing the two classic p-value failure modes from slides 12–13:

1. **n-effect sub-demo** — fix a tiny true effect (δ ≈ 0.001 in conversion rate), slide n on a log scale 100 → 1,000,000; the live table shows p-value crashing to 0 while practical significance stays "tidak signifikan secara praktis".
2. **P-hacking / optional stopping sub-demo** — simulate K trials of "peek every step; stop if p<0.05" using `mulberry32`. Show the family-wise false positive rate vs the single-shot test.

Plus the statistical-vs-practical 2×2 matrix from slide 13 with a live verdict for the current state.

### Derivation panel structure (all four modules)

Every module wraps its math in `<DerivationPanel>` with at least the 4 mandated `<BlockMath>` steps from CLAUDE.md (Definisi → Parameter dari data → Substitusi → Hasil), citing Tsun, 2020, hal. 305–315. Live state is substituted via `String.raw` template literals.

---

## 6. Week 14 — Aplikasi Statistika pada Komputasi (FULLY IMPLEMENTED)

**Source:** Tsun, 2020, Ch. 9 (Probability via Simulation, MCMC, Bloom Filters); RPS Sub-CPMK: "Mahasiswa mampu melakukan simulasi probabilitas menggunakan tools komputasi dan menerapkan MCMC serta Bloom Filters"

**Slide deck of record:** `references/week14.md`. Module pedagogy is derived from slides 4–13.

Week 14 renders three interactive modules in the main content area, each in its own `ModuleCard`. All shared math (PRNG, Bloom hash + FPR) lives in `src/utils/mathUtils.ts`; the MCMC step kernels (Algorithm 3 Knapsack, Algorithm 4 TSP) are local to `MCMCVisualizer.tsx` since they are not reused.

### Module 14.1 — Probability via Simulation

A segmented control switches between three book scenarios, all driven by a shared seeded `mulberry32` PRNG with a "Re-run" button:

- **(a) Berapa lemparan sampai sukses** — Geometric(p). Estimates E[X] = 1/p (slide 5 book example).
- **(b) Tepat 13 fixed points dalam shuffle 100** — Fisher-Yates shuffle simulation; estimates the matching probability (slide 6 book example). Analytic reference uses e⁻¹/13!.
- **(c) Setidaknya satu 6 dalam 3 lemparan dadu** — analytic value 1 − (5/6)³ ≈ 0.421 (refleksi #2, slide 16).

Common inputs: `n_trials` on a log slider 10 → 100,000. Outputs: live estimate, analytic value, absolute error, and a Recharts `LineChart` of the running estimate vs trial index with a horizontal reference line at the analytic value. Convergence curve is downsampled to ~500 points for performance at large `n_trials`.

### Module 14.2 — Bloom Filter Simulator

Inputs: m (bit-array length per row, 64–4096), k (hash count, 1–10), n (items inserted, 0–500).

Computed:
- **Theoretical FPR** via the exact `bloomFPR(m, k, n) = (1 − (1 − 1/m)ⁿ)ᵏ` (Theorem 9.4.39, Tsun 2020 hal. 329). Do **not** substitute the asymptotic `e^(−kn/m)` approximation.
- **Empirical FPR** from a fixed test set of "URLs" queried against the simulated filter.

Visualizations:
- **(a) Bit-array heatmap** — all k rows × m squares; lit squares mark set bits. Updates as n increases.
- **(b) FPR chart** — theoretical FPR vs n curve for the current (m, k); `ReferenceLine` at the current n; empirical FPR overlay as a scatter point.

Interactive panel: free-text "insert URL" / "check URL" surfacing the k bit indices touched (via `bloomHash(str, salt, m)`, FNV-1a-style deterministic) and the contains() verdict ("TRUE — mungkin ada" / "FALSE — pasti tidak ada").

**Preset:** "Google Chrome SafeBrowsing" (m = 900 000, k = 30, n = 5 × 10⁶) — heatmap is capped for sane rendering while the theoretical FPR display still shows the production-scale figure.

### Module 14.3 — MCMC Visualizer (TSP + Knapsack toggle)

Segmented control selects "TSP" or "Knapsack"; both share the Metropolis acceptance kernel `e^(−Δ/T)`. The PRNG is `mulberry32` keyed by user-selected seed so runs are reproducible.

**TSP mode** (slide 13): n_cities slider 5–25, temperature T slider 0–50, step count. Seeded random city coordinates on the unit square; the current route is drawn as a polyline through the points. Run/Step/Reset buttons plus an "Auto-step" toggle advancing via `requestAnimationFrame`. Chart: tour length vs iteration with the current best-tour overlay.

**Knapsack mode** (slide 12): n items slider 5–20, capacity W slider, T slider. Random weights/values; the selection bitmask is rendered as a row of read-only toggle squares driven by the MCMC chain. Charts: current value vs iteration, plus a counter of MCMC moves rejected for violating the capacity constraint.

### Derivation panel structure (all three modules)

Every module wraps its math in `<DerivationPanel>` with at least the 4 mandated `<BlockMath>` steps from CLAUDE.md (Definisi → Parameter dari data → Substitusi → Hasil). Module 14.2 cites Theorem 9.4.39; Module 14.3 reproduces the Algorithm 3 / Algorithm 4 pseudocode and derives the Metropolis acceptance term `e^(−Δ/T)`.

---

## 7. Week 15 — Review & Persiapan UAS (PLACEHOLDER)

**Source:** RPS Minggu 16 (UAS) — review materi Minggu 9–15  
**Note:** Week 15 in the app serves as a pre-UAS review and summary hub, not a new topic week.

### Placeholder view requirements

The Week 15 page must render the week header (§2.5) followed by **two placeholder module cards**:

#### Planned Module 15.1 — Concept Map: Minggu 11–14

**Placeholder card content:**

- Title: "Modul 1 — Peta Konsep: Estimasi → Inferensi → Komputasi"
- Status badge: `[Segera Hadir]` in amber
- Description: "Modul ini akan menampilkan peta konsep interaktif yang menghubungkan seluruh materi Minggu 11–14: dari MLE → Confidence Interval → Hypothesis Testing → Simulasi Komputasi, dengan tautan ke modul interaktif masing-masing minggu."

#### Planned Module 15.2 — Latihan Soal UAS

**Placeholder card content:**

- Title: "Modul 2 — Bank Soal Latihan"
- Status badge: `[Segera Hadir]` in amber
- Description: "Modul ini akan menyediakan soal latihan berbasis skenario nyata yang mencakup seluruh topik pasca-UTS (Minggu 9–14), dilengkapi jawaban dan langkah penyelesaian yang dapat dibuka/tutup."

---

## 8. Global UI Requirements

### 8.1 Formula rendering

- All mathematical formulas: KaTeX (not MathJax, not plain text)
- Inline: `$...$` — Block: `$$...$$`
- Derivation steps in Week 11 modules: LaTeX with actual numeric values substituted live

### 8.2 Responsiveness

- Desktop (≥ 1024px): sidebar visible, main content fills remainder
- Tablet (768px–1023px): sidebar collapses to icon-only or top bar
- Mobile (< 768px): hamburger menu, sidebar as overlay drawer
- Charts: `ResponsiveContainer` from Recharts, min-width 300px

### 8.3 Real-time updates

- All computed values, derivations, and charts: update immediately on input change
- No submit button anywhere
- React `useState` + `useMemo` for all derived computations

### 8.4 Color scheme

| Element                           | Color                                    |
| --------------------------------- | ---------------------------------------- |
| Sidebar background                | Dark indigo (`#1e1b4b`)                  |
| Sidebar active item               | Indigo (`#6366f1`) with white text       |
| Sidebar hover                     | Light indigo (`#312e81`)                 |
| Top header                        | White with bottom border                 |
| Page background                   | Light gray (`#f8fafc`)                   |
| MLE estimate marker (dashed line) | Red (`#ef4444`)                          |
| Likelihood / log-likelihood curve | Blue (`#3b82f6`)                         |
| Beta PDF fill                     | Indigo 30% opacity (`#6366f1`)           |
| Beta PDF stroke                   | Indigo (`#6366f1`)                       |
| Mode marker                       | Red (`#ef4444`)                          |
| Mean marker                       | Orange (`#f97316`)                       |
| Highlighted MLE table row         | Green (`#dcfce7`)                        |
| Module card background            | White with border `#e2e8f0`              |
| Placeholder badge                 | Amber (`#f59e0b`) background, white text |
| Available badge (Week 11 nav)     | Green (`#22c55e`) dot                    |

### 8.5 Placeholder card anatomy

Every placeholder card must follow this exact structure:

```
┌────────────────────────────────────────┐
│ [Modul N]  [Segera Hadir]             │
│ Title of Planned Module               │
│ ──────────────────────────────────── │
│ Description paragraph (gray text)    │
│                                       │
│ Formula preview (if applicable):      │
│   [KaTeX rendered formula]            │
│                                       │
│ 📋 Rencana interaksi:                │
│   Planned interactions note           │
└────────────────────────────────────────┘
```

- Cards must be visually distinct from implemented modules — use a dashed border (`border-dashed`) and slightly muted background (`#f1f5f9`)
- Do NOT render any interactive controls (inputs, sliders, buttons) on placeholder cards
- The formula preview on placeholder cards is static KaTeX — not interactive

### 8.6 Derivation panel toggle

- Each Week 11 derivation panel: "Tampilkan Derivasi / Sembunyikan Derivasi" toggle
- Default: **visible/open**

### 8.7 Week progress indicator

In the sidebar, below the nav items, show a small progress indicator:

```
Progress
1 dari 5 minggu tersedia
[██░░░░░░░░] 20%
```

This updates automatically as more weeks are implemented (based on which `WeekNPage` components export a non-placeholder flag).

---

## 9. Accuracy Constraints

All formulas must be implemented exactly as specified:

| Formula                      | Correct implementation                                                                          | Do NOT use                                                             |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Bernoulli MLE                | `k / n`                                                                                         | Any iterative optimizer                                                |
| Bernoulli L(θ)               | `Math.pow(theta, k) * Math.pow(1 - theta, n - k)`                                               | Approximations                                                         |
| Poisson log-L(θ)             | `-n * theta + sumX * Math.log(theta)`                                                           | Raw likelihood (underflow risk)                                        |
| Poisson MLE                  | `sumX / n`                                                                                      | Any iterative optimizer                                                |
| Beta PDF                     | `betaPDF(x, alpha, beta)` via Lanczos log-gamma (see §3, Module 11.3)                           | Any non-normalized form                                                |
| Beta α                       | `k + 1`                                                                                         | `k` ← off-by-one error                                                 |
| Beta β                       | `m + 1`                                                                                         | `m` ← off-by-one error                                                 |
| Beta Mode                    | `(alpha - 1) / (alpha + beta - 2)` = `k / (k + m)`                                              | Mean or median                                                         |
| Beta Mean                    | `alpha / (alpha + beta)` = `(k+1) / (k+m+2)`                                                    | Mode                                                                   |
| Dirichlet PDF                | `dirichletPDF(xs, alphas)` via `lnMultiBeta` (Lanczos lnGamma)                                  | Any non-normalized form                                                |
| Dirichlet αᵢ                 | `kᵢ + 1`                                                                                        | `kᵢ` ← off-by-one error                                                |
| Dirichlet Mode pᵢ            | `kᵢ / Σⱼ kⱼ` = `(αᵢ − 1) / (α₀ − r)`                                                            | Mean or median                                                         |
| Dirichlet Mean pᵢ            | `αᵢ / α₀`                                                                                       | Mode                                                                   |
| Marginal of Dir              | `betaPDF(x, αᵢ, α₀ − αᵢ)`                                                                       | Plotting joint density in 1D                                           |
| Normal CDF Φ(z)              | `0.5 * (1 + erf(z / Math.SQRT2))` with Abramowitz–Stegun 7.1.26 `erf`                           | Lookup table interpolation                                             |
| Inverse Normal Φ⁻¹(p)        | Beasley–Springer–Moro rational approximation (`normalInverseCDF`)                               | Linear interpolation of Φ                                              |
| Beta CDF $I_x(\alpha,\beta)$ | Regularized incomplete beta via Lentz's continued fraction (Numerical Recipes §6.4) — `betaCDF` | Trapezoidal integration of `betaPDF`                                   |
| Beta inverse CDF             | Bisection on `betaCDF` (tolerance 1e-7, ≤ 60 iters) — `betaInverseCDF`                          | Newton's method without bracketing (diverges near boundaries)          |
| Proportion CI Δ              | `z * Math.sqrt(thetaHat * (1 - thetaHat) / n)` via `bernoulliCI`                                | `z * Math.sqrt(thetaHat * (1 - thetaHat)) / n` ← `/n` outside the sqrt |
| Proportion CI clamp          | Clamp final lower/upper to `[0, 1]` (proportion only)                                           | Clamping σ̂ or $\hat\theta$ (changes the math)                          |
| PRNG for Monte Carlo CI      | `mulberry32(seed)` — seeded, deterministic; seed advances on user trigger                       | `Math.random()` — non-deterministic, not reproducible                  |
| p-value (right tail)         | `1 − normalCDF(z)` via `pValueFromZ(z, "greater")`                                              | `normalCDF(z)` (left tail)                                             |
| p-value (left tail)          | `normalCDF(z)` via `pValueFromZ(z, "less")`                                                     | `1 − normalCDF(z)`                                                     |
| p-value (two-sided)          | `2 * (1 − normalCDF(|z|))` via `pValueFromZ(z, "two")`                                          | `2 * normalCDF(z)` ignoring the sign                                   |
| One-sample Z (mean)          | `(x̄ − μ₀) / (σ/√n)` via `oneSampleZ`                                                            | Use of `s` (sample stdev) instead of σ (known)                         |
| One-sample Z (proportion) σ₀ | `√(p₀(1 − p₀)/n)` — under H₀                                                                    | `√(p̂(1 − p̂)/n)` — Wald σ̂, valid for CI but not for the H₀ test         |
| Two-sample Z (means)         | `(x̄₁ − x̄₂) / √(σ₁²/n₁ + σ₂²/n₂)` via `twoSampleZ`                                              | Pooled-variance form (would assume σ₁ = σ₂)                            |
| Bloom filter FPR             | `(1 − (1 − 1/m)ⁿ)ᵏ` via `bloomFPR(m, k, n)` — EXACT (Theorem 9.4.39)                            | `(1 − e^(−kn/m))ᵏ` — asymptotic approximation only                     |
| Bloom hash                   | `bloomHash(str, salt, m)` — FNV-1a + final avalanche; deterministic for `(str, salt, m)`        | `Math.random()` or non-deterministic JS string hash                    |
| MCMC acceptance              | Metropolis ratio `min(1, e^(−Δ/T))`; reject if invalid (e.g. knapsack capacity)                 | Always-accept downhill moves only (greedy) — destroys ergodicity       |

---

## 10. File Structure (suggested)

```
src/
├── App.jsx                    # Router setup, shell layout
├── components/
│   ├── Sidebar.jsx            # Navigation sidebar
│   ├── TopHeader.jsx          # Top header bar
│   ├── WeekHeader.jsx         # Reusable week header (§2.5)
│   ├── PlaceholderCard.jsx    # Reusable placeholder module card (§8.5)
│   └── DerivationPanel.jsx    # Collapsible derivation wrapper
├── pages/
│   ├── Week11Page.jsx         # Fully implemented
│   ├── Week12Page.jsx         # Fully implemented
│   ├── Week13Page.jsx         # Fully implemented
│   ├── Week14Page.jsx         # Fully implemented
│   └── Week15Page.jsx         # Placeholder
├── modules/
│   ├── week11/
│   │   ├── BernoulliMLE.jsx
│   │   ├── PoissonMLE.jsx
│   │   ├── BetaExplorer.jsx
│   │   └── DirichletExplorer.jsx
│   ├── week12/
│   │   ├── CIProportion.jsx
│   │   ├── CIWidthExplorer.jsx
│   │   ├── CIInterpretationSimulator.jsx
│   │   └── CredibleInterval.jsx
│   ├── week13/
│   │   ├── OneSampleMeanTest.jsx
│   │   ├── OneSampleProportionTest.jsx
│   │   ├── TwoSampleTest.jsx
│   │   └── PValueDrawbacks.jsx
│   └── week14/
│       ├── ProbabilityViaSimulation.jsx
│       ├── BloomFilter.jsx
│       └── MCMCVisualizer.jsx
└── utils/
    ├── mathUtils.js           # lnGamma, betaPDF, dirichletPDF, all math functions
    └── weekConfig.js          # Week metadata (titles, sub-CPMK, status)
```

**`weekConfig.js` structure:**

```javascript
export const WEEKS = [
  {
    number: 11,
    title: "Estimasi Parameter",
    subtitle: "MLE · Point Estimation · Beta & Dirichlet Distribution",
    subCPMK: "Mahasiswa mampu melakukan estimasi titik menggunakan MLE dan MAP",
    status: "available", // "available" | "placeholder"
  },
  {
    number: 12,
    title: "Confidence Interval",
    subtitle: "Z-Score · Frequentist CI · Credible Interval · Interpretasi",
    subCPMK:
      "Mahasiswa mampu membangun dan menginterpretasikan confidence interval",
    status: "available",
  },
  {
    number: 13,
    title: "Uji Hipotesis",
    subtitle: "Z-Test · Proporsi · A/B Test · P-Value Drawbacks",
    subCPMK:
      "Mahasiswa mampu merumuskan hipotesis nol dan alternatif dengan benar serta mampu melakukan uji hipotesis rata-rata dan menginterpretasikan p-value",
    status: "available",
  },
  {
    number: 14,
    title: "Aplikasi Komputasi",
    subtitle: "Simulasi · MCMC · Bloom Filters",
    subCPMK:
      "Mahasiswa mampu melakukan simulasi probabilitas menggunakan tools komputasi dan menerapkan MCMC serta Bloom Filters",
    status: "available",
  },
  {
    number: 15,
    title: "Review & Persiapan UAS",
    subtitle: "Rangkuman Minggu 9–14",
    subCPMK: "Ujian Akhir Semester",
    status: "placeholder",
  },
];
```

When a week is fully implemented, change its `status` to `"available"` — the sidebar badge and progress bar update automatically.

---

## 11. Out of Scope (v1.0)

- Method of Moments (MoM)
- MAP Estimation module
- User authentication or data persistence
- Export / download functionality
- Backend or API calls
- Animation between state transitions

---

## 12. Acceptance Criteria

### Navigation & Shell

| #     | Criterion                                                                                             |
| ----- | ----------------------------------------------------------------------------------------------------- |
| AC-N1 | App loads at `/` and immediately redirects to `/week/11`                                              |
| AC-N2 | Clicking any week in the sidebar navigates to its route and updates the active highlight              |
| AC-N3 | All five week routes render without crashing — including placeholder routes                           |
| AC-N4 | Weeks 11–14 sidebar items show a green "available" indicator; Week 15 shows amber "Segera Hadir" badge |
| AC-N5 | Progress bar shows "4 dari 5 minggu tersedia" (80%) on initial load                                    |
| AC-N6 | On mobile (< 768px), sidebar is hidden by default and accessible via hamburger menu                   |

### Week 11 Modules

| #        | Criterion                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------- |
| AC-11-1  | Toggling trials in Module 11.1 instantly updates θ̂, derivation (with real k and n), likelihood curve, and candidate table |
| AC-11-2  | Likelihood curve in Module 11.1 peaks exactly at θ = k/n                                                                  |
| AC-11-3  | Changing observations in Module 11.2 instantly updates θ̂, derivation, and log-likelihood curve                            |
| AC-11-4  | Log-likelihood curve in Module 11.2 peaks exactly at θ = Σxᵢ/n                                                            |
| AC-11-5  | Sliders in Module 11.3 instantly update α, β, mode, mean, and Beta PDF chart                                              |
| AC-11-6  | When k=0, m=0 in Module 11.3: flat uniform chart, mode = "—"                                                              |
| AC-11-7  | Four preset buttons in Module 11.3 produce correct Beta shapes per Tsun (2020, p. 269–270)                                |
| AC-11-8  | Beta PDF integrates to ≈ 1.0 across [0,1] (sum of Y × step ≈ 1.0)                                                         |
| AC-11-9  | All formulas render as KaTeX, not raw LaTeX strings                                                                       |
| AC-11-10 | Module 11.1 edge cases (k=0, k=n) display notices and do not crash                                                        |
| AC-11-11 | Module 11.2 edge case (Σxᵢ=0) displays notice and suppresses chart                                                        |
| AC-11-12 | Sliders in Module 11.4 instantly update αᵢ, modus, mean, and the three marginal Beta curves                               |
| AC-11-13 | When all kᵢ = 0 in Module 11.4: three flat uniform curves, modus shows "—", and the Dir(1,1,1) notice is visible          |
| AC-11-14 | Preset "Ulasan awal (600/250/150)" produces Dir(601, 251, 151) with means ≈ 0.600 / 0.250 / 0.150                         |
| AC-11-15 | Setting k₃ = 0 and varying k₁, k₂ produces marginals consistent with Beta(k₁+1, k₂+1) from Module 11.3                    |

### Placeholder Weeks

| #     | Criterion                                                                                                                                                     |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-P1 | Week 15 (the only remaining placeholder) renders the correct week header with matching title and Sub-CPMK from RPS                                            |
| AC-P2 | Week 15 renders 2 placeholder module cards — Weeks 12, 13, and 14 are now fully implemented (see §4, §5, §6)                                                  |
| AC-P3 | All formula previews in placeholder cards render correctly via KaTeX                                                                                          |
| AC-P4 | No placeholder card renders any interactive control (no inputs, sliders, or buttons other than the nav)                                                       |
| AC-P5 | Placeholder cards use dashed border and muted background, visually distinct from Week 11 module cards                                                         |

### General

| #     | Criterion                                                                                                                              |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------- |
| AC-G1 | App is usable on 768px-wide screen without horizontal scroll                                                                           |
| AC-G2 | No console errors on any route                                                                                                         |
| AC-G3 | Changing `status: "placeholder"` to `"available"` in `weekConfig.js` for any week automatically updates sidebar badge and progress bar |
