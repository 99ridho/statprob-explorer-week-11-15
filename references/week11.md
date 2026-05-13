# Slide Draft — Minggu 11: Estimasi Parameter

**Mata Kuliah:** Statistika dan Probabilitas  
**Minggu ke:** 11  
**Dosen Pengampu:** Rauhil Fahmi, S.Kom., M.Sc.; Deni Utama, S.T., M.T.I.; Muhammad Ridho Kurniawan Pratama, S.Kom., M.T.I.

> **Sumber utama:** Alex Tsun, _Probability & Statistics with Applications to Computing_, 2020, Chapter 7 (Section 7.1 & 7.4)  
> Semua definisi dan contoh teoritis dalam slide ini bersumber langsung dari buku tersebut.  
> Kasus nyata bertanda `[KASUS NYATA]` adalah ilustrasi terapan yang disusun untuk keperluan pengajaran.

---

## SLIDE 1 — JUDUL

**Statistika dan Probabilitas**

# Minggu 11: Estimasi Parameter

### _Point Estimation, Maximum Likelihood Estimation (MLE), dan Beta Distribution_

**Dosen Pengampu:**
Rauhil Fahmi, S.Kom., M.Sc.
Deni Utama, S.T., M.T.I.
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
| **Sub-CPMK** | Mahasiswa mampu melakukan estimasi titik menggunakan MLE dan MAP                     |

### Materi Minggu Ini

1. Estimasi Titik (_Point Estimation_)
2. _Maximum Likelihood Estimation_ (MLE)
3. Beta dan Dirichlet Distribution

### Posisi dalam Peta Konsep

```
Minggu 10: CLT & Z-Score
        ↓
Minggu 11: Estimasi Parameter ← (kita di sini)
        ↓
Minggu 12: Confidence Interval
```

---

## SLIDE 3 — PERTANYAAN PEMANTIK

### Sebelum Mulai, Pikirkan Ini:

> **❓ Pertanyaan 1**  
> Anda adalah analis di sebuah e-commerce. Dari 1.000 transaksi terakhir, 37 di antaranya dilaporkan sebagai fraud. Tanpa model statistik apapun, Anda mungkin langsung bilang: "fraud rate = 3,7%." Tapi mengapa angka itu yang dipilih — bukan 3% atau 4%? Apa yang membuatnya menjadi estimasi "terbaik"?

> **❓ Pertanyaan 2**  
> Tim DevOps Anda baru saja menyebarkan versi baru sebuah API. Log mencatat jumlah error per jam selama 4 jam pertama: 2, 5, 1, 4. Bagaimana Anda mengestimasi rata-rata error per jam API tersebut secara sistematis untuk keperluan alerting?

> **❓ Pertanyaan 3**  
> Sebuah fitur rekomendasi produk baru saja dirilis. Belum ada satu pun pengguna yang mengkliknya. Bagaimana Anda merepresentasikan "keyakinan" sistem tentang _click-through rate_ fitur itu — jika data belum ada sama sekali?

---

## SLIDE 4 — PROBABILITAS vs STATISTIKA

### Dua Arah Berpikir

|                       | **Probabilitas**                                      | **Statistika (Estimasi)**                           |
| --------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| **Arah**              | Model → Data                                          | Data → Model                                        |
| **Pertanyaan**        | Jika model diketahui, berapa peluang data ini muncul? | Jika data diketahui, apa model yang paling mungkin? |
| **Contoh akademis**   | P(THHTHH) jika p = 0,5?                               | Jika observasi = THHTHH, berapa p?                  |
| **Minggu sebelumnya** | ✅ Sudah dipelajari                                   |                                                     |
| **Minggu ini**        |                                                       | ✅ Fokus kita sekarang                              |

> _"What we've been doing up until this point is probability. We're given a model... and we're trying to find the probability of some data. What we're going to focus now is going the opposite way."_  
> — Alex Tsun, Ch. 7, hal. 249

---

### `[KASUS NYATA]` — Deteksi Spam Email

**Arah Probabilitas (sudah kita kuasai):**

> "Diketahui 30% email adalah spam. Berapa peluang email berisi kata 'GRATIS' adalah spam?"  
> → Kita punya model, kita hitung peluang data.

**Arah Statistika/Estimasi (fokus minggu ini):**

> Anda tidak tahu berapa persen email yang masuk ke server kantor Anda adalah spam. Anda mengamati 500 email: 142 teridentifikasi spam oleh pengguna. Berapa estimasi _spam rate_ terbaik?  
> → Kita punya data, kita cari model (parameter) yang paling masuk akal.

**Pertanyaan diskusi:** Apakah estimasi 142/500 = 28,4% sudah "cukup benar"? Apa yang membuatnya lebih baik dari tebakan 25% atau 30%?

---

