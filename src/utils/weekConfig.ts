export type WeekStatus = "available" | "placeholder";

export interface WeekConfig {
  number: number;
  title: string;
  subtitle: string;
  subCPMK: string;
  status: WeekStatus;
}

export const WEEKS: WeekConfig[] = [
  {
    number: 11,
    title: "Estimasi Parameter",
    subtitle: "MLE · Point Estimation · Beta & Dirichlet Distribution",
    subCPMK: "Mahasiswa mampu melakukan estimasi titik menggunakan MLE dan MAP",
    status: "available",
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
];

export function getWeek(n: number): WeekConfig | undefined {
  return WEEKS.find((w) => w.number === n);
}
