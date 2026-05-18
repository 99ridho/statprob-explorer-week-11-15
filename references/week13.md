# Slide Draft — Minggu 13: Uji Hipotesis

**Mata Kuliah:** Statistika dan Probabilitas  
**Minggu ke:** 13  
**Dosen Pengampu:** Muhammad Ridho Kurniawan Pratama, S.Kom., M.T.I.

> **Sumber utama:** Alex Tsun, _Probability & Statistics with Applications to Computing_, 2020, Chapter 8, Section 8.3 (hal. 305–310)  
> Semua definisi, contoh, dan prosedur dalam slide ini bersumber langsung dari buku tersebut.  
> Kasus nyata bertanda `[KASUS NYATA]` adalah ilustrasi terapan untuk keperluan pengajaran.

---

## SLIDE 1 — JUDUL

**Statistika dan Probabilitas**

# Minggu 13: Uji Hipotesis

### _Hypothesis Testing: H₀, Hₐ, P-Value, dan Keputusan Statistik_

**Dosen Pengampu:**  
Muhammad Ridho Kurniawan Pratama, S.Kom., M.T.I.

Program Studi Sistem dan Teknologi Informasi  
Fakultas Teknik — Universitas Negeri Jakarta  
2026

---

## SLIDE 2 — CPMK & Sub-CPMK

### Capaian Pembelajaran

|              |                                                                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CPMK**     | Mahasiswa mampu melakukan uji hipotesis dan menarik kesimpulan yang tepat                                                                          |
| **Sub-CPMK** | Mahasiswa mampu merumuskan hipotesis nol dan alternatif dengan benar serta mampu melakukan uji hipotesis rata-rata dan menginterpretasikan p-value |

### Materi Minggu Ini

1. Ide Dasar Uji Hipotesis — _Probabilistic Proof by Contradiction_
2. Merumuskan H₀ dan Hₐ — satu sisi vs dua sisi
3. Prosedur 6 Langkah Uji Hipotesis
4. Menghitung dan Menginterpretasikan P-Value
5. Uji Hipotesis Dua Populasi
6. Kelemahan P-Value (_Drawback_)

### Posisi dalam Peta Konsep

```
Minggu 11: MLE → θ̂ (estimasi titik)
Minggu 12: CI  → [θ̂ − Δ, θ̂ + Δ] (estimasi interval)
        ↓
Minggu 13: Uji Hipotesis ← (kita di sini)
           "Apakah klaim tentang θ didukung data?"
        ↓
Minggu 14: Aplikasi Komputasi (Simulasi, MCMC)
```

---

## SLIDE 3 — PERTANYAAN PEMANTIK

### Sebelum Mulai, Pikirkan Ini:

> **❓ Pertanyaan 1**  
> Tim Anda mengklaim bahwa fitur baru meningkatkan rata-rata waktu sesi pengguna dari 8 menit menjadi 9,5 menit. Dari 50 pengguna yang diuji, Anda mendapat rata-rata 9,3 menit. Apakah ini cukup bukti bahwa klaim tim benar — atau bisa saja ini hanya kebetulan dari sampel yang kecil?

> **❓ Pertanyaan 2**  
> Sebuah perusahaan antivirus mengklaim bahwa sistemnya mendeteksi 99% malware. Dari 200 file uji yang Anda berikan, sistem berhasil mendeteksi 194. Apakah ini cukup untuk membuktikan klaim mereka salah, atau masih dalam rentang variasi wajar?

> **❓ Pertanyaan 3**  
> Dalam sidang pengadilan, seseorang dianggap tidak bersalah sampai terbukti sebaliknya. Bagaimana prinsip ini mirip dengan cara kerja uji hipotesis dalam statistik?

---

## SLIDE 4 — IDE DASAR: BUKTI KONTRADIKSI PROBABILISTIK

### Cara Berpikir Uji Hipotesis

> _"Hypothesis testing allows us to 'statistically prove' claims... A lot of business decisions are reliant on this statistical method of hypothesis testing."_  
> — Tsun, 2020, hal. 305