## SLIDE 5 — APA ITU ESTIMASI TITIK?

### _Point Estimation_

**Definisi:**  
Estimasi titik adalah proses menggunakan data sampel untuk menghasilkan **satu nilai tunggal** (disebut _estimator_) sebagai perkiraan terbaik dari parameter populasi yang tidak diketahui (θ).

**Notasi:**

- θ (theta) = parameter populasi yang tidak diketahui (misal: probabilitas, rata-rata, laju kejadian)
- θ̂ (theta-hat) = nilai estimasi dari θ berdasarkan data

**Contoh parameter yang bisa diestimasi:**

| Distribusi  | Parameter (θ) | Makna                               |
| ----------- | ------------- | ----------------------------------- |
| Bernoulli   | p             | Probabilitas sukses                 |
| Poisson     | λ             | Rata-rata kejadian per satuan waktu |
| Exponential | λ             | Laju kejadian                       |
| Normal      | μ, σ²         | Rata-rata dan variansi populasi     |

> Sumber: Tsun, 2020, hal. 248–249

---

### `[KASUS NYATA]` — Estimasi Titik dalam Sistem Nyata

Estimasi titik adalah yang paling sering Anda temui tanpa sadar:

| Situasi Nyata                                                          | Parameter (θ)              | Estimator (θ̂)                       |
| ---------------------------------------------------------------------- | -------------------------- | ----------------------------------- |
| Aplikasi ride-hailing ingin tahu berapa menit rata-rata pengemudi tiba | μ (rata-rata waktu tunggu) | Rata-rata dari sampel waktu tunggu  |
| Tim QA ingin tahu probabilitas bug muncul setelah build                | p (probabilitas bug)       | Jumlah build gagal / total build    |
| Server monitoring ingin tahu rata-rata crash per hari                  | λ (laju crash)             | Total crash / jumlah hari observasi |
| Model ML ingin tahu rata-rata waktu inferensi                          | μ (rata-rata latensi)      | Rata-rata dari 1.000 pengujian      |

**Kunci:** Semua angka di atas adalah **estimasi** — bukan nilai sesungguhnya dari populasi. Seberapa "benar" estimasi itu bergantung pada metode estimasi yang digunakan.

---

## SLIDE 6 — LIKELIHOOD: INTUISI

### Membangun Intuisi dari Buku

**Skenario** _(Tsun, 2020, hal. 249–250)_:  
Anda diberi koin dengan probabilitas kepala **p yang tidak diketahui**. Diberi waktu 5 menit untuk menebak nilai p. Siapa yang paling dekat menang nilai A+.

**Strategi terbaik:** Lempar sebanyak mungkin → hitung:

$$\hat{p} = \frac{\text{Jumlah Kepala}}{\text{Jumlah Lemparan}}$$

**Pertanyaan:** Mengapa ini disebut estimasi "terbaik"? Apa yang dimaksimalkan oleh nilai ini?

→ Jawabannya: nilai ini **memaksimalkan likelihood** — yaitu kemungkinan melihat data yang Anda amati.

---

### `[KASUS NYATA]` — A/B Testing pada Fitur Baru

**Skenario:** Tim produk sebuah aplikasi belajar online meluncurkan dua versi tombol CTA (_Call to Action_):

- **Versi A** (lama): Dari 200 pengguna yang melihatnya, 48 mengklik.
- **Versi B** (baru): Dari 180 pengguna yang melihatnya, 54 mengklik.

**Pertanyaan:** Berapa estimasi _click-through rate_ (CTR) terbaik untuk masing-masing versi?

Menggunakan logika likelihood yang sama:

$$\hat{p}_A = \frac{48}{200} = 0{,}24 \quad \hat{p}_B = \frac{54}{180} = 0{,}30$$

**Mengapa 0,24 dan 0,30 adalah estimasi "terbaik"?**  
Karena nilai-nilai inilah yang **paling memungkinkan** menghasilkan data yang teramati (48 klik dari 200, dan 54 klik dari 180) — bukan sekadar hasil bagi biasa, melainkan argmax dari fungsi likelihood Bernoulli.

---

## SLIDE 7 — DEFINISI LIKELIHOOD

### Definisi Formal

**Diberikan:** sampel iid x = (x₁, ..., xₙ) dari distribusi dengan parameter θ yang tidak diketahui.

**Likelihood** didefinisikan sebagai "probabilitas" melihat data tersebut jika parameter sesungguhnya adalah θ:

**Jika X diskret:**
$$L(x \mid \theta) = \prod_{i=1}^{n} p_X(x_i \mid \theta)$$

**Jika X kontinu:**
$$L(x \mid \theta) = \prod_{i=1}^{n} f_X(x_i \mid \theta)$$

> _Definition 7.1.2: Likelihood_ — Tsun, 2020, hal. 250–251

