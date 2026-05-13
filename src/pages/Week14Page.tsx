import { WeekHeader } from "../components/WeekHeader";
import { PlaceholderCard } from "../components/PlaceholderCard";
import { getWeek } from "../utils/weekConfig";

export function Week14Page() {
  const week = getWeek(14)!;
  const total = 3;
  return (
    <div className="space-y-6">
      <WeekHeader week={week} />
      <PlaceholderCard
        moduleNumber={1}
        totalModules={total}
        title="Modul 1 — Simulasi Probabilitas (Monte Carlo)"
        description="Modul ini akan mendemonstrasikan bagaimana simulasi komputasi dapat digunakan untuk memperkirakan probabilitas tanpa rumus analitik — misalnya, mengestimasi nilai π melalui simulasi titik acak."
        plannedInteractions="Mahasiswa memilih jumlah simulasi (10 hingga 10.000), melihat estimasi probabilitas konvergen ke nilai sesungguhnya secara live, beserta visualisasi scatter plot dan grafik konvergensi."
      />
      <PlaceholderCard
        moduleNumber={2}
        totalModules={total}
        title="Modul 2 — Markov Chain Monte Carlo (MCMC)"
        description="Modul ini akan memvisualisasikan bagaimana MCMC menjelajahi ruang probabilitas untuk mensampel dari distribusi target yang kompleks, menggunakan algoritma Metropolis-Hastings sederhana."
        formula={"\\pi(\\theta) \\propto e^{-\\theta^2/2}"}
        plannedInteractions="Step-by-step animasi chain berjalan: proposal → acceptance/rejection → trace plot. Mahasiswa dapat mengatur step size dan jumlah iterasi."
      />
      <PlaceholderCard
        moduleNumber={3}
        totalModules={total}
        title="Modul 3 — Bloom Filter"
        description="Modul ini akan mensimulasikan cara kerja Bloom Filter sebagai struktur data probabilistik untuk membership testing, termasuk konsep false positive rate."
        formula={"P(\\text{false positive}) \\approx \\left(1 - e^{-kn/m}\\right)^k"}
        plannedInteractions="Input: ukuran filter (m), jumlah hash functions (k), jumlah elemen (n). Output: visualisasi bit array, false positive rate, dan demo insert/query."
      />
    </div>
  );
}