**Analogi dari buku** _(Tsun, 2020, hal. 305)_:

> **Magician Mark** mengklaim koinnya adil (p = 0,5).  
> **Stacy si Statistisian Skeptis** melempar koin 100 kali → mendapat **99 kepala**.

"Jika koin memang adil, berapa peluang mendapat ≥99 kepala?"

$$P(X \geq 99) = \binom{100}{99}(0{,}5)^{99}(0{,}5)^1 + \binom{100}{100}(0{,}5)^{100} = \frac{101}{2^{100}} \approx 7{,}96 \times 10^{-29} \approx 0$$

Peluangnya hampir **nol**. Kesimpulan: asumsi "koin adil" hampir pasti salah.

**Logika inti:** Asumsikan klaim awal benar → hitung probabilitas mendapat data seperti yang kita amati → jika probabilitasnya sangat kecil, klaim awal kemungkinan besar salah.

_Ini adalah "Pembuktian Kontradiksi secara Probabilistik" (Probabilistic Proof by Contradiction)._

> Sumber: Tsun, 2020, hal. 305

---

### `[KASUS NYATA]` — Logika yang Sama dalam Pengujian Sistem

**Skenario:** Tim keamanan mengklaim sistem firewall baru memblokir 95% serangan. Dalam uji coba dengan 500 simulasi serangan, firewall berhasil memblokir 440 (88%).

Logika uji hipotesis:

1. **Asumsi awal (H₀):** Klaim benar — _block rate_ = 95%
2. **Pertanyaan:** Jika H₀ benar, seberapa mungkin kita mendapat hasil seburuk 88%?
3. **Jika peluang itu sangat kecil** (di bawah ambang yang kita tetapkan): kita punya alasan statistik untuk menolak H₀

**Tanpa uji hipotesis:** kita tidak bisa membedakan antara "klaim memang salah" vs "88% hanya variasi kebetulan dari sampel 500."

---

## SLIDE 5 — MERUMUSKAN H₀ DAN Hₐ

### Dua Hipotesis yang Selalu Berpasangan

|                       | **Null Hypothesis (H₀)**                                          | **Alternative Hypothesis (Hₐ)**                |
| --------------------- | ----------------------------------------------------------------- | ---------------------------------------------- |
| **Apa ini?**          | Klaim awal — _baseline_, "tidak ada efek", "benefit of the doubt" | Klaim yang ingin dibuktikan, kebalikan dari H₀ |
| **Kita asumsikan...** | H₀ benar — untuk keperluan perhitungan                            | Hₐ terbukti jika H₀ ditolak                    |
| **Posisi**            | Status quo / kondisi saat ini                                     | Klaim baru / perbedaan yang ingin dideteksi    |

> _"The null hypothesis is usually a 'baseline', 'no effect', or 'benefit of the doubt'. The alternative is what you want to 'prove', and is opposite the null."_  
> — Tsun, 2020, hal. 307

**Tiga bentuk Hₐ:**

| Jenis               | Bentuk Hₐ | Kapan digunakan                               |
| ------------------- | --------- | --------------------------------------------- |
| **Satu sisi kanan** | μ > μ₀    | Ingin membuktikan ada peningkatan             |
| **Satu sisi kiri**  | μ < μ₀    | Ingin membuktikan ada penurunan               |
| **Dua sisi**        | μ ≠ μ₀    | Ingin membuktikan ada perbedaan (arah apapun) |

---

### `[KASUS NYATA]` — Merumuskan H₀ dan Hₐ dalam Konteks Teknologi

| Klaim yang Diuji                          | H₀                          | Hₐ              | Jenis           |
| ----------------------------------------- | --------------------------- | --------------- | --------------- |
| "Fitur baru meningkatkan waktu sesi"      | μ = 8 menit (baseline lama) | μ > 8 menit     | Satu sisi kanan |
| "Deployment baru memperlambat API"        | μ = 120 ms (baseline)       | μ > 120 ms      | Satu sisi kanan |
| "Dua versi UI menghasilkan CTR berbeda"   | μ₁ = μ₂                     | μ₁ ≠ μ₂         | Dua sisi        |
| "Sistem deteksi malware sesuai klaim 95%" | p = 0,95                    | p < 0,95        | Satu sisi kiri  |
| "Update model tidak mengubah akurasi"     | μ_baru = μ_lama             | μ_baru ≠ μ_lama | Dua sisi        |

