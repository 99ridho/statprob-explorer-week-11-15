import { WeekHeader } from "../components/WeekHeader";
import { PlaceholderCard } from "../components/PlaceholderCard";
import { getWeek } from "../utils/weekConfig";

export function Week12Page() {
  const week = getWeek(12)!;
  const total = 3;
  return (
    <div className="space-y-6">
      <WeekHeader week={week} />
      <PlaceholderCard
        moduleNumber={1}
        totalModules={total}
        title="Modul 1 — Confidence Interval: Rata-rata Populasi (σ Diketahui)"
        description="Modul ini akan mendemonstrasikan pembangunan confidence interval untuk rata-rata populasi ketika simpangan baku (σ) diketahui, menggunakan distribusi Normal (Z)."
        formula={String.raw`\bar{x} \pm z_{\alpha/2} \cdot \frac{\sigma}{\sqrt{n}}`}
        plannedInteractions="Mahasiswa akan dapat mengatur n, x̄, σ, dan tingkat kepercayaan (90%, 95%, 99%), lalu melihat interval berubah secara live pada number line."
      />
      <PlaceholderCard
        moduleNumber={2}
        totalModules={total}
        title="Modul 2 — Confidence Interval: Rata-rata Populasi (σ Tidak Diketahui)"
        description="Modul ini akan mendemonstrasikan penggunaan distribusi-t (Student's t) ketika σ tidak diketahui dan n kecil."
        formula={String.raw`\bar{x} \pm t_{\alpha/2,\, n-1} \cdot \frac{s}{\sqrt{n}}`}
        plannedInteractions="Mahasiswa akan memasukkan data sampel mentah, lalu sistem menghitung s, df, dan CI secara otomatis."
      />
      <PlaceholderCard
        moduleNumber={3}
        totalModules={total}
        title="Modul 3 — Interpretasi: Apa Artinya '95% Confident'?"
        description="Modul ini akan mensimulasikan 100 sampel berbeda dari populasi yang sama, menggambar masing-masing confidence interval, dan menunjukkan berapa persen yang benar-benar mencakup parameter sesungguhnya."
        plannedInteractions="Simulasi interaktif: jalankan ulang sebanyak yang diinginkan untuk membangun intuisi tentang arti frekuentis dari confidence level."
      />
    </div>
  );
}
