import { WeekHeader } from "../components/WeekHeader";
import { PlaceholderCard } from "../components/PlaceholderCard";
import { getWeek } from "../utils/weekConfig";

export function Week15Page() {
  const week = getWeek(15)!;
  const total = 2;
  return (
    <div className="space-y-6">
      <WeekHeader week={week} />
      <PlaceholderCard
        moduleNumber={1}
        totalModules={total}
        title="Modul 1 — Peta Konsep: Estimasi → Inferensi → Komputasi"
        description="Modul ini akan menampilkan peta konsep interaktif yang menghubungkan seluruh materi Minggu 11–14: dari MLE → Confidence Interval → Hypothesis Testing → Simulasi Komputasi, dengan tautan ke modul interaktif masing-masing minggu."
        plannedInteractions="Klik node untuk membuka modul terkait. Diagram interaktif dengan animasi transisi antar topik."
      />
      <PlaceholderCard
        moduleNumber={2}
        totalModules={total}
        title="Modul 2 — Bank Soal Latihan"
        description="Modul ini akan menyediakan soal latihan berbasis skenario nyata yang mencakup seluruh topik pasca-UTS (Minggu 9–14), dilengkapi jawaban dan langkah penyelesaian yang dapat dibuka/tutup."
        plannedInteractions="Mahasiswa menjawab soal pilihan ganda atau isian, kemudian membuka panel penyelesaian untuk membandingkan jawaban dengan kunci dan langkah lengkap."
      />
    </div>
  );
}