**Aturan praktis:** H₀ selalu menyertakan tanda "=". Hₐ tidak pernah mengandung "=".

---

## SLIDE 6 — PROSEDUR 6 LANGKAH UJI HIPOTESIS

### Kerangka Formal _(Tsun, 2020, hal. 307)_

> **Procedure 8.3.3: Hypothesis Testing**

```
Langkah 1: Buat klaim yang ingin diuji

Langkah 2: Rumuskan H₀ dan Hₐ
           - Hₐ bisa satu sisi atau dua sisi
           - H₀ adalah baseline / "benefit of the doubt"
           - Hₐ adalah yang ingin "dibuktikan"

Langkah 3: Pilih significance level α
           (biasanya α = 0,05 atau 0,01)

Langkah 4: Kumpulkan data

Langkah 5: Hitung p-value
           p = P(mengamati data seekstrem ini | H₀ benar)

Langkah 6: Nyatakan kesimpulan
           - Jika p < α → TOLAK H₀ (hasilnya "significant")
           - Jika p ≥ α → GAGAL MENOLAK H₀
           ⚠️ JANGAN pernah "menerima" H₀
```

**Catatan kritis:**  
_"We'll NEVER say we 'accept' the null hypothesis... it does NOT imply that p = 0.5. It could have been 0.54 or 0.58."_ — Tsun, 2020, hal. 307

---

## SLIDE 7 — APA ITU P-VALUE?

### Definisi dan Cara Menghitungnya

> **p-value** = $P(\text{mengamati data seekstrem ini} \mid H_0 \text{ benar})$

**Secara intuitif:** p-value mengukur "seberapa terkejut" kita seharusnya dengan data yang kita amati, _jika H₀ memang benar_.

- **p-value kecil** → data kita sangat tidak mungkin terjadi jika H₀ benar → H₀ patut diragukan
- **p-value besar** → data kita masuk akal terjadi walau H₀ benar → tidak cukup bukti menolak H₀

**Cara menghitung (untuk rata-rata):**

Karena estimator kita (sample mean) berdistribusi Normal via CLT:

$$\bar{X} \approx N\!\left(\mu_0,\, \frac{\sigma^2}{n}\right) \quad \text{(di bawah } H_0\text{)}$$

Standarisasi → hitung peluang di ekor distribusi:

$$p = P\!\left(Z \geq \frac{\bar{x} - \mu_0}{\sigma/\sqrt{n}}\right) \quad \text{(untuk } H_a: \mu > \mu_0\text{)}$$

---

### `[KASUS NYATA]` — Intuisi P-Value dalam Sehari-hari

Bayangkan Anda melempar dadu 60 kali dan mendapat angka 6 sebanyak 20 kali (rata-rata = 1/3, padahal harusnya 1/6 jika adil).

- H₀: dadu adil (p₆ = 1/6)
- p-value = P(mendapat ≥20 angka 6 dari 60 lemparan | dadu adil)

Jika p-value sangat kecil: "Jika dadu memang adil, kejadian ini hampir mustahil → dadu kemungkinan tidak adil."

**Analogi di dunia data:** Ini persis cara yang digunakan platform streaming untuk mendeteksi anomali — jika jumlah login dari satu akun jauh di atas rata-rata normal, p-value dihitung untuk memutuskan apakah ini anomali atau hanya fluktuasi biasa.

---

## SLIDE 8 — CONTOH PENUH: UJI SATU SAMPEL

### Contoh dari Buku: SuperSAT Prep _(Tsun, 2020, hal. 306–307)_

**Klaim:** Program SuperSAT Prep membantu siswa meraih skor SAT lebih tinggi dari rata-rata nasional (μ₀ = 1059, σ = 210).

