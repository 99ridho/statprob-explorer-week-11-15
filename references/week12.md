# Slide Draft — Minggu 12: Confidence Interval

**Mata Kuliah:** Statistika dan Probabilitas  
**Minggu ke:** 12  
**Dosen Pengampu:** Muhammad Ridho Kurniawan Pratama, S.Kom., M.T.I.

> **Sumber utama:** Alex Tsun, _Probability & Statistics with Applications to Computing_, 2020, Chapter 8 (Section 8.1 & 8.2)  
> Semua definisi dan contoh teoritis dalam slide ini bersumber langsung dari buku tersebut.  
> Kasus nyata bertanda `[KASUS NYATA]` adalah ilustrasi terapan untuk keperluan pengajaran.

---

## SLIDE 1 — JUDUL

**Statistika dan Probabilitas**

# Minggu 12: Confidence Interval

### _Membangun dan Menginterpretasikan Interval Kepercayaan_

**Dosen Pengampu:**  
Muhammad Ridho Kurniawan Pratama, S.Kom., M.T.I.

Program Studi Sistem dan Teknologi Informasi  
Fakultas Teknik — Universitas Negeri Jakarta  
2026

---

## SLIDE 2 — CPMK & Sub-CPMK

### Capaian Pembelajaran

|              |                                                                                      |
| ------------ | ------------------------------------------------------------------------------------ |
| **CPMK**     | Mahasiswa mampu mengestimasi parameter distribusi dan membangun interval kepercayaan |
| **Sub-CPMK** | Mahasiswa mampu membangun dan menginterpretasikan confidence interval                |

### Materi Minggu Ini

1. Motivasi: Mengapa Estimasi Titik Tidak Cukup?
2. Review: Standard Normal CDF & Z-Score
3. Membangun Confidence Interval
4. Interpretasi yang Benar vs Salah
5. Credible Interval (Pendekatan Bayesian)

### Posisi dalam Peta Konsep

```
Minggu 11: MLE & Estimasi Titik (θ̂ = satu angka)
        ↓
Minggu 12: Confidence Interval ← (kita di sini)
           (θ̂ ± ∆ = sebuah rentang)
        ↓
Minggu 13: Uji Hipotesis
```

---

## SLIDE 3 — PERTANYAAN PEMANTIK

### Sebelum Mulai, Pikirkan Ini:

> **❓ Pertanyaan 1**  
> Minggu lalu Anda menghitung bahwa _upload success rate_ NimbusStore adalah **62,5%** dari 8 percobaan. Seberapa yakin Anda dengan angka itu? Apakah 62,5% dari 8 data sama meyakinkannya dengan 62,5% dari 8.000 data?

> **❓ Pertanyaan 2**  
> Jika seorang dokter mengatakan "kadar gula darah normal Anda adalah 95 mg/dL", apakah lebih berguna mendengar angka itu saja — atau "kadar gula Anda berada di antara 90–100 mg/dL, yang masih dalam batas normal"? Apa perbedaan informasi yang Anda terima?

> **❓ Pertanyaan 3**  
> Anda melihat iklan: _"Survei menunjukkan 72% pengguna puas dengan layanan kami ± 3%."_ Angka ±3% itu dari mana? Apa yang sebenarnya dijamin oleh angka itu?

---

## SLIDE 4 — MASALAH DENGAN ESTIMASI TITIK

### Mengapa θ̂ Saja Tidak Cukup?

Pada Minggu 11, kita belajar bahwa MLE menghasilkan **satu nilai terbaik** θ̂. Tapi ada satu masalah mendasar:

> _"Even if our estimator had all the good properties, the probability that our estimator for θ is exactly correct is 0, since θ is continuous (a decimal number)!"_  
> — Tsun, 2020, hal. 297

Secara matematis:

$$P\left(\hat{\theta} = \theta\right) = 0$$

**Mengapa nol?** Karena θ adalah bilangan real kontinu — ada tak terhingga kemungkinan nilai. Probabilitas menebak tepat satu angka dari rangkaian kontinu = 0.

**Solusi:** Daripada satu angka, berikan **interval** di sekitar θ̂ sedemikian sehingga θ kemungkinan besar ada di dalamnya:

