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
    subCPMK:
      "Mahasiswa mampu melakukan estimasi titik menggunakan MLE dan MAP",
    status: "available",
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

export function getWeek(n: number): WeekConfig | undefined {
  return WEEKS.find((w) => w.number === n);
}