**Langkah 1** — Klaim: SuperSAT Prep meningkatkan skor SAT.

**Langkah 2** — Hipotesis:
$$H_0: \mu = 1059 \qquad H_a: \mu > 1059 \quad \text{(satu sisi kanan)}$$

**Langkah 3** — Pilih α = 0,05

**Langkah 4** — Data: n = 100 siswa, $\bar{x}$ = 1113

**Langkah 5** — Hitung p-value via CLT:

$$\bar{X} \approx N\!\left(1059,\, \frac{210^2}{100}\right) \implies Z = \frac{1113 - 1059}{210/\sqrt{100}} = \frac{54}{21} \approx 2{,}14$$

$$p = P(Z \geq 2{,}14) \approx 0{,}0162$$

**Langkah 6** — Kesimpulan:

| Jika α = 0,05 | p = 0,0162 < 0,05 | **Tolak H₀** ✅         |
| ------------- | ----------------- | ----------------------- |
| Jika α = 0,01 | p = 0,0162 > 0,01 | **Gagal menolak H₀** ❌ |

_"Ada bukti statistik kuat bahwa SuperSAT Prep benar-benar membantu siswa mendapat skor lebih tinggi."_ — pada α = 0,05.

> Sumber: Tsun, 2020, hal. 306–307

---

### `[KASUS NYATA]` — Uji Satu Sampel: Apakah Model Baru Lebih Cepat?

**Skenario:** Tim MLOps mengklaim model inferensi baru lebih cepat dari baseline lama (μ₀ = 120 ms). Dari 64 pengujian, rata-rata waktu model baru adalah $\bar{x}$ = 113 ms, dengan σ diketahui = 24 ms.

**Langkah 2:** $H_0: \mu = 120$ ms, $H_a: \mu < 120$ ms (satu sisi kiri — ingin tunjukkan lebih cepat)

**Langkah 3:** α = 0,05

**Langkah 5 — Z-statistic:**

$$Z = \frac{113 - 120}{24/\sqrt{64}} = \frac{-7}{3} \approx -2{,}33$$

Untuk H_a satu sisi kiri: $p = P(Z \leq -2{,}33) \approx 0{,}0099$

**Langkah 6:** p = 0,0099 < 0,05 → **Tolak H₀**

**Laporan tim:** "Ada bukti statistik yang signifikan (p < 0,05) bahwa model baru lebih cepat dari baseline 120 ms."

---

## SLIDE 9 — CONTOH KEDUA: UJI PROPORSI BERNOULLI

### Contoh dari Buku: Pemilihan George Washington _(Tsun, 2020, hal. 308)_

**Klaim:** Lebih dari 75% warga Amerika akan memilih George Washington untuk Presiden 2020.  
**Data:** n = 137 responden, 131 menjawab "ya".

**Langkah 2:**
$$H_0: p = 0{,}75 \qquad H_a: p > 0{,}75 \quad \text{(satu sisi kanan)}$$

**Langkah 3:** α = 0,01

**Langkah 5 — Via CLT** (karena $X_i \sim \text{Ber}(p)$, maka $\text{Var}(X_i) = p(1-p)$):

$$\bar{X} \approx N\!\left(0{,}75,\, \frac{0{,}75(1-0{,}75)}{137}\right) = N(0{,}75,\, \sigma^2 = 0{,}037^2)$$

$$Z = \frac{131/137 - 0{,}75}{0{,}037} = \frac{0{,}956 - 0{,}75}{0{,}037} \approx 5{,}43$$

$$p = P(Z \geq 5{,}43) \approx 0 \quad \text{(sangat kecil)}$$

**Langkah 6:** p ≈ 0 < 0,01 = α → **Tolak H₀**. Ada bukti kuat bahwa lebih dari 75% warga akan memilih Washington.

> Sumber: Tsun, 2020, hal. 308

---

### `[KASUS NYATA]` — Uji Proporsi: Apakah Detection Rate Sesuai Klaim?

**Skenario:** Vendor antivirus mengklaim _detection rate_ 95%. Tim security internal menguji dengan 200 file malware, 188 berhasil dideteksi.