$$P\left(\theta \in \left[\hat{\theta} - \Delta,\, \hat{\theta} + \Delta\right]\right) = 0{,}95$$

---

### `[KASUS NYATA]` — Keterbatasan Angka Tunggal dalam Pengambilan Keputusan

**Skenario:** Tim produk NimbusStore mengukur rata-rata waktu respons API dari dua sampel berbeda:

| Tim   | Ukuran Sampel     | θ̂ (rata-rata respons) |
| ----- | ----------------- | --------------------- |
| Tim A | n = 5 request     | 230 ms                |
| Tim B | n = 5.000 request | 230 ms                |

**Pertanyaan:** Apakah kedua estimasi ini sama-sama dapat dipercaya?

**Jawaban:** Tidak — walaupun θ̂ identik, ketidakpastian estimasi Tim A jauh lebih besar. Confidence interval akan menunjukkan perbedaan ini secara eksplisit:

- Tim A (n=5): mungkin CI = [140 ms, 320 ms] — rentang sangat lebar, tidak bisa diandalkan
- Tim B (n=5000): mungkin CI = [226 ms, 234 ms] — rentang sempit, estimasi sangat terpercaya

**Pesan kunci:** Angka tunggal menyembunyikan ketidakpastian. Confidence interval mengungkapkannya.

---

## SLIDE 5 — FREQUENTIST vs BAYESIAN

### Dua Pendekatan untuk Interval Estimasi

Sebelum membahas rumus, penting memahami dua "dunia" berbeda:

|                              | **Frequentist**                                                                  | **Bayesian**                               |
| ---------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------ |
| **Apa itu θ?**               | Parameter tetap (fixed), tidak diketahui — bukan variabel acak                   | Parameter acak (random variable) Θ         |
| **Interval yang dihasilkan** | Confidence Interval                                                              | Credible Interval                          |
| **Interpretasi**             | 95% dari CI yang dibangun akan mengandung θ (bukan: 95% peluang θ ada di CI ini) | P(Θ ∈ [a,b]) = 95% — probabilitas langsung |
| **Dasar teori**              | Frekuensi jangka panjang (CLT)                                                   | Prior × Likelihood → Posterior             |
| **Minggu ini**               | ✅ Fokus utama (Bagian 8.1)                                                      | ✅ Dibahas singkat (Bagian 8.2)            |

> Sumber: Tsun, 2020, hal. 297

---

## SLIDE 6 — REVIEW: STANDARD NORMAL CDF

### Fondasi yang Dibutuhkan Sebelum Membangun CI

Jika $Z \sim N(0,1)$, kita notasikan CDF-nya sebagai:

$$\Phi(a) = F_Z(a) = P(Z \leq a)$$

**Sifat penting** (karena simetri Normal):

$$\Phi(a) = 1 - \Phi(-a)$$

**Untuk membangun interval 95%:** kita ingin daerah tengah seluas 95%, artinya masing-masing ekor memiliki 2,5%:

$$\Phi(1{,}96) = 0{,}975 \quad \Longleftrightarrow \quad \Phi^{-1}(0{,}975) = 1{,}96$$

**Tabel Z-score yang sering digunakan:**

| Confidence Level | α    | α/2   | $z_{1-\alpha/2}$ |
| ---------------- | ---- | ----- | ---------------- |
| 90%              | 0,10 | 0,05  | 1,645            |
| 95%              | 0,05 | 0,025 | **1,96**         |
| 98%              | 0,02 | 0,01  | 2,326            |
| 99%              | 0,01 | 0,005 | **2,576**        |

> Sumber: Tsun, 2020, hal. 298

---

### `[KASUS NYATA]` — Z-Score Hadir di Mana-mana

Nilai 1,96 dan 2,576 bukan angka ajaib — ini adalah titik pada kurva Normal standar yang sudah digunakan luas:

| Konteks                         | Z-score yang Digunakan | Artinya                        |
| ------------------------------- | ---------------------- | ------------------------------ |
| Survei politik / jajak pendapat | z = 1,96               | "Margin of error ±X% (95% CI)" |
| Pengujian obat klinis (FDA)     | z = 1,96 atau 2,576    | Standar persetujuan obat       |
| Pengujian A/B di tech company   | z = 1,96               | Significance level 95%         |
| Quality control manufaktur      | z = 3 (aturan 3-sigma) | Deteksi produk cacat           |
| SLA uptime (99,9% = 3 sigma)    | z = 3,09               | Standar industri layanan cloud |