**Catatan penting:** Likelihood bukan probabilitas biasa — ini adalah **fungsi dari θ**, bukan fungsi dari data.

---

### `[KASUS NYATA]` — Memahami Likelihood secara Intuitif

**Bayangkan Anda seorang SRE (Site Reliability Engineer).**  
Anda mengamati log: dalam satu jam, sistem mengalami **3 crash**. Anda ingin tahu: berapa rata-rata crash per jam (λ) yang "paling masuk akal"?

Anda coba beberapa kandidat nilai λ dan lihat seberapa besar "kemungkinan" data itu muncul:

| Kandidat λ | L(data = 3 crash \| λ) via Poisson PMF            | Masuk akal?          |
| ---------- | ------------------------------------------------- | -------------------- |
| λ = 0,5    | Sangat kecil — jarang ada crash, tapi tiba-tiba 3 | ❌ Tidak masuk akal  |
| λ = 3      | Paling besar — rata-rata memang 3, wajar dapat 3  | ✅ Paling masuk akal |
| λ = 10     | Kecil lagi — rata-rata tinggi tapi hanya dapat 3  | ❌ Kurang masuk akal |

→ **Likelihood adalah alat untuk mengukur "masuk akal"-nya sebuah nilai θ diberikan data yang kita amati.**  
MLE akan secara formal memilih λ = 3 sebagai estimasi terbaik.

---

## SLIDE 8 — CONTOH LIKELIHOOD (1): BERNOULLI

### Contoh Matematis dari Buku

**Data:** x = (x₁, x₂, x₃) = (1, 0, 1) → iid dari Ber(θ)

**Likelihood:**
$$L(x \mid \theta) = p_X(1|\theta) \cdot p_X(0|\theta) \cdot p_X(1|\theta) = \theta \cdot (1-\theta) \cdot \theta = \theta^2(1-\theta)$$

**Tebak:** Nilai θ berapa yang memaksimalkan L(x|θ)?

→ Karena ada 2 sukses dari 3 percobaan: **θ̂ = 2/3**

> Sumber: Tsun, 2020, hal. 251

---

### `[KASUS NYATA]` — Likelihood untuk Estimasi _Defect Rate_ Perangkat Lunak

**Konteks:** Tim QA menguji 3 fitur baru. Hasilnya: fitur 1 ✅ lulus, fitur 2 ❌ gagal, fitur 3 ✅ lulus.  
Diasumsikan setiap fitur punya probabilitas gagal θ yang sama dan saling independen.

**Representasi data:** x = (1, 0, 1) di mana 1 = lulus, 0 = gagal → Ber(θ)

**Likelihood:** $L = \theta^2(1-\theta)$

| Kandidat θ (prob lulus)  | L = θ²(1−θ)           |
| ------------------------ | --------------------- |
| θ = 0,5                  | 0,125                 |
| θ = 0,67 ← estimasi kita | **0,148 (tertinggi)** |
| θ = 0,8                  | 0,128                 |
| θ = 1,0                  | 0                     |

**Kesimpulan:** Dari 3 pengujian, 2 lulus → estimasi terbaik probabilitas lulus = **2/3 ≈ 0,67**.  
MLE memberikan angka yang sama dengan "proporsi sukses" — tapi dengan justifikasi matematis yang solid.

---

## SLIDE 9 — CONTOH LIKELIHOOD (2): POISSON

### Contoh Matematis dari Buku

**Data:** x = (3, 0, 2, 7) → iid dari Poi(θ)

**Likelihood:** (mengalikan PMF Poisson untuk setiap observasi)

$$L(x \mid \theta) = \prod_{i=1}^{4} \frac{e^{-\theta}\theta^{x_i}}{x_i!}$$

**Estimasi θ̂:**  
Total kejadian = 3 + 0 + 2 + 7 = 12 dalam 4 satuan waktu

$$\hat{\theta} = \frac{12}{4} = 3 \text{ kejadian per satuan waktu}$$

> Sumber: Tsun, 2020, hal. 251

---

### `[KASUS NYATA]` — Estimasi Laju Error API untuk Sistem Alerting

**Konteks:** Seorang DevOps engineer memantau jumlah error per jam dari sebuah microservice selama 4 jam pertama setelah deployment:

| Jam ke- | Error teramati |
| ------- | -------------- |
| 1       | 3              |
| 2       | 0              |
| 3       | 2              |
| 4       | 7              |

**Asumsi:** Jumlah error per jam mengikuti distribusi Poisson(λ), di mana λ = rata-rata error per jam.

**MLE:**
$$\hat{\lambda} = \frac{3 + 0 + 2 + 7}{4} = \frac{12}{4} = 3 \text{ error/jam}$$

**Kegunaan praktis:**