**Langkah 2:**
$$H_0: p = 0{,}95 \qquad H_a: p < 0{,}95 \quad \text{(satu sisi kiri)}$$

**Langkah 3:** α = 0,05

**Langkah 5:**
$$\bar{X} = \frac{188}{200} = 0{,}94 \qquad \sigma = \sqrt{\frac{0{,}95(0{,}05)}{200}} \approx 0{,}0154$$

$$Z = \frac{0{,}94 - 0{,}95}{0{,}0154} \approx -0{,}65$$

$$p = P(Z \leq -0{,}65) \approx 0{,}258$$

**Langkah 6:** p = 0,258 > 0,05 → **Gagal menolak H₀**

**Interpretasi:** Meskipun 94% < 95%, perbedaan ini **tidak signifikan secara statistik** dari n = 200. Kita tidak punya cukup bukti untuk menyatakan vendor berbohong — bisa jadi hanya variasi sampling biasa. Butuh sampel lebih besar untuk deteksi lebih kuat.

---

## SLIDE 10 — UJI HIPOTESIS DUA POPULASI

### Membandingkan Dua Kelompok

Sering kita ingin menguji apakah **dua populasi berbeda** — bukan membandingkan satu populasi ke nilai tetap.

**Rumusan umum:**
$$H_0: \mu_1 = \mu_2 \qquad H_a: \mu_1 \neq \mu_2 \text{ (atau } > \text{ atau } <\text{)}$$

**Z-statistic untuk perbedaan dua rata-rata** (σ₁, σ₂ diketahui):

$$Z = \frac{\bar{x}_1 - \bar{x}_2}{\sqrt{\dfrac{\sigma_1^2}{n_1} + \dfrac{\sigma_2^2}{n_2}}}$$

**Intuisi:** Kita standarisasi _perbedaan_ antara dua sample mean. Jika |Z| besar → perbedaan yang kita amati tidak mungkin terjadi secara kebetulan → ada perbedaan nyata antara dua populasi.

**Catatan dari Tsun:** Untuk kasus σ tidak diketahui atau statistik non-mean, digunakan teknik _bootstrapping_ — yaitu menghitung p-value via simulasi, bukan formula analitik. _(Lihat Tsun, 2020, Bab 9.7 untuk detailnya.)_

> Sumber: Tsun, 2020, hal. 309 & 9.7

---

### `[KASUS NYATA]` — Uji Dua Populasi: A/B Test Versi UI

**Skenario:** NimbusStore menguji dua versi halaman upload:

- **Versi A (lama):** 80 pengguna, rata-rata durasi upload = 4,2 detik, σ₁ = 1,0 s
- **Versi B (baru):** 80 pengguna, rata-rata durasi upload = 3,8 detik, σ₂ = 0,9 s

**Langkah 2:**
$$H_0: \mu_A = \mu_B \qquad H_a: \mu_A \neq \mu_B \quad \text{(dua sisi)}$$

**Langkah 3:** α = 0,05

**Langkah 5:**

$$Z = \frac{4{,}2 - 3{,}8}{\sqrt{\dfrac{1{,}0^2}{80} + \dfrac{0{,}9^2}{80}}} = \frac{0{,}4}{\sqrt{0{,}0125 + 0{,}010125}} = \frac{0{,}4}{\sqrt{0{,}022625}} \approx \frac{0{,}4}{0{,}1504} \approx 2{,}66$$

Untuk uji dua sisi: $p = 2 \times P(Z \geq 2{,}66) \approx 2 \times 0{,}0039 = 0{,}0078$

**Langkah 6:** p = 0,0078 < 0,05 → **Tolak H₀**

**Laporan produk:** "Ada perbedaan yang signifikan secara statistik antara Versi A dan Versi B (p = 0,008 < 0,05). Versi B secara statistik terbukti lebih cepat."

---

## SLIDE 11 — INTERPRETASI KEPUTUSAN: JEBAKAN BAHASA

### Kosakata yang Harus Tepat

**✅ Tolak H₀** (p < α):