**Insight:** Setiap kali Anda melihat "margin of error" dalam survei atau "significance level" dalam laporan riset — di baliknya ada tabel Φ⁻¹ ini.

---

## SLIDE 7 — MEMBANGUN CONFIDENCE INTERVAL

### Derivasi dari Contoh Buku: Poisson

**Contoh** _(Tsun, 2020, hal. 299)_:  
$x_1, \ldots, x_n$ iid dari Poi(θ), θ tidak diketahui. MLE: $\hat{\theta} = \bar{x}$. Bangun CI 95%.

**Langkah 1** — Distribusi estimator via CLT:

$$\hat{\theta} = \bar{x} \approx N\!\left(\theta,\, \frac{\theta}{n}\right)$$

**Langkah 2** — Standardisasi:

$$\frac{\hat{\theta} - \theta}{\sqrt{\theta/n}} \approx N(0,1)$$

**Langkah 3** — Cari ∆ sehingga $P(\theta \in [\hat{\theta}-\Delta, \hat{\theta}+\Delta]) = 0{,}95$:

$$\frac{\Delta}{\sqrt{\theta/n}} = \Phi^{-1}(0{,}975) = 1{,}96 \implies \Delta = 1{,}96\sqrt{\frac{\theta}{n}}$$

**Langkah 4** — Substitusi θ ≈ θ̂ (karena θ tidak diketahui):

$$CI_{95\%} = \left[\hat{\theta} - 1{,}96\sqrt{\frac{\hat{\theta}}{n}},\;\hat{\theta} + 1{,}96\sqrt{\frac{\hat{\theta}}{n}}\right]$$

> Sumber: Tsun, 2020, hal. 299

---

## SLIDE 8 — DEFINISI FORMAL CONFIDENCE INTERVAL

### Definition 8.1.1 _(Tsun, 2020, hal. 300)_

> Suppose you have iid samples $x_1, \ldots, x_n$ from some distribution with unknown parameter θ, and you have some estimator $\hat{\theta}$ for θ.
>
> A **100(1−α)% confidence interval** for θ is an interval (typically centered at $\hat{\theta}$), $[\hat{\theta}-\Delta, \hat{\theta}+\Delta]$, such that the probability (over the randomness in samples) θ lies in the interval is $1-\alpha$:

$$P\!\left(\theta \in \left[\hat{\theta} - \Delta,\, \hat{\theta} + \Delta\right]\right) = 1 - \alpha$$

**Rumus umum** (berlaku ketika $\hat{\theta}$ adalah sample mean, karena CLT):

$$\boxed{\left[\hat{\theta} - z_{1-\alpha/2}\,\frac{\sigma}{\sqrt{n}},\;\hat{\theta} + z_{1-\alpha/2}\,\frac{\sigma}{\sqrt{n}}\right]}$$

di mana $z_{1-\alpha/2} = \Phi^{-1}\!\left(1 - \tfrac{\alpha}{2}\right)$ dan σ adalah standar deviasi satu sampel (bisa diestimasi dari data jika tidak diketahui).

> ⚠️ _"It is important to note that this last formula ONLY works when $\hat{\theta}$ is the sample mean (otherwise we can't use the CLT)."_ — Tsun, 2020, hal. 300

---

## SLIDE 9 — CONTOH PENUH: CI UNTUK BERNOULLI

### Contoh dari Buku _(Tsun, 2020, hal. 300–301)_

**Soal:** Bangun CI 99% untuk θ (probabilitas sukses Bernoulli) dengan n = 400 sampel iid dan $\sum x_i = 136$.

**Langkah 1 — Estimasi MLE:**

$$\hat{\theta} = \frac{1}{n}\sum_{i=1}^n x_i = \frac{136}{400} = 0{,}34$$

**Langkah 2 — Tentukan α dan z:**

$$99\% = 100(1-\alpha)\% \implies \alpha = 0{,}01 \implies z_{1-\alpha/2} = z_{0{,}995} = \Phi^{-1}(0{,}995) \approx 2{,}576$$

**Langkah 3 — Estimasi σ:**