- Sistem alerting dikonfigurasi: kirim notifikasi jika error > 2× estimasi → alert jika error > 6/jam
- Basis untuk SLA monitoring dan kapasitas perencanaan on-call shift

**Diskusi:** Jika deployment baru membuat error menjadi 9/jam, apakah ini sudah melampaui batas wajar? Bagaimana Anda memutuskannya?

---

## SLIDE 10 — DEFINISI MLE

### _Maximum Likelihood Estimation_ (MLE)

> **Definition 7.1.3** _(Tsun, 2020, hal. 254)_:  
> Let x = (x₁, ..., xₙ) be iid realizations from pX(t|θ) or fX(t|θ), where θ is an unknown parameter.  
> We define the **maximum likelihood estimator** θ̂_MLE to be the parameter which maximizes the likelihood (or equivalently, the log-likelihood) of the data:

$$\hat{\theta}_{MLE} = \arg\max_{\theta} L(x \mid \theta) = \arg\max_{\theta} \ln L(x \mid \theta)$$

**Resep MLE** _(Tsun, 2020, hal. 254)_:

1. Hitung likelihood L(x|θ) dan log-likelihood ln L(x|θ)
2. Ambil turunan parsial terhadap θ, set ke nol → selesaikan persamaan
3. (Opsional) Verifikasi bahwa θ̂ adalah maksimizer dengan mengecek turunan kedua bernilai negatif

---

### `[KASUS NYATA]` — MLE Digunakan di Mana dalam Dunia Nyata?

MLE bukan hanya konsep kelas — ini adalah tulang punggung banyak sistem komputasi modern:

| Sistem                        | Apa yang Diestimasi via MLE              | Dampak                            |
| ----------------------------- | ---------------------------------------- | --------------------------------- |
| **Spam filter (Naive Bayes)** | Probabilitas kata muncul di email spam   | Filter yang lebih akurat          |
| **Model bahasa (GPT, dll.)**  | Probabilitas token berikutnya dalam teks | Generasi teks yang koheren        |
| **Sistem rekomendasi**        | Parameter preferensi pengguna            | Rekomendasi lebih relevan         |
| **Deteksi anomali jaringan**  | Distribusi normal traffic                | Alert ketika terjadi penyimpangan |
| **Logistic Regression (ML)**  | Bobot koefisien model                    | Klasifikasi biner yang optimal    |

**Pesan kunci:** Setiap kali sebuah model "belajar dari data" — MLE kemungkinan besar ada di balik prosesnya.

---

## SLIDE 11 — MENGAPA LOG-LIKELIHOOD?

### Mengapa Kita Menggunakan ln L, Bukan L?

**Masalah dengan L:**  
Likelihood adalah **perkalian** banyak PDF/PMF:

$$L(x|\theta) = \prod_{i=1}^{n} f_X(x_i|\theta)$$

Turunan dari perkalian = rumit (product rule berulang). Selain itu, perkalian banyak bilangan kecil (probabilitas) akan menghasilkan bilangan yang sangat kecil → _numerical underflow_ pada komputer.

**Solusi — Log-Likelihood:**  
Log mengubah perkalian menjadi **penjumlahan**:

$$\ln L(x|\theta) = \sum_{i=1}^{n} \ln f_X(x_i|\theta)$$

Turunan dari penjumlahan = jumlah turunan (jauh lebih mudah!).

**Mengapa aman?**  
Log adalah fungsi _monotone increasing_ → argmax-nya **sama** dengan argmax dari L.

> Sumber: Tsun, 2020, hal. 254–255 (Definition 7.1.4: Log-Likelihood)

---

### `[KASUS NYATA]` — Mengapa Log Penting Secara Komputasi

**Masalah nyata di sistem ML:**  
Bayangkan model bahasa mengevaluasi kemungkinan sebuah kalimat yang terdiri dari 20 kata. Setiap kata punya probabilitas sekitar 0,01. Likelihood-nya:

$$L = 0{,}01^{20} = 10^{-40}$$

Angka ini **terlalu kecil** untuk direpresentasikan oleh floating point standar (`float64` → minimum ~10⁻³⁰⁸ sebelum _underflow_).

**Solusi dengan Log-Likelihood:**

$$\ln L = 20 \times \ln(0{,}01) = 20 \times (-4{,}605) = -92{,}1$$

Angka ini aman dan mudah dihitung!

**Praktik nyata:** Semua library ML modern (scikit-learn, PyTorch, TensorFlow) menggunakan log-likelihood secara internal. Anda sering menemukan istilah **"cross-entropy loss"** — itu adalah negatif log-likelihood dalam konteks klasifikasi.

---

## SLIDE 12 — CONTOH PENUH MLE

### Contoh Matematis dari Buku

