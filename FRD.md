# Functional Requirements Document

## Statistika & Probabilitas — Interactive Learning App

**Mata Kuliah:** Statistika dan Probabilitas  
**Target pengguna:** Mahasiswa Program Studi Sistem dan Teknologi Informasi, Fakultas Teknik, Universitas Negeri Jakarta  
**Referensi materi:** Alex Tsun, _Probability & Statistics with Applications to Computing_, 2020  
**Dokumen ini ditujukan untuk:** Implementasi via Claude Code  
**Versi:** 2.0 — Multi-week navigation edition

---

## 1. Overview

A single-page web application (SPA) covering **Weeks 11–15** of the Statistika dan Probabilitas course. The app uses a **persistent week-based navigation sidebar** to switch between weekly content views. Each week renders its own set of interactive modules on the main content area — all computation runs client-side, no backend required.

The app is designed for **incremental development**: Week 11 is fully implemented, Weeks 12–15 ship as structured placeholders that are ready to be filled in subsequent development sessions.

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
│  MLE · Point Estimation · Beta Distribution          │
│  ─────────────────────────────────────────────────  │
│  Mahasiswa mampu melakukan estimasi titik            │
│  menggunakan MLE dan MAP.                            │
└─────────────────────────────────────────────────────┘
```

Fields per week:

| Week | Title                  | Subtitle (topics)                          | Sub-CPMK                                                                                                                                           |
| ---- | ---------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 11   | Estimasi Parameter     | MLE · Point Estimation · Beta Distribution | Mahasiswa mampu melakukan estimasi titik menggunakan MLE dan MAP                                                                                   |
| 12   | Confidence Interval    | Interval Kepercayaan · Interpretasi CI     | Mahasiswa mampu membangun dan menginterpretasikan confidence interval                                                                              |
| 13   | Uji Hipotesis          | H₀ & H₁ · Uji Rata-rata · P-Value          | Mahasiswa mampu merumuskan hipotesis nol dan alternatif dengan benar serta mampu melakukan uji hipotesis rata-rata dan menginterpretasikan p-value |
| 14   | Aplikasi Komputasi     | Simulasi · MCMC · Bloom Filters            | Mahasiswa mampu melakukan simulasi probabilitas menggunakan tools komputasi dan menerapkan MCMC serta Bloom Filters                                |
| 15   | Review & Persiapan UAS | Rangkuman Minggu 9–14                      | Ujian Akhir Semester                                                                                                                               |

---

## 3. Week 11 — Estimasi Parameter (FULLY IMPLEMENTED)

Week 11 renders three interactive modules sequentially in the main content area, each in its own card.

### Module structure per card:

1. Module title + number badge (e.g. "Modul 1 dari 3")
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

## 4. Week 12 — Confidence Interval (PLACEHOLDER)

**Source:** Tsun, 2020, Ch. 8; RPS Sub-CPMK: "Mahasiswa mampu membangun dan menginterpretasikan confidence interval"

**Topics per RPS:**

1. Confidence Interval
2. Interpretasi Interval Kepercayaan

### Placeholder view requirements

The Week 12 page must render the week header (§2.5) followed by **three placeholder module cards**, one per planned module:

#### Planned Module 12.1 — CI for Population Mean (σ known)

**Placeholder card content:**

- Title: "Modul 1 — Confidence Interval: Rata-rata Populasi (σ Diketahui)"
- Status badge: `[Segera Hadir]` in amber
- Description: "Modul ini akan mendemonstrasikan pembangunan confidence interval untuk rata-rata populasi ketika simpangan baku (σ) diketahui, menggunakan distribusi Normal (Z)."
- Planned formula preview (rendered in KaTeX, non-interactive):
  $$\bar{x} \pm z_{\alpha/2} \cdot \frac{\sigma}{\sqrt{n}}$$
- Planned interactions note: "Mahasiswa akan dapat mengatur n, x̄, σ, dan tingkat kepercayaan (90%, 95%, 99%), lalu melihat interval berubah secara live pada number line."

#### Planned Module 12.2 — CI for Population Mean (σ unknown, t-distribution)

**Placeholder card content:**

- Title: "Modul 2 — Confidence Interval: Rata-rata Populasi (σ Tidak Diketahui)"
- Status badge: `[Segera Hadir]` in amber
- Description: "Modul ini akan mendemonstrasikan penggunaan distribusi-t (Student's t) ketika σ tidak diketahui dan n kecil."
- Planned formula preview:
  $$\bar{x} \pm t_{\alpha/2,\, n-1} \cdot \frac{s}{\sqrt{n}}$$
- Planned interactions note: "Mahasiswa akan memasukkan data sampel mentah, lalu sistem menghitung s, df, dan CI secara otomatis."

#### Planned Module 12.3 — CI Interpretation Simulator

**Placeholder card content:**

- Title: "Modul 3 — Interpretasi: Apa Artinya '95% Confident'?"
- Status badge: `[Segera Hadir]` in amber
- Description: "Modul ini akan mensimulasikan 100 sampel berbeda dari populasi yang sama, menggambar masing-masing confidence interval, dan menunjukkan berapa persen yang benar-benar mencakup parameter sesungguhnya."
- Planned interactions note: "Simulasi interaktif: jalankan ulang sebanyak yang diinginkan untuk membangun intuisi tentang arti frekuentis dari confidence level."

---

## 5. Week 13 — Uji Hipotesis (PLACEHOLDER)

**Source:** Tsun, 2020, Ch. 8.3; RPS Sub-CPMK: "Mahasiswa mampu merumuskan hipotesis nol dan alternatif dengan benar serta mampu melakukan uji hipotesis rata-rata dan menginterpretasikan p-value"

**Topics per RPS:**

1. Uji hipotesis terhadap rata-rata populasi normal
2. Uji kesamaan rata-rata dari 2 populasi normal
3. Uji Hipotesis terhadap Rata-rata Populasi Normal
4. Drawback P-Value

### Placeholder view requirements

The Week 13 page must render the week header (§2.5) followed by **four placeholder module cards**:

#### Planned Module 13.1 — One-Sample Z-Test

**Placeholder card content:**

- Title: "Modul 1 — Uji Hipotesis Satu Sampel (Z-Test)"
- Status badge: `[Segera Hadir]` in amber
- Description: "Modul ini akan memandu mahasiswa merumuskan H₀ dan H₁, menghitung Z-statistic, dan menentukan apakah H₀ ditolak berdasarkan tingkat signifikansi (α)."
- Planned formula preview:
  $$Z = \frac{\bar{x} - \mu_0}{\sigma / \sqrt{n}}$$
- Planned interactions note: "Input: μ₀, x̄, σ, n, α. Output: Z-statistic, p-value, keputusan tolak/gagal tolak H₀, visualisasi distribusi Normal dengan rejection region diarsir."

#### Planned Module 13.2 — Two-Sample Z-Test

**Placeholder card content:**

- Title: "Modul 2 — Uji Kesamaan Dua Rata-rata"
- Status badge: `[Segera Hadir]` in amber
- Description: "Modul ini akan mendemonstrasikan pengujian apakah dua populasi memiliki rata-rata yang sama."
- Planned formula preview:
  $$Z = \frac{\bar{x}_1 - \bar{x}_2}{\sqrt{\dfrac{\sigma_1^2}{n_1} + \dfrac{\sigma_2^2}{n_2}}}$$
- Planned interactions note: "Konteks: membandingkan performa dua versi API atau dua kelompok pengguna. Input dua set parameter, lihat keputusan uji secara live."

#### Planned Module 13.3 — P-Value Visualizer

**Placeholder card content:**

- Title: "Modul 3 — Visualisasi P-Value"
- Status badge: `[Segera Hadir]` in amber
- Description: "Modul ini akan menunjukkan secara visual apa yang diwakili oleh p-value pada kurva distribusi Normal."
- Planned interactions note: "Mahasiswa menggeser nilai Z-statistic dan melihat area p-value berubah secara real-time pada grafik. Membangun intuisi tentang hubungan antara Z, p-value, dan keputusan hipotesis."

#### Planned Module 13.4 — Drawback of P-Value

**Placeholder card content:**

- Title: "Modul 4 — Kelemahan P-Value"
- Status badge: `[Segera Hadir]` in amber
- Description: "Modul ini akan mendemonstrasikan mengapa p-value sering disalahartikan, termasuk hubungannya dengan ukuran sampel dan effect size."
- Planned interactions note: "Simulasi: tunjukkan bahwa n yang sangat besar selalu menghasilkan p < 0.05 meskipun perbedaan tidak bermakna secara praktis."

---

## 6. Week 14 — Aplikasi Statistika pada Komputasi (PLACEHOLDER)

**Source:** Tsun, 2020, Ch. 9; RPS Sub-CPMK: "Mahasiswa mampu melakukan simulasi probabilitas menggunakan tools komputasi dan menerapkan MCMC serta Bloom Filters"

**Topics per RPS:**

1. Probability via Simulation
2. Markov Chain Monte Carlo (MCMC)
3. Bloom Filters

### Placeholder view requirements

The Week 14 page must render the week header (§2.5) followed by **three placeholder module cards**:

#### Planned Module 14.1 — Probability via Simulation

**Placeholder card content:**

- Title: "Modul 1 — Simulasi Probabilitas (Monte Carlo)"
- Status badge: `[Segera Hadir]` in amber
- Description: "Modul ini akan mendemonstrasikan bagaimana simulasi komputasi dapat digunakan untuk memperkirakan probabilitas tanpa rumus analitik — misalnya, mengestimasi nilai π melalui simulasi titik acak."
- Planned interactions note: "Mahasiswa memilih jumlah simulasi (10 hingga 10.000), melihat estimasi probabilitas konvergen ke nilai sesungguhnya secara live, beserta visualisasi scatter plot dan grafik konvergensi."

#### Planned Module 14.2 — MCMC Visualizer

**Placeholder card content:**

- Title: "Modul 2 — Markov Chain Monte Carlo (MCMC)"
- Status badge: `[Segera Hadir]` in amber
- Description: "Modul ini akan memvisualisasikan bagaimana MCMC menjelajahi ruang probabilitas untuk mensampel dari distribusi target yang kompleks, menggunakan algoritma Metropolis-Hastings sederhana."
- Planned formula preview (target distribution example):
  $$\pi(\theta) \propto e^{-\theta^2/2}$$
- Planned interactions note: "Step-by-step animasi chain berjalan: proposal → acceptance/rejection → trace plot. Mahasiswa dapat mengatur step size dan jumlah iterasi."

#### Planned Module 14.3 — Bloom Filter Simulator

**Placeholder card content:**

- Title: "Modul 3 — Bloom Filter"
- Status badge: `[Segera Hadir]` in amber
- Description: "Modul ini akan mensimulasikan cara kerja Bloom Filter sebagai struktur data probabilistik untuk membership testing, termasuk konsep false positive rate."
- Planned formula preview (false positive rate):
  $$P(\text{false positive}) \approx \left(1 - e^{-kn/m}\right)^k$$
- Planned interactions note: "Input: ukuran filter (m), jumlah hash functions (k), jumlah elemen (n). Output: visualisasi bit array, false positive rate, dan demo insert/query."

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

| Formula          | Correct implementation                                                | Do NOT use                      |
| ---------------- | --------------------------------------------------------------------- | ------------------------------- |
| Bernoulli MLE    | `k / n`                                                               | Any iterative optimizer         |
| Bernoulli L(θ)   | `Math.pow(theta, k) * Math.pow(1 - theta, n - k)`                     | Approximations                  |
| Poisson log-L(θ) | `-n * theta + sumX * Math.log(theta)`                                 | Raw likelihood (underflow risk) |
| Poisson MLE      | `sumX / n`                                                            | Any iterative optimizer         |
| Beta PDF         | `betaPDF(x, alpha, beta)` via Lanczos log-gamma (see §3, Module 11.3) | Any non-normalized form         |
| Beta α           | `k + 1`                                                               | `k` ← off-by-one error          |
| Beta β           | `m + 1`                                                               | `m` ← off-by-one error          |
| Beta Mode        | `(alpha - 1) / (alpha + beta - 2)` = `k / (k + m)`                    | Mean or median                  |
| Beta Mean        | `alpha / (alpha + beta)` = `(k+1) / (k+m+2)`                          | Mode                            |

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
│   ├── Week12Page.jsx         # Placeholder
│   ├── Week13Page.jsx         # Placeholder
│   ├── Week14Page.jsx         # Placeholder
│   └── Week15Page.jsx         # Placeholder
├── modules/
│   ├── week11/
│   │   ├── BernoulliMLE.jsx
│   │   ├── PoissonMLE.jsx
│   │   └── BetaExplorer.jsx
│   └── (week12/, week13/, etc. added in future sessions)
└── utils/
    ├── mathUtils.js           # lnGamma, betaPDF, all math functions
    └── weekConfig.js          # Week metadata (titles, sub-CPMK, status)
```