$$\sigma = \sqrt{\theta(1-\theta)} \approx \sqrt{\hat{\theta}(1-\hat{\theta})} = \sqrt{0{,}34 \times 0{,}66} \approx 0{,}474$$

**Langkah 4 — Hitung CI:**

$$\left[0{,}34 - 2{,}576 \cdot \frac{0{,}474}{\sqrt{400}},\; 0{,}34 + 2{,}576 \cdot \frac{0{,}474}{\sqrt{400}}\right] = [0{,}279,\; 0{,}401]$$

**Hasil:** CI 99% untuk θ adalah **[0,279; 0,401]**

---

### `[KASUS NYATA]` — CI untuk Upload Success Rate NimbusStore

**Konteks:** Sambung dari Minggu 11. Tim QA NimbusStore kini punya data lebih besar: dari **200 percobaan upload**, **154 berhasil**.

**Langkah 1 — MLE:**
$$\hat{\theta} = \frac{154}{200} = 0{,}77$$

**Langkah 2 — Pilih confidence level 95%:** $\alpha = 0{,}05$, $z_{0{,}975} = 1{,}96$

**Langkah 3 — Estimasi σ:**
$$\sigma \approx \sqrt{0{,}77 \times 0{,}23} = \sqrt{0{,}1771} \approx 0{,}421$$

**Langkah 4 — CI:**
$$\left[0{,}77 - 1{,}96 \cdot \frac{0{,}421}{\sqrt{200}},\; 0{,}77 + 1{,}96 \cdot \frac{0{,}421}{\sqrt{200}}\right] \approx [0{,}712,\; 0{,}828]$$

**Laporan ke manajer:** "Kami 95% yakin bahwa _upload success rate_ sesungguhnya berada di antara **71,2% hingga 82,8%**. Titik estimasi terbaik kami adalah 77%."

**Diskusi:** Apakah rentang [71,2%; 82,8%] cukup ketat untuk pengambilan keputusan SLA? Apa yang harus dilakukan jika ingin CI lebih sempit?

---

## SLIDE 10 — PENGARUH n DAN CONFIDENCE LEVEL

### Apa yang Mempengaruhi Lebar CI?

Dari rumus CI:

$$\text{Lebar CI} = 2 \times z_{1-\alpha/2} \cdot \frac{\sigma}{\sqrt{n}}$$

Ada dua variabel yang bisa dikendalikan:

**1. Ukuran sampel (n)**

| n     | Lebar CI (proporsi)                        | Interpretasi                    |
| ----- | ------------------------------------------ | ------------------------------- |
| 25    | $2 \times 1{,}96 \times \frac{\sigma}{5}$  | Lebar — perlu lebih banyak data |
| 100   | $2 \times 1{,}96 \times \frac{\sigma}{10}$ | Sedang                          |
| 400   | $2 \times 1{,}96 \times \frac{\sigma}{20}$ | Sempit                          |
| 1.600 | $2 \times 1{,}96 \times \frac{\sigma}{40}$ | Sangat sempit                   |

→ **Untuk mempersempit CI menjadi setengahnya, n harus dikalikan 4.**

**2. Confidence level (1−α)**

| Level | $z_{1-\alpha/2}$ | Lebar CI (relatif) |
| ----- | ---------------- | ------------------ |
| 90%   | 1,645            | Sempit             |
| 95%   | 1,96             | Sedang             |
| 99%   | 2,576            | **Lebar**          |

→ Semakin tinggi confidence level, semakin lebar intervalnya — **ada trade-off** antara keyakinan dan presisi.

---

### `[KASUS NYATA]` — Trade-off CI dalam Pengujian A/B

**Skenario:** Tim produk sedang A/B testing fitur "Auto-Backup". Berapa sampel yang dibutuhkan agar CI 95% untuk _conversion rate_ tidak lebih lebar dari ±2%?

Dari rumus lebar CI:

$$\frac{1{,}96 \cdot \sigma}{\sqrt{n}} \leq 0{,}02$$

Jika diasumsikan $\sigma \approx 0{,}5$ (nilai konservatif maksimum untuk proporsi):

$$\sqrt{n} \geq \frac{1{,}96 \times 0{,}5}{0{,}02} = 49 \implies n \geq 2401$$