> "Ada bukti statistik yang cukup untuk menolak H₀. Kita simpulkan Hₐ lebih didukung oleh data."  
> Dalam konteks: "Ada bukti kuat bahwa SuperSAT Prep meningkatkan skor SAT."

**✅ Gagal Menolak H₀** (p ≥ α):

> "Tidak ada cukup bukti statistik untuk menolak H₀. Kita tidak bisa menyimpulkan Hₐ."  
> Dalam konteks: "Tidak ada cukup bukti bahwa detection rate vendor di bawah 95%."

---

**❌ Yang TIDAK BOLEH dikatakan:**

| Kalimat Salah                                         | Mengapa Salah                                                               | Koreksi                                                             |
| ----------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| "Kita menerima H₀"                                    | H₀ tidak pernah "terbukti benar" — hanya tidak cukup bukti untuk menolaknya | "Gagal menolak H₀"                                                  |
| "H₀ terbukti benar"                                   | Sama dengan di atas                                                         | "Data tidak memberi cukup bukti untuk menolak H₀"                   |
| "p = 0,03 berarti ada 97% probabilitas H₀ salah"      | p-value BUKAN probabilitas H₀ salah                                         | "Jika H₀ benar, probabilitas mendapat data seekstrem ini adalah 3%" |
| "Hasilnya tidak signifikan, jadi tidak ada perbedaan" | Gagal menolak ≠ tidak ada efek                                              | "Tidak cukup bukti untuk mendeteksi perbedaan dengan n ini"         |

> _"Note that we'll NEVER say we 'accept' the null hypothesis."_ — Tsun, 2020, hal. 307

---

### `[KASUS NYATA]` — Konsekuensi Salah Interpretasi

**Insiden nyata (ilustrasi):** Sebuah tim data melaporkan ke manajemen: _"Uji hipotesis menunjukkan p = 0,08 > 0,05, jadi fitur baru tidak berdampak, aman untuk dihapus."_

**Masalah:** "Gagal menolak H₀" ≠ "tidak ada dampak."  
Kemungkinannya: sampel terlalu kecil untuk mendeteksi efek yang sebenarnya ada (_underpowered test_).

**Yang seharusnya dilaporkan:** "Dengan n = 40, uji ini tidak memiliki cukup kekuatan statistik untuk mendeteksi perbedaan kecil. Disarankan menambah ukuran sampel sebelum mengambil keputusan penghapusan fitur."

---

## SLIDE 12 — KELEMAHAN P-VALUE (_DRAWBACK_)

### P-Value: Alat yang Kuat tapi Mudah Disalahgunakan

**Kelemahan 1: P-value tergantung n — bukan besarnya efek**

Dengan n yang sangat besar, bahkan **perbedaan yang tidak bermakna** bisa menghasilkan p < 0,05:

| Skenario | Perbedaan rata-rata | n       | Z    | p-value | Kesimpulan     |
| -------- | ------------------- | ------- | ---- | ------- | -------------- |
| A vs B   | 0,1 ms              | 100     | 0,47 | 0,32    | Gagal tolak H₀ |
| A vs B   | 0,1 ms              | 100.000 | 14,9 | ≈ 0     | **Tolak H₀**   |

Perbedaan 0,1 ms antara dua versi API tidak bermakna secara praktis — tapi dengan n = 100.000 akan selalu signifikan secara statistik.

**Kelemahan 2: P-value sering disalahartikan**

| Interpretasi                                                  | Benar? |
| ------------------------------------------------------------- | ------ |
| p = 0,03 → probabilitas H₀ salah = 97%                        | ❌     |
| p = 0,03 → jika H₀ benar, data ini hanya muncul 3% dari waktu | ✅     |
| p < 0,05 → efeknya penting secara praktis                     | ❌     |
| p < 0,05 → cukup bukti statistik untuk menolak H₀             | ✅     |

**Kelemahan 3: Threshold α = 0,05 bersifat arbitrer**  
Nilai 0,05 adalah konvensi — bukan hukum alam. Untuk keputusan dengan konsekuensi besar (uji klinis, kebijakan publik), α = 0,01 atau bahkan α = 0,001 lebih tepat.