**Data:** x = (1, 1, 1, 1, 0) → iid dari Ber(θ), n = 5

**Langkah 1 — Likelihood:**
$$L(x|\theta) = \theta^4(1-\theta)$$

**Langkah 2 — Turunan & set ke nol:**
$$\frac{\partial}{\partial\theta} L(x|\theta) = 4\theta^3 - 5\theta^4 = \theta^3(4 - 5\theta) = 0$$

$$\hat{\theta} = \frac{4}{5} \text{ atau } 0$$

**Langkah 3 — Pilih maksimizer:**  
Bandingkan L(0), L(4/5), L(1) → **θ̂_MLE = 4/5**

**Interpretasi:** 4 kepala dari 5 lemparan → estimasi terbaik p = 0,8

> Sumber: Tsun, 2020, hal. 252–254

---

### `[KASUS NYATA]` — MLE untuk _Uptime Rate_ Sebuah Layanan

**Konteks:** Seorang SRE mencatat status layanan selama 5 hari terakhir:  
Hari 1: ✅ Up, Hari 2: ✅ Up, Hari 3: ✅ Up, Hari 4: ✅ Up, Hari 5: ❌ Down

Data: x = (1, 1, 1, 1, 0) → iid Ber(θ) di mana θ = probabilitas layanan _up_ dalam sehari.

**Mengikuti resep MLE (identik dengan contoh buku):**

$$L(\theta) = \theta^4(1-\theta) \xrightarrow{\text{maksimalkan}} \hat{\theta}_{MLE} = \frac{4}{5} = 0{,}8$$

**Interpretasi bisnis:**

- _Estimated uptime rate_ = **80%** → jauh di bawah standar SLA umum (99,9%)
- Jika hanya punya 5 hari data, apakah 80% ini estimasi yang bisa dipercaya?
- Berapa hari observasi yang dibutuhkan agar estimasi lebih stabil? → _petunjuk: ingat CLT dari minggu lalu_

**Diskusi kelas:** Apakah Anda akan melaporkan 80% ini ke manajemen sebagai _uptime rate_ sesungguhnya? Apa risikonya?

---

## SLIDE 13 — DISTRIBUSI BETA: MOTIVASI

### Mengapa Kita Butuh Distribusi Baru?

**Pertanyaan:** Bagaimana merepresentasikan **keyakinan kita** tentang nilai suatu probabilitas yang tidak diketahui?

**Contoh dari buku:** Anda percaya probabilitas heads koin paling mungkin sekitar 0,5 — tapi tidak 100% yakin.

Kita butuh distribusi kontinu dengan:

- Range [0, 1] (karena probabilitas ∈ [0, 1])
- Bisa memiliki satu puncak (modus) di mana saja dalam [0, 1]
- Bisa mencerminkan seberapa yakin kita (distribusi sempit = yakin, lebar = tidak yakin)

> _"We need a continuous random variable (with range [0, 1] because probabilities can be any number within this range)!"_  
> — Tsun, 2020, hal. 265

---

### `[KASUS NYATA]` — Estimasi CTR Fitur Baru Tanpa Data Historis

**Situasi:** Sebuah startup teknologi merilis fitur "Notifikasi Pintar" di aplikasinya. Belum ada satu pun data klik karena baru saja diluncurkan.

**Masalah:** Sistem rekomendasi perlu nilai awal untuk _click-through rate_ (CTR) fitur ini sebelum data terkumpul. Tidak bisa pakai MLE karena belum ada data!

**Solusi: Gunakan distribusi Beta sebagai _prior belief_.**

| Kondisi Tim                                             | Distribusi Prior     | Artinya                                             |
| ------------------------------------------------------- | -------------------- | --------------------------------------------------- |
| Tim tidak punya ekspektasi sama sekali                  | Beta(1, 1) = Uniform | Semua nilai CTR antara 0–1 dianggap sama mungkin    |
| Tim percaya CTR sekitar 10% berdasarkan produk serupa   | Beta(2, 18)          | Keyakinan lunak bahwa CTR ≈ 10%, tapi masih terbuka |
| Tim punya data produk lama: 100 klik dari 1000 tampilan | Beta(101, 901)       | Keyakinan kuat CTR ≈ 10%, distribusi sangat sempit  |

**Kunci:** Distribusi Beta memungkinkan kita memasukkan _prior knowledge_ sebelum data nyata terkumpul — inilah fondasi pendekatan Bayesian dalam ML.

---

## SLIDE 14 — DEFINISI DISTRIBUSI BETA

### _Beta Random Variable_

> **Definition 7.4.1** _(Tsun, 2020, hal. 269)_:  
> X ~ Beta(α, β), jika dan hanya jika X memiliki fungsi densitas:

$$f_X(x) = \frac{1}{B(\alpha, \beta)} x^{\alpha-1}(1-x)^{\beta-1}, \quad 0 \leq x \leq 1$$

**Interpretasi parameter:**

- α − 1 = jumlah "sukses" yang seolah-olah sudah diamati
- β − 1 = jumlah "gagal" yang seolah-olah sudah diamati
- **Modus** (nilai paling mungkin): $\frac{\alpha-1}{(\alpha-1)+(\beta-1)}$

**Catatan penting:**  
Ada _off-by-one_: jika observasi = k sukses dan (n−k) gagal, maka gunakan Beta(k+1, n−k+1)

> Sumber: Tsun, 2020, hal. 269

---

### `[KASUS NYATA]` — Membaca Parameter Beta dalam Konteks Produk

**Skenario:** Anda memantau _conversion rate_ halaman checkout aplikasi belanja.

Gunakan rumus: jika k transaksi sukses dari n percobaan → **Beta(k+1, n−k+1)**

| Data Observasi                         | Parameter Beta | Modus (Estimasi CTR) | Lebar Distribusi      |
| -------------------------------------- | -------------- | -------------------- | --------------------- |
| 0 sukses, 0 gagal (belum ada data)     | Beta(1, 1)     | Tidak ada (uniform)  | Sangat lebar          |
| 3 sukses, 7 gagal (10 transaksi)       | Beta(4, 8)     | 3/10 = 30%           | Lebar (belum yakin)   |
| 30 sukses, 70 gagal (100 transaksi)    | Beta(31, 71)   | 30/100 = 30%         | Sedang                |
| 300 sukses, 700 gagal (1000 transaksi) | Beta(301, 701) | 300/1000 = 30%       | Sempit (sangat yakin) |

**Insight:** Modus selalu 30%, tapi distribusi semakin sempit seiring bertambahnya data.  
→ Ini menjelaskan _mengapa kita butuh lebih banyak data sebelum mengambil keputusan bisnis._

---

## SLIDE 15 — CONTOH DISTRIBUSI BETA

### Contoh dari Buku: Koin dengan p Tidak Diketahui

**Skenario:** _(Tsun, 2020, hal. 269–270)_

| Kondisi                 | Parameter Beta         | Modus        | Interpretasi                                   |
| ----------------------- | ---------------------- | ------------ | ---------------------------------------------- |
| Belum observasi apa pun | Beta(1, 1) ≡ Unif(0,1) | Tidak ada    | Semua kemungkinan setara                       |
| 8 kepala, 2 ekor        | Beta(9, 3)             | 8/10 = 0,8   | Percaya p ≈ 0,8, tapi masih ada ketidakpastian |
| 80 kepala, 20 ekor      | Beta(81, 21)           | 80/100 = 0,8 | Sangat yakin p ≈ 0,8 (distribusi lebih sempit) |
| 2 kepala, 3 ekor        | Beta(3, 4)             | 2/5 = 0,4    | Percaya p ≈ 0,4, ketidakpastian tinggi         |

**Pola:** Semakin banyak data → distribusi Beta semakin sempit → estimasi semakin yakin.

> Sumber: Tsun, 2020, hal. 269–270

---

### `[KASUS NYATA]` — Beta Distribution dalam Sistem Pengujian Fitur (A/B Test Bayesian)

**Konteks:** Dua versi halaman login sedang diuji. Sistem mencatat login sukses vs gagal setiap menit.

**Versi A** — sudah lama berjalan: 800 sukses, 200 gagal → Beta(801, 201), modus = 80%  
**Versi B** — baru diuji 10 menit: 8 sukses, 2 gagal → Beta(9, 3), modus = 80%

**Pertanyaan kritis:** Kedua versi punya modus yang sama (80%). Apakah artinya keduanya sama-sama bagus?

**Jawaban:** **Tidak.** Distribusi Beta-nya berbeda:

- Versi A: distribusi sangat sempit → kita **sangat yakin** _success rate_ ≈ 80%
- Versi B: distribusi sangat lebar → kita **belum bisa yakin** apakah benar 80% atau bisa jadi 50% atau 95%

**Implikasi desain sistem:** Dalam A/B testing Bayesian, kita tidak bisa hanya membandingkan _point estimate_ — kita harus membandingkan seluruh distribusi posterior. Distribusi Beta adalah alat utamanya.

---

## SLIDE 16 — DISTRIBUSI DIRICHLET

### Generalisasi Beta: _Dirichlet Random Vector_

**Konteks:** Beta hanya bisa memodelkan 2 kemungkinan (sukses/gagal). Bagaimana jika ada r kemungkinan?

> **Definition 7.4.2** _(Tsun, 2020, hal. 270)_:  
> X ~ Dir(α₁, α₂, ..., αᵣ), dengan fungsi densitas:

$$f_X(x) = \frac{1}{B(\alpha)}\prod_{i=1}^{r} x_i^{\alpha_i - 1}, \quad x_i \in (0,1),\ \sum x_i = 1$$

**Interpretasi:**

- αᵢ − 1 = jumlah observasi bertipe i
- Dirichlet = Beta yang diperluas untuk r outcome (seperti Multinomial pada distribusi diskret)

|                 | Beta               | Dirichlet                           |
| --------------- | ------------------ | ----------------------------------- |
| Jumlah outcome  | 2                  | r (≥ 2)                             |
| Parameter       | α, β               | α₁, ..., αᵣ                         |
| Contoh akademis | Koin (kepala/ekor) | Dadu 6 sisi, klasifikasi multikelas |

> Sumber: Tsun, 2020, hal. 270

---

### `[KASUS NYATA]` — Dirichlet untuk Klasifikasi Sentimen Ulasan Produk

**Konteks:** Sebuah platform e-commerce memodelkan sentimen ulasan produk: 😊 Positif, 😐 Netral, 😞 Negatif.

Dari 1.000 ulasan pertama sebuah produk baru: 600 positif, 250 netral, 150 negatif.

**Dirichlet prior:** Dir(601, 251, 151) — memasukkan semua data yang diamati

**Estimasi proporsi:**
$$\hat{p}_{pos} = \frac{600}{1000} = 60\%, \quad \hat{p}_{net} = \frac{250}{1000} = 25\%, \quad \hat{p}_{neg} = \frac{150}{1000} = 15\%$$

**Kegunaan:**

- Sistem rekomendasi menggunakan distribusi ini untuk memilih produk yang ditampilkan
- Ketika ulasan baru masuk (misalnya 10 positif baru), parameter Dirichlet diperbarui: Dir(611, 251, 151)
- Ini adalah cara sistem "belajar dari ulasan baru" secara incremental — tanpa melatih ulang model dari nol

**Hubungan Beta–Dirichlet:** Jika hanya ada 2 kategori (positif/negatif), Dirichlet(α₁, α₂) = Beta(α₁, α₂).

---

## SLIDE 17 — RINGKASAN & KONEKSI ANTAR KONSEP

### Peta Konsep Minggu Ini

```
Data yang diamati (x₁, ..., xₙ)
        │
        ▼
   Likelihood L(x|θ)
   "Seberapa besar kemungkinan data ini jika θ benar?"
   [Contoh nyata: SRE menghitung L untuk kandidat λ crash/jam]
        │
        ▼
   Maksimalkan → θ̂_MLE
   "Nilai θ yang paling masuk akal diberikan data ini"
   [Contoh nyata: Spam rate, CTR, uptime rate, defect rate]

   Butuh distribusi untuk θ itu sendiri?
        │
        ▼
   Beta(α, β) — untuk 2 outcome (biner)
   [Contoh nyata: A/B testing Bayesian, CTR sebelum ada data]

   Dirichlet(α₁,...,αᵣ) — untuk r outcome
   [Contoh nyata: Klasifikasi sentimen ulasan produk]
        │
        ▼
   Minggu 12: Confidence Interval
   "Seberapa lebar rentang estimasi yang masuk akal?"
```

---

## SLIDE 18 — KESIMPULAN

### Yang Telah Kita Pelajari Hari Ini

✅ **Estimasi Titik** — menggunakan data sampel untuk menghasilkan satu nilai θ̂ terbaik bagi parameter populasi  
_(Contoh nyata: mengestimasi failure rate, CTR, uptime rate dari data observasi)_

✅ **Likelihood** — fungsi L(x|θ) yang mengukur "seberapa besar kemungkinan data muncul jika θ benar"  
_(Contoh nyata: SRE memilih nilai λ crash/jam yang paling "masuk akal" dari log sistem)_

✅ **MLE** — menemukan θ yang memaksimalkan likelihood; resep: hitung log-likelihood → turunkan → set ke nol  
_(Contoh nyata: digunakan di balik spam filter, model bahasa, logistic regression, deteksi anomali)_

✅ **Log-Likelihood** — transformasi yang mengubah perkalian menjadi penjumlahan; mencegah _numerical underflow_  
_(Contoh nyata: identik dengan "cross-entropy loss" dalam training model ML)_

✅ **Distribusi Beta** — distribusi kontinu berrange [0,1] untuk memodelkan keyakinan tentang probabilitas biner  
_(Contoh nyata: A/B testing Bayesian, estimasi CTR fitur baru sebelum data terkumpul)_

✅ **Distribusi Dirichlet** — generalisasi Beta untuk r outcome; fondasi MAP Estimation  
_(Contoh nyata: memodelkan distribusi sentimen ulasan produk secara incremental)_