**Implikasi bisnis:** Tim membutuhkan setidaknya **2.401 pengguna per varian** sebelum hasil A/B test dapat dilaporkan dengan margin error ±2% pada confidence 95%. Ini yang menjelaskan mengapa perusahaan besar sering menunggu berminggu-minggu sebelum mengumumkan pemenang A/B test.

---

## SLIDE 11 — INTERPRETASI YANG BENAR VS SALAH

### Ini Adalah Jebakan Paling Umum

**Kembali ke contoh buku:** CI 99% untuk θ adalah **[0,279; 0,401]**

---

**❌ Interpretasi SALAH (sangat umum!):**

> "Ada probabilitas 99% bahwa θ berada di dalam interval [0,279; 0,401]."

**Mengapa salah?**  
Karena θ adalah **parameter tetap** (fixed) — bukan variabel acak. θ entah memang ada di dalam interval itu, atau tidak. Tidak ada sesuatu yang "probabilistik" tentang θ setelah data diamati.

---

**✅ Interpretasi BENAR:**

> _"If we repeat this process several times (getting n samples each time and constructing different confidence intervals), about 99% of the confidence intervals we construct will contain θ."_  
> — Tsun, 2020, hal. 301

Atau sebelum data dikumpulkan:

> "Ada probabilitas 99% (atas keacakan sampel) bahwa interval yang akan kita bangun nanti akan mengandung θ."

---

**Analoginya:** CI bukan tentang "di mana θ berada" — melainkan tentang "seberapa andal prosedur pengambilan sampel kita."

---

### `[KASUS NYATA]` — Miskonsepsi CI di Media dan Riset

Miskonsepsi ini sangat umum bahkan di kalangan profesional:

| Konteks          | Kalimat Salah yang Sering Muncul                                       | Koreksi                                                                                              |
| ---------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Laporan survei   | "Ada 95% kemungkinan tingkat kepuasan pelanggan adalah antara 68%–74%" | CI 95% berarti: 95% dari survei serupa akan menghasilkan interval yang mengandung nilai sesungguhnya |
| Laporan riset ML | "Model ini 95% yakin akurasinya antara 82%–88%"                        | Akurasi sesungguhnya adalah angka tetap, bukan variabel acak                                         |
| Dashboard bisnis | "Revenue Q3 diperkirakan Rp 4,2M ± Rp 0,3M dengan 95% confidence"      | Jika prosedur estimasi ini diulang berkali-kali, 95% hasilnya akan mengandung revenue sesungguhnya   |

**Implikasi:** Sebagai data analyst, memahami interpretasi CI yang benar adalah hal yang membedakan Anda dari yang sekadar "menjalankan rumus".

---

## SLIDE 12 — CREDIBLE INTERVAL (BAYESIAN)

### Alternatif: Ketika θ Diperlakukan sebagai Variabel Acak

Dalam pendekatan Bayesian, parameter Θ adalah **variabel acak** (bukan fixed). Maka kita bisa langsung bertanya: "Berapa probabilitas Θ ada di interval [a, b]?"

> **Definition 8.2.1** _(Tsun, 2020, hal. 304)_:  
> A **100(1−α)% credible interval** for Θ is an interval [a, b] such that:
>
> $$P(\Theta \in [a, b]) = 1 - \alpha$$
>
> Jika posterior Θ|x memiliki CDF $F_Y$, maka credible interval simetris adalah:
>
> $$\left[F_Y^{-1}\!\left(\frac{\alpha}{2}\right),\; F_Y^{-1}\!\left(1 - \frac{\alpha}{2}\right)\right]$$

---

### Contoh dari Buku _(Tsun, 2020, hal. 302–303)_

**Soal:** Bangun credible interval 80% untuk Θ ~ Ber(Θ), dengan n=12 sampel, 11 sukses, prior Θ ~ Beta(7, 3).

**Posterior** (dari Minggu 11, MAP):
$$\Theta | x \sim \text{Beta}(11+7,\; 1+3) = \text{Beta}(18, 4)$$

**Cari [a, b] sehingga P(Θ ∈ [a,b]) = 0,8:**

Area tersisa = 20%, dibagi rata → 10% di kiri, 10% di kanan:

$$a = F_{\text{Beta}(18,4)}^{-1}(0{,}1) \approx 0{,}7089, \quad b = F_{\text{Beta}(18,4)}^{-1}(0{,}9) \approx 0{,}9142$$

**Credible interval 80%:** [0,7089; 0,9142]

---

## SLIDE 13 — CI vs CREDIBLE INTERVAL: PERBANDINGAN LANGSUNG

### Dua Alat, Dua Filosofi

| Dimensi                | Confidence Interval (Frequentist)                                     | Credible Interval (Bayesian)                          |
| ---------------------- | --------------------------------------------------------------------- | ----------------------------------------------------- |
| **Apa itu θ?**         | Tetap, tidak diketahui                                                | Variabel acak Θ                                       |
| **Dasar**              | CLT → distribusi sampling                                             | Prior → posterior (Beta, Gamma, dll.)                 |
| **Rumus**              | $\hat{\theta} \pm z_{1-\alpha/2} \cdot \frac{\sigma}{\sqrt{n}}$       | $[F_Y^{-1}(\alpha/2),\; F_Y^{-1}(1-\alpha/2)]$        |
| **Interpretasi benar** | 95% dari interval yang dibangun dengan prosedur ini akan mengandung θ | P(Θ ∈ [a,b]) = 95% — pernyataan probabilitas langsung |
| **Butuh prior?**       | Tidak                                                                 | Ya — harus memilih distribusi prior                   |
| **Lebih intuitif?**    | Tidak (sering disalahartikan)                                         | Ya (lebih alami diinterpretasikan)                    |

**Kapan pakai mana?**

- **CI Frequentist:** ketika tidak ada informasi prior, atau ingin standar yang diakui luas (publikasi ilmiah, regulasi)
- **Credible Interval:** ketika ada pengetahuan domain sebelumnya (prior), atau interpretasi probabilistik langsung dibutuhkan

> Sumber: Tsun, 2020, hal. 297–304

---

### `[KASUS NYATA]` — CI vs Credible Interval dalam Pengembangan Produk

**Skenario:** NimbusStore ingin mengestimasi _retention rate_ fitur baru "Smart Sync".

**Pendekatan Frequentist (CI):**  
Dari 300 pengguna bulan pertama, 210 masih aktif setelah 30 hari.
$$\hat{\theta} = 0{,}70, \quad CI_{95\%} = \left[0{,}648,\; 0{,}752\right]$$
Interpretasi: "Prosedur ini, jika diulang, akan menghasilkan interval yang mengandung retention rate sesungguhnya 95% dari waktu."

**Pendekatan Bayesian (Credible Interval):**  
Tim produk punya data historis: fitur sebelumnya rata-rata punya retention 65–75%. Mereka encode ini sebagai prior Beta(14, 6).

Posterior: Beta(14+210, 6+90) = Beta(224, 96)

Credible interval 95%: ≈ [0,638; 0,745]

Interpretasi: "Ada probabilitas 95% bahwa retention rate sesungguhnya berada di antara 63,8% dan 74,5%."

**Keputusan bisnis:** Pendekatan Bayesian secara eksplisit memanfaatkan pengetahuan tim dari produk sebelumnya — menghasilkan interval yang lebih informatif dan lebih mudah dikomunikasikan ke stakeholder non-teknis.

---

## SLIDE 14 — RINGKASAN & PETA KONSEP

### Koneksi Seluruh Materi Hari Ini

```
Minggu 11: θ̂ = satu angka (MLE)
    → Tapi P(θ̂ = θ) = 0 untuk θ kontinu
        │
        ▼
CONFIDENCE INTERVAL: θ ∈ [θ̂ − Δ, θ̂ + Δ]

┌────────────────────────────────────────────────┐
│  Frequentist CI (θ tetap)                     │
│  • Gunakan CLT → θ̂ ≈ Normal                  │
│  • Rumus: θ̂ ± z_{1-α/2} · σ/√n              │
│  • Interpretasi: prosedur, bukan probabilitas  │
│    tentang θ itu sendiri                       │
└────────────────────────────────────────────────┘
            vs
┌────────────────────────────────────────────────┐
│  Credible Interval (Θ variabel acak)          │
│  • Gunakan posterior (Beta, Gamma, dll.)       │
│  • Rumus: [F⁻¹(α/2), F⁻¹(1−α/2)]            │
│  • Interpretasi: P(Θ ∈ [a,b]) = 1−α          │
│    → pernyataan probabilitas langsung          │
└────────────────────────────────────────────────┘
        │
        ▼
Minggu 13: Uji Hipotesis
"Apakah θ = nilai tertentu (H₀), atau tidak (H₁)?"
```