---

### `[KASUS NYATA]` — P-Hacking: Bahaya Nyata dalam Riset Data

**Skenario:** Seorang analis menguji apakah fitur baru meningkatkan konversi. Setelah 2 minggu, p = 0,12 (tidak signifikan). Ia memutuskan untuk menunggu 1 minggu lagi → p = 0,049. Ia melaporkan hasilnya sebagai "signifikan."

**Masalah yang terjadi:** Ini disebut **_p-hacking_** atau _optional stopping_ — terus mengumpulkan data sampai p < 0,05 terjadi secara kebetulan. Dengan melakukan cukup banyak pengujian, Anda hampir pasti akan mendapat p < 0,05 suatu saat hanya karena kebetulan (_false positive_).

**Implikasi:** Ini adalah alasan mengapa:

- Jumlah sampel harus ditentukan **sebelum** eksperimen dimulai
- Batas waktu A/B test harus ditetapkan di awal, bukan berdasarkan kapan p < 0,05 tercapai
- Beberapa perusahaan teknologi besar beralih ke pendekatan Bayesian untuk menghindari masalah ini

---

## SLIDE 13 — RANGKUMAN: STATISTICAL vs PRACTICAL SIGNIFICANCE

### Dua Hal yang Berbeda

**Statistical significance** (signifikansi statistik):  
Apakah perbedaan yang kita amati **cukup besar untuk tidak bisa dijelaskan oleh kebetulan sampling semata**?  
→ Diukur oleh p-value dan α

**Practical significance** (signifikansi praktis):  
Apakah perbedaan yang kita amati **cukup besar untuk bermakna dalam konteks nyata**?  
→ Diukur oleh _effect size_ (seberapa besar perbedaannya)

**Hubungan keduanya:**

```
                    | Statistis Signifikan | Tidak Statistis Signifikan |
Praktis Signifikan  |  Ideal ✅            | Butuh lebih banyak data    |
Tidak Praktis Sign. |  Hati-hati ⚠️        | Tidak perlu ditindaklanjuti|
```

**Contoh:** Dua versi halaman checkout berbeda 0,01% dalam conversion rate. Dengan n = 10 juta, ini mungkin signifikan secara statistik (p < 0,05) — tapi 0,01% tidak bermakna secara bisnis.

**Pesan kunci:** Selalu tanyakan dua pertanyaan secara bersamaan: _Apakah hasilnya signifikan secara statistik?_ **DAN** _Apakah perbedaannya cukup besar untuk peduli?_

---

## SLIDE 14 — PETA KONSEP: TIGA MINGGU TERAKHIR

### Koneksi Minggu 11 → 12 → 13

```
DATA yang dikumpulkan (x₁, x₂, ..., xₙ)
            │
            ▼
  ┌─────────────────────────────────┐
  │  MINGGU 11: Estimasi Titik     │
  │  θ̂_MLE = k/n atau Σxᵢ/n       │
  │  "Satu angka terbaik dari data"│
  └─────────────────────────────────┘
            │
            ▼
  ┌─────────────────────────────────┐
  │  MINGGU 12: Confidence Interval│
  │  [θ̂ − z·σ/√n, θ̂ + z·σ/√n]   │
  │  "Rentang yang kemungkinan     │
  │   besar mengandung θ"          │
  └─────────────────────────────────┘
            │
            ▼
  ┌─────────────────────────────────┐
  │  MINGGU 13: Uji Hipotesis      │
  │  H₀: θ = θ₀ vs Hₐ: θ ≠ θ₀   │
  │  p-value → tolak/gagal tolak   │
  │  "Apakah klaim θ = θ₀         │
  │   didukung data?"              │
  └─────────────────────────────────┘
            │
            ▼
  MINGGU 14: Aplikasi Komputasi
  (Simulasi untuk menghitung p-value
   tanpa asumsi distribusi)
```

---

## SLIDE 15 — KESIMPULAN

### Yang Telah Kita Pelajari Hari Ini