> Semua definisi bersumber dari: Tsun, _Probability & Statistics with Applications to Computing_, 2020, Chapter 7

---

## SLIDE 19 — REFLEKSI & KUIS

### Refleksi

**❓ Pertanyaan 1 (Konseptual)**  
Seorang product manager berkata: "CTR iklan kita 5% dari 20 klik pertama — kita harus scale up anggaran iklan sekarang!" Sebagai data analyst, apa yang Anda katakan? Hubungkan dengan konsep likelihood dan distribusi Beta yang baru saja dipelajari.

**❓ Pertanyaan 2 (Terapan — hitung)**  
Sebuah endpoint API dicatat mengalami error selama 5 jam berturut-turut: 1, 4, 2, 0, 3 error per jam.

- Modelkan dengan distribusi Poisson(λ)
- Gunakan MLE untuk mengestimasi λ
- Tunjukkan langkah-langkah resep MLE secara lengkap (likelihood → log-likelihood → turunan → θ̂)

**❓ Pertanyaan 3 (Kritis)**  
MLE memberikan satu nilai estimasi terbaik berdasarkan data. Tapi apa yang _tidak_ ditangkap oleh satu angka saja? Dalam konteks A/B testing fitur baru vs fitur lama, mengapa membandingkan nilai tunggal CTR bisa menyesatkan? _(petunjuk: ingat perbedaan Beta(9,3) vs Beta(81,21) pada slide 15)_

---

## CATATAN DOSEN

### Alur Pengajaran yang Disarankan

| Waktu        | Aktivitas                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------ |
| 0–15 menit   | Apersepsi: 3 pertanyaan pemantik (slide 3) + diskusi singkat, hubungkan ke CLT minggu lalu |
| 15–30 menit  | Prob vs Statistik (slide 4) + kasus spam filter, bangun intuisi dua arah berpikir          |
| 30–50 menit  | Likelihood + MLE: definisi formal → contoh akademis → kasus nyata (slide 6–12)             |
| 50–55 menit  | Jeda + kuis cepat: "Berapa MLE dari data error berikut?" (lisan, 2 menit)                  |
| 55–75 menit  | Distribusi Beta + Dirichlet: definisi → kasus CTR + A/B testing + sentimen (slide 13–16)   |
| 75–85 menit  | Peta konsep & kesimpulan (slide 17–18)                                                     |
| 85–100 menit | Refleksi & latihan mandiri (slide 19), preview Confidence Interval minggu depan            |

### Potensi Miskonsepsi yang Perlu Diantisipasi

- **Likelihood ≠ probabilitas biasa** → tekankan: L adalah fungsi dari θ, bukan fungsi dari data. Gunakan analogi tabel SRE (slide 7 kasus nyata).
- **Off-by-one pada parameter Beta** → selalu tunjukkan: k sukses → α = k+1, bukan k. Gunakan tabel slide 14 kasus nyata.
- **Argmax ≠ max** → bedakan dengan contoh konkret; modus Beta(81,21) = 80% bukan berarti L = 80%.
- **MLE = "hitung proporsi"?** → Ya untuk Bernoulli, tapi bukan untuk semua distribusi. Tunjukkan kasus Poisson berbeda.
- **Beta(9,3) vs Beta(81,21) sama-sama berarti 80%** → miskonsepsi umum. Gunakan kasus A/B testing slide 15 untuk menunjukkan perbedaan lebar distribusi.

### Kasus Nyata yang Digunakan dalam Slide Ini

_(Semua adalah ilustrasi terapan untuk keperluan pengajaran — bukan data aktual perusahaan tertentu)_

| Slide | Kasus                                              | Domain               |
| ----- | -------------------------------------------------- | -------------------- |
| 4     | Deteksi spam email                                 | Cybersecurity / NLP  |
| 5     | Estimasi waktu tunggu, uptime, latensi ML          | SRE / MLOps          |
| 6     | A/B testing CTR tombol CTA                         | Product Analytics    |
| 7     | SRE memilih λ crash/jam dari log                   | Site Reliability     |
| 8     | Estimasi _defect rate_ QA perangkat lunak          | Software Quality     |
| 9     | Estimasi laju error API untuk alerting             | DevOps               |
| 10    | MLE di balik spam filter, GPT, logistic regression | ML Engineering       |
| 11    | Numerical underflow & cross-entropy loss           | ML Engineering       |
| 12    | Estimasi _uptime rate_ dari log harian             | SRE                  |
| 13    | CTR fitur baru tanpa data historis (cold start)    | Product / ML         |
| 14    | _Conversion rate_ halaman checkout                 | E-Commerce Analytics |
| 15    | A/B testing Bayesian: Beta sempit vs lebar         | Product Analytics    |
| 16    | Klasifikasi sentimen ulasan produk                 | NLP / E-Commerce     |
