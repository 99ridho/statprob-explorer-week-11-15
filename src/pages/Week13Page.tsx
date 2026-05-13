import { WeekHeader } from "../components/WeekHeader";
import { PlaceholderCard } from "../components/PlaceholderCard";
import { getWeek } from "../utils/weekConfig";

export function Week13Page() {
  const week = getWeek(13)!;
  const total = 4;
  return (
    <div className="space-y-6">
      <WeekHeader week={week} />
      <PlaceholderCard
        moduleNumber={1}
        totalModules={total}
        title="Modul 1 — Uji Hipotesis Satu Sampel (Z-Test)"
        description="Modul ini akan memandu mahasiswa merumuskan H₀ dan H₁, menghitung Z-statistic, dan menentukan apakah H₀ ditolak berdasarkan tingkat signifikansi (α)."
        formula={String.raw`Z = \frac{\bar{x} - \mu_0}{\sigma / \sqrt{n}}`}
        plannedInteractions="Input: μ₀, x̄, σ, n, α. Output: Z-statistic, p-value, keputusan tolak/gagal tolak H₀, visualisasi distribusi Normal dengan rejection region diarsir."
      />
      <PlaceholderCard
        moduleNumber={2}
        totalModules={total}
        title="Modul 2 — Uji Kesamaan Dua Rata-rata"
        description="Modul ini akan mendemonstrasikan pengujian apakah dua populasi memiliki rata-rata yang sama."
        formula={String.raw`Z = \frac{\bar{x}_1 - \bar{x}_2}{\sqrt{\dfrac{\sigma_1^2}{n_1} + \dfrac{\sigma_2^2}{n_2}}}`}
        plannedInteractions="Konteks: membandingkan performa dua versi API atau dua kelompok pengguna. Input dua set parameter, lihat keputusan uji secara live."
      />
      <PlaceholderCard
        moduleNumber={3}
        totalModules={total}
        title="Modul 3 — Visualisasi P-Value"
        description="Modul ini akan menunjukkan secara visual apa yang diwakili oleh p-value pada kurva distribusi Normal."
        plannedInteractions="Mahasiswa menggeser nilai Z-statistic dan melihat area p-value berubah secara real-time pada grafik. Membangun intuisi tentang hubungan antara Z, p-value, dan keputusan hipotesis."
      />
      <PlaceholderCard
        moduleNumber={4}
        totalModules={total}
        title="Modul 4 — Kelemahan P-Value"
        description="Modul ini akan mendemonstrasikan mengapa p-value sering disalahartikan, termasuk hubungannya dengan ukuran sampel dan effect size."
        plannedInteractions="Simulasi: tunjukkan bahwa n yang sangat besar selalu menghasilkan p < 0.05 meskipun perbedaan tidak bermakna secara praktis."
      />
    </div>
  );
}