✅ **Ide dasar uji hipotesis** — _Probabilistic proof by contradiction_: asumsikan H₀ benar, hitung seberapa mungkin data kita terjadi, jika sangat kecil → H₀ patut ditolak  
_(Contoh buku: Magician Mark dan 99 kepala dari 100 lemparan)_

✅ **Merumuskan H₀ dan Hₐ** — H₀ adalah baseline/no effect; Hₐ adalah klaim yang ingin dibuktikan; bisa satu sisi atau dua sisi  
_(Contoh nyata: tabel formulasi hipotesis untuk 5 skenario teknologi)_

✅ **Prosedur 6 langkah** — Klaim → H₀/Hₐ → α → Data → p-value → Kesimpulan  
_(Contoh buku: SuperSAT Prep — p = 0,0162 < 0,05 → tolak H₀)_

✅ **P-value** — P(data seekstrem ini | H₀ benar); bukan probabilitas H₀ salah; keputusan bergantung pada perbandingan p vs α  
_(Contoh nyata: deteksi malware — gagal tolak H₀ bukan berarti klaim vendor benar)_

✅ **Uji dua populasi** — Standarisasi perbedaan dua sample mean; digunakan dalam A/B testing  
_(Contoh nyata: A/B test UI NimbusStore — Versi B terbukti lebih cepat, p = 0,008)_

✅ **Kelemahan p-value** — Tergantung n bukan effect size; ambang 0,05 arbitrer; rentan p-hacking  
_(Contoh nyata: optional stopping dalam A/B test)_

> Semua prosedur dan definisi bersumber dari: Tsun, _Probability & Statistics with Applications to Computing_, 2020, Section 8.3 (hal. 305–310)

---

## SLIDE 16 — REFLEKSI & KUIS

### Refleksi

**❓ Pertanyaan 1 (Konseptual)**  
Seorang manajer produk berkata: _"P-value kita 0,04 — berarti ada 96% kemungkinan fitur kita benar-benar efektif!"_ Apakah pernyataan ini benar? Jika tidak, tuliskan interpretasi p-value yang tepat dalam satu kalimat.

**❓ Pertanyaan 2 (Terapan — hitung)**  
Tim DevOps mengklaim deployment terbaru mengurangi rata-rata latency dari baseline 200 ms. Dari 100 request yang diuji, rata-rata latency model baru adalah 193 ms. Diketahui σ = 35 ms.

- Rumuskan H₀ dan Hₐ
- Hitung Z-statistic
- Hitung p-value (gunakan: P(Z ≤ −2) ≈ 0,023)
- Ambil kesimpulan pada α = 0,05

**❓ Pertanyaan 3 (Kritis)**  
Sebuah startup melaporkan: _"A/B test kami menunjukkan Versi B 0,3% lebih tinggi conversion rate-nya, dan hasilnya signifikan secara statistik dengan p = 0,001 (n = 500.000 per varian)."_

Apakah Anda akan merekomendasikan rollout penuh Versi B? Gunakan konsep _statistical vs practical significance_ dalam jawaban Anda. Apa yang perlu Anda ketahui sebelum memutuskan?

---

### Kasus Nyata yang Digunakan dalam Slide Ini

| Slide | Kasus                                                   | Domain                                 |
| ----- | ------------------------------------------------------- | -------------------------------------- |
| 4     | Deteksi anomali login via p-value                       | Cybersecurity                          |
| 5     | Tabel formulasi H₀/Hₐ untuk 5 skenario teknologi        | Lintas domain                          |
| 8     | Uji latensi model inferensi baru vs baseline            | MLOps                                  |
| 9     | Uji deteksi rate antivirus vs klaim vendor              | Cybersecurity / QA                     |
| 10    | A/B test durasi upload Versi A vs B NimbusStore         | Product Analytics                      |
| 11    | Konsekuensi gagal tolak yang disalahinterpretasikan     | Data Literacy                          |
| 12    | P-hacking via optional stopping dalam A/B test          | Product Analytics / Research Integrity |
| 13    | Statistical vs practical significance: 0,01% conversion | Product Analytics                      |