**`weekConfig.js` structure:**

```javascript
export const WEEKS = [
  {
    number: 11,
    title: "Estimasi Parameter",
    subtitle: "MLE · Point Estimation · Beta Distribution",
    subCPMK: "Mahasiswa mampu melakukan estimasi titik menggunakan MLE dan MAP",
    status: "available", // "available" | "placeholder"
  },
  {
    number: 12,
    title: "Confidence Interval",
    subtitle: "Interval Kepercayaan · Interpretasi CI",
    subCPMK:
      "Mahasiswa mampu membangun dan menginterpretasikan confidence interval",
    status: "placeholder",
  },
  {
    number: 13,
    title: "Uji Hipotesis",
    subtitle: "H₀ & H₁ · Uji Rata-rata · P-Value",
    subCPMK:
      "Mahasiswa mampu merumuskan hipotesis nol dan alternatif dengan benar serta mampu melakukan uji hipotesis rata-rata dan menginterpretasikan p-value",
    status: "placeholder",
  },
  {
    number: 14,
    title: "Aplikasi Komputasi",
    subtitle: "Simulasi · MCMC · Bloom Filters",
    subCPMK:
      "Mahasiswa mampu melakukan simulasi probabilitas menggunakan tools komputasi dan menerapkan MCMC serta Bloom Filters",
    status: "placeholder",
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
- Dirichlet Distribution visualization
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
| AC-N4 | Week 11 sidebar item shows a green "available" indicator; Weeks 12–15 show amber "Segera Hadir" badge |
| AC-N5 | Progress bar shows "1 dari 5 minggu tersedia" on initial load                                         |
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

### Placeholder Weeks

| #     | Criterion                                                                                                                     |
| ----- | ----------------------------------------------------------------------------------------------------------------------------- |
| AC-P1 | Each placeholder week (12–15) renders the correct week header with matching title and Sub-CPMK from RPS                       |
| AC-P2 | Each placeholder week renders the correct number of placeholder module cards (Week 12: 3, Week 13: 4, Week 14: 3, Week 15: 2) |
| AC-P3 | All formula previews in placeholder cards render correctly via KaTeX                                                          |
| AC-P4 | No placeholder card renders any interactive control (no inputs, sliders, or buttons other than the nav)                       |
| AC-P5 | Placeholder cards use dashed border and muted background, visually distinct from Week 11 module cards                         |

### General

| #     | Criterion                                                                                                                              |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------- |
| AC-G1 | App is usable on 768px-wide screen without horizontal scroll                                                                           |
| AC-G2 | No console errors on any route                                                                                                         |
| AC-G3 | Changing `status: "placeholder"` to `"available"` in `weekConfig.js` for any week automatically updates sidebar badge and progress bar |