---

## SLIDE 15 — KESIMPULAN

### Yang Telah Kita Pelajari Hari Ini

✅ **Motivasi CI** — Estimasi titik θ̂ selalu salah secara tepat ($P(\hat{\theta} = \theta) = 0$); CI memberikan rentang dengan jaminan probabilistik  
_(Contoh nyata: CI waktu respons API Tim A vs Tim B yang sama θ̂-nya tapi beda kualitas estimasinya)_

✅ **Membangun CI** — Gunakan CLT → standardisasi → invers tabel Φ → $\hat{\theta} \pm z_{1-\alpha/2} \cdot \frac{\sigma}{\sqrt{n}}$  
_(Contoh nyata: CI 95% untuk upload success rate NimbusStore dari 200 sampel)_

✅ **Pengaruh n dan α** — CI semakin sempit jika n besar atau confidence level diturunkan; untuk mempersempit setengahnya butuh n dikali 4  
_(Contoh nyata: minimum n = 2.401 untuk margin error ±2% pada A/B test)_

✅ **Interpretasi benar** — CI 95% bukan "ada 95% probabilitas θ ada di sini", melainkan "95% dari prosedur serupa akan menghasilkan interval yang mengandung θ"  
_(Contoh nyata: miskonsepsi umum di laporan survei dan riset ML)_

✅ **Credible Interval** — Alternatif Bayesian di mana Θ adalah variabel acak; interpretasinya langsung sebagai pernyataan probabilitas $P(\Theta \in [a,b]) = 1-\alpha$  
_(Contoh nyata: estimasi retention rate dengan prior dari data historis produk)_

> Semua definisi bersumber dari: Tsun, _Probability & Statistics with Applications to Computing_, 2020, Chapter 8 (hal. 297–304)

---

## SLIDE 16 — REFLEKSI & KUIS

### Refleksi

**❓ Pertanyaan 1 (Konseptual)**  
Sebuah laporan riset menyatakan: _"Dengan CI 95%, akurasi model klasifikasi kami berada di antara 84,2% dan 87,8%."_  
Apakah pernyataan ini sudah diinterpretasikan dengan benar secara statistik? Jika tidak, tuliskan interpretasi yang tepat.

**❓ Pertanyaan 2 (Terapan — hitung)**  
Sebuah e-commerce mengamati 500 transaksi dan mendapati 45 di antaranya mengalami gagal bayar.

- Hitung $\hat{\theta}_{MLE}$ untuk _payment failure rate_
- Bangun CI 95% untuk θ
- Tunjukkan semua langkah: estimasi σ, cari $z_{1-\alpha/2}$, hitung batas bawah dan atas

**❓ Pertanyaan 3 (Kritis)**  
Manajer Anda ingin mempersempit CI dari ±5% menjadi ±1% tanpa mengubah confidence level 95%. Tanpa menghitung, jelaskan secara konseptual apa yang harus dilakukan dan mengapa itu mahal secara operasional. Kaitkan jawaban Anda dengan rumus lebar CI.

---

### Kasus Nyata yang Digunakan dalam Slide Ini

_(Semua adalah ilustrasi terapan — bukan data aktual perusahaan tertentu)_

| Slide | Kasus                                           | Domain                        |
| ----- | ----------------------------------------------- | ----------------------------- |
| 4     | CI waktu respons API Tim A vs Tim B             | SRE / Performance Engineering |
| 6     | Tabel Z-score di survei, FDA, A/B test, SLA     | Lintas domain                 |
| 9     | CI upload success rate NimbusStore (200 sampel) | Product Analytics             |
| 10    | Minimum n untuk A/B test margin ±2%             | Product Analytics             |
| 11    | Miskonsepsi CI di laporan survei dan model ML   | Data literacy                 |
| 13    | CI vs Credible Interval untuk retention rate    | Product / Bayesian ML         |
