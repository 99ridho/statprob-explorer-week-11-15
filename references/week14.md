# Slide Draft — Minggu 14: Aplikasi Statistika pada Komputasi

**Mata Kuliah:** Statistika dan Probabilitas  
**Minggu ke:** 14  
**Dosen Pengampu:** Muhammad Ridho Kurniawan Pratama, S.Kom., M.T.I.

> **Sumber utama:** Alex Tsun, _Probability & Statistics with Applications to Computing_, 2020, Chapter 9 — Section 9.2 (hal. 312–316), Section 9.4 (hal. 326–331), Section 9.6 (hal. 339–350)  
> Semua definisi, algoritma, dan contoh teoritis bersumber langsung dari buku tersebut.  
> Kasus nyata bertanda `[KASUS NYATA]` adalah ilustrasi terapan untuk keperluan pengajaran.

---

## SLIDE 1 — JUDUL

**Statistika dan Probabilitas**

# Minggu 14: Aplikasi Statistika pada Komputasi

### _Probability via Simulation · Bloom Filters · Markov Chain Monte Carlo (MCMC)_

**Dosen Pengampu:**  
Muhammad Ridho Kurniawan Pratama, S.Kom., M.T.I.

Program Studi Sistem dan Teknologi Informasi  
Fakultas Teknik — Universitas Negeri Jakarta  
2026

---

## SLIDE 2 — CPMK & Sub-CPMK

### Capaian Pembelajaran

|              |                                                                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **CPMK**     | Mahasiswa mampu mengaplikasikan konsep statistika dan probabilitas pada permasalahan komputasi                                                                     |
| **Sub-CPMK** | Mahasiswa mampu melakukan simulasi probabilitas menggunakan tools komputasi dan menerapkan MCMC untuk optimasi dan Bloom Filters untuk struktur data probabilistik |

### Materi Minggu Ini

1. Probability via Simulation — menghitung probabilitas tanpa rumus analitik
2. Bloom Filter — struktur data probabilistik yang hemat ruang
3. Markov Chain & MCMC — optimasi masalah komputasi yang sulit

### Posisi dalam Peta Konsep

```
Minggu 11–13: Estimasi, CI, Uji Hipotesis
   (semua berbasis formula analitik + CLT)
              ↓
Minggu 14: Aplikasi Komputasi ← (kita di sini)
   "Ketika formula tidak cukup → gunakan simulasi & probabilitas"
              ↓
Minggu 15: Review & Persiapan UAS
```

---

## SLIDE 3 — PERTANYAAN PEMANTIK

### Sebelum Mulai, Pikirkan Ini:

> **❓ Pertanyaan 1**  
> Browser Anda mengakses ribuan URL setiap hari. Bagaimana Google Chrome bisa langsung tahu — dalam milidetik — apakah sebuah situs itu berbahaya, tanpa harus bertanya ke server setiap kali? Apa trade-off yang harus dibuat?

> **❓ Pertanyaan 2**  
> Ada masalah yang secara teori memiliki solusi optimal — tapi mencarinya butuh waktu yang secara matematis tidak mungkin (misalnya, mencari rute terpendek yang mengunjungi 50 kota). Apakah ada cara "cukup pintar" untuk mendapat jawaban yang cukup baik tanpa harus mencoba semua kemungkinan?

> **❓ Pertanyaan 3**  
> Probabilitas menang permainan tertentu sangat sulit dihitung secara matematis. Bagaimana komputer bisa memperkirakan angka itu hanya dengan "memainkan" permainan tersebut berkali-kali?

---

## SLIDE 4 — MENGAPA SIMULASI?

### Motivasi dari Buku _(Tsun, 2020, hal. 312)_

> _"Even though we have learned several techniques for computing probabilities, and have more to go, it is still hard sometimes."_

**Contoh dari buku:** Berapa probabilitas tepat 13 dari 100 elemen array tetap di posisi awalnya setelah dikocok acak?

Secara analitik: tidak mudah sama sekali — melibatkan _derangement_ dan _inclusion-exclusion_ yang rumit.

**Solusi sebagai computer scientist:**

> _"Since you are a computer scientist, you can actually avoid computing hard probabilities! You could also even verify that your hand-computed answers are correct using this technique of 'Probability via Simulation'."_  
> — Tsun, 2020, hal. 312

**Ide dasarnya:** Probabilitas = proporsi jangka panjang dari kejadian yang muncul.

$$P(E) = \lim_{N \to \infty} \frac{\text{jumlah percobaan di mana E terjadi}}{N}$$

Semakin banyak percobaan → estimasi semakin akurat. Komputer bisa melakukan jutaan percobaan dalam hitungan detik.

> Sumber: Tsun, 2020, hal. 312

---

### `[KASUS NYATA]` — Simulasi untuk Estimasi Probabilitas Kejadian Langka

**Skenario:** Tim keamanan ingin mengetahui probabilitas dua pengguna yang dipilih acak dari database 10.000 akun memiliki password yang identik (_birthday problem_ versi nyata).

Menghitung secara analitik: mungkin tapi rumit. Solusi cepat dengan simulasi:

```python
import numpy as np

def sim_collision(n_users=10000, n_trials=50000):
    count = 0
    for _ in range(n_trials):
        # Simulasikan hash password (disederhanakan)
        i, j = np.random.randint(0, n_users, 2)
        if i == j:
            count += 1
    return count / n_trials

print(sim_collision())  # ≈ 0.0001
```

**Kegunaan praktis:** Pendekatan ini digunakan dalam penetration testing untuk memperkirakan seberapa rentan sistem terhadap serangan brute-force — tanpa perlu memecahkan rumus kombinatorik yang kompleks.

---

## SLIDE 5 — PROBABILITY VIA SIMULATION: CONTOH 1

### Contoh dari Buku: Berapa Lemparan untuk Mendapat Kepala? _(Tsun, 2020, hal. 313)_

**Soal:** Koin bermisi — kepala muncul dengan probabilitas 1/3. Rata-rata berapa lemparan dibutuhkan sampai kepala pertama muncul?

**Jawaban analitik:** 3 lemparan (distribusi Geometrik dengan p = 1/3).

**Verifikasi via simulasi** _(pseudocode dari buku)_:

```python
import numpy as np

def coin_flips(p, ntrials=50000):
    def sim_one_game():       # Simulasi satu game
        flips = 0
        while True:
            flips += 1
            if np.random.rand() < p:  # Kepala!
                return flips

    total_flips = 0
    for _ in range(ntrials):
        total_flips += sim_one_game()
    return total_flips / ntrials   # Rata-rata

print(coin_flips(p=1/3))   # ≈ 3.0
```

**Nilai pedagogis kode ini:**

- `np.random.rand() < p` menghasilkan `True` dengan probabilitas tepat p
- Rata-rata dari banyak percobaan konvergen ke nilai ekspektasi teoritis
- Dengan `ntrials=50000`, hasil sudah sangat mendekati nilai sesungguhnya

> Sumber: Tsun, 2020, hal. 313

---

### `[KASUS NYATA]` — Simulasi untuk Estimasi Waktu Resolusi Tiket Support

**Konteks:** Sebuah platform SaaS ingin tahu: rata-rata berapa kali seorang agen harus membaca dokumen sebelum menemukan solusi yang relevan, jika probabilitas dokumen relevan adalah 20%.

Ini identik dengan soal buku (Geometrik p = 0,2). Simulasi memberikan estimasi langsung:

```python
def sim_support_agent(p_relevant=0.2, ntrials=100000):
    def one_search():
        reads = 0
        while True:
            reads += 1
            if np.random.rand() < p_relevant:
                return reads
    return sum(one_search() for _ in range(ntrials)) / ntrials

print(sim_support_agent())  # ≈ 5.0 dokumen per resolusi
```

**Insight bisnis:** Rata-rata 5 dokumen dibaca sebelum tiket terselesaikan. Ini menjadi baseline untuk evaluasi efektivitas sistem pencarian internal — jika setelah improvement rata-rata turun ke 3, ada peningkatan nyata.

---

## SLIDE 6 — PROBABILITY VIA SIMULATION: CONTOH 2

### Contoh dari Buku: Array yang Dikocok _(Tsun, 2020, hal. 314)_

**Soal:** Array [1, 2, ..., 100] dikocok acak. Berapa probabilitas tepat 13 elemen tetap di posisi aslinya?

```python
import numpy as np

def prob_13_original(ntrials=50000):
    def sim_one_shuffle():
        arr = np.arange(1, 101)       # [1, 2, ..., 100]
        np.random.shuffle(arr)
        num_orig = sum(arr[i-1] == i for i in range(1, 101))
        return int(num_orig == 13)    # 1 jika tepat 13, 0 lainnya

    return sum(sim_one_shuffle() for _ in range(ntrials)) / ntrials

print(prob_13_original())   # ≈ 0.0098 (≈ 1%)
```

**Pola umum simulasi** _(berlaku untuk semua masalah)_:

```
1. Definisikan satu percobaan → sim_one_game() / sim_one_shuffle()
2. Jalankan N kali → loop ntrials
3. Hitung proporsi sukses atau rata-rata
4. Kembalikan sebagai estimasi probabilitas / ekspektasi
```

> Sumber: Tsun, 2020, hal. 314

---

## SLIDE 7 — BLOOM FILTER: MOTIVASI

### Masalah Nyata dari Buku _(Tsun, 2020, hal. 326)_

> _"Google Chrome has a huge database of malicious URLs, but it takes a long time to do a database lookup... They want to have a quick check in the web browser itself (on your computer), so a space-efficient data structure must be used."_

**Trade-off yang harus dibuat:**

| Pendekatan           | Waktu lookup                 | Ruang                   | Akurasi                              |
| -------------------- | ---------------------------- | ----------------------- | ------------------------------------ |
| Database penuh (Set) | Lambat — harus query server  | Besar (ratusan MB)      | 100% akurat                          |
| Bloom Filter         | **Cepat — lokal di browser** | **Kecil (beberapa MB)** | Hampir akurat — ada _false positive_ |

**Dua operasi yang didukung** _(Tsun, 2020, hal. 326)_:

- `add(x)` — tambahkan elemen x ke struktur
- `contains(x)` — cek apakah x ada → hasilnya: _"definitely NOT in set"_ atau _"could be in set"_

**Dua operasi yang TIDAK didukung:**

- Delete elemen
- Listkan semua elemen yang ada

> _"The bloom filter is always correct in saying a URL definitely isn't in the set, but may have false positives."_ — Tsun, 2020, hal. 326

---

## SLIDE 8 — BLOOM FILTER: CARA KERJA

### Struktur Internal _(Tsun, 2020, hal. 326–327)_

**Komponen:** k buah bit array $t_1, \ldots, t_k$, masing-masing panjang m (berisi 0 atau 1).  
Total ruang = $km$ bits = $km/8$ bytes.

**k hash functions** $h_1, \ldots, h_k : U \to \{0, 1, \ldots, m-1\}$ — independen dan uniform.

**Operasi `add(x)`:**  
Untuk setiap hash function $h_i$: set $t_i[h_i(x)] = 1$.

**Operasi `contains(x)`:**  
Kembalikan TRUE jika dan hanya jika $t_1[h_1(x)] = 1$ AND $t_2[h_2(x)] = 1$ AND $\ldots$ AND $t_k[h_k(x)] = 1$.

**Mengapa bisa false positive?**  
Bit-bit yang di-set oleh URL berbeda bisa saling tumpang tindih. URL yang belum pernah di-`add` bisa secara kebetulan memetakan ke bit-bit yang sudah di-set oleh URL lain → bloom filter salah mengembalikan TRUE.

**Tidak ada false negative:**  
Jika URL sudah di-`add`, semua bit-nya pasti sudah di-set → `contains` selalu benar untuk URL yang ada.

> Sumber: Tsun, 2020, hal. 326–328

---

## SLIDE 9 — BLOOM FILTER: ANALISIS FALSE POSITIVE RATE

### Theorem 9.4.39 _(Tsun, 2020, hal. 329)_

Setelah memasukkan n URL ke bloom filter (k hash functions, m kolom per row), **false positive rate** untuk URL baru adalah:

$$\boxed{P(\text{false positive}) = \left(1 - \left(1 - \frac{1}{m}\right)^n\right)^k}$$

**Derivasi intuitif:**

- P(satu bit tetap 0 setelah satu URL masuk) = $1 - \frac{1}{m}$
- P(satu bit tetap 0 setelah n URL masuk) = $\left(1 - \frac{1}{m}\right)^n$
- P(satu bit sudah di-set = 1) = $1 - \left(1 - \frac{1}{m}\right)^n$
- P(semua k bit cocok secara independen) = hasil di atas dipangkat k

**Perbandingan ruang** _(Tsun, 2020, hal. 330)_:  
Google simpan 5 juta URL, rata-rata 40 bytes/URL:

| Metode                         | Ruang                                 |
| ------------------------------ | ------------------------------------- |
| Set biasa                      | 5 juta × 40 bytes = **200 MB**        |
| Bloom Filter (k=30, m=900.000) | 30 × 900.000 / 8 bytes = **3,375 MB** |

Penghematan ruang: **~60× lebih kecil!**

> Sumber: Tsun, 2020, hal. 329–330

---

### `[KASUS NYATA]` — Bloom Filter dalam Sistem Nyata

Bloom Filter bukan hanya contoh buku — ini digunakan secara luas di industri:

| Sistem                          | Fungsi Bloom Filter                           | Manfaat                                        |
| ------------------------------- | --------------------------------------------- | ---------------------------------------------- |
| **Google Chrome** (dari buku)   | Cek apakah URL berbahaya sebelum query server | Proteksi cepat tanpa latensi jaringan          |
| **Apache Cassandra** (database) | Cek apakah key ada di disk sebelum membaca    | Kurangi disk I/O tidak perlu                   |
| **Bitcoin**                     | Filter transaksi relevan untuk node ringan    | Kurangi data yang ditransmisi                  |
| **Medium / platform blog**      | Cek apakah artikel sudah dibaca user          | Hindari menampilkan konten duplikat            |
| **Sistem anti-spam email**      | Cek apakah domain pengirim di blacklist       | Pemeriksaan cepat sebelum analisis lebih dalam |

**Catatan penting:** Semua sistem ini memilih false positive yang _dapat ditoleransi_ sebagai trade-off untuk mendapatkan kecepatan dan efisiensi ruang yang jauh lebih baik.

---

## SLIDE 10 — MARKOV CHAIN: FONDASI

### Definisi _(Tsun, 2020, hal. 340)_

**Sebelumnya:** _Discrete-Time Stochastic Process_ (DTSP) — barisan variabel acak $X_0, X_1, X_2, \ldots$ di mana $X_t$ adalah nilai pada waktu t.

> **Definition 9.6.2: Markov Chain**  
> A Markov Chain is a special DTSP with:
>
> 1. **State space** $S = \{s_1, \ldots, s_n\}$ yang berhingga
> 2. **Markov property** — masa depan hanya bergantung pada keadaan saat ini, bukan masa lalu:
>    $$P(X_{t+1} = x_{t+1} \mid X_0, X_1, \ldots, X_t) = P(X_{t+1} = x_{t+1} \mid X_t)$$
> 3. **Stationary transition probabilities** — probabilitas transisi $s_i \to s_j$ tidak berubah seiring waktu

**Transition Probability Matrix (TPM) P** — matriks $n \times n$ di mana:
$$P_{ij} = P(X_{t+1} = s_j \mid X_t = s_i)$$

Setiap baris menjumlah ke 1 (probabilitas total dari state manapun).

> Sumber: Tsun, 2020, hal. 340–341

---

### `[KASUS NYATA]` — Markov Chain Merepresentasikan Perilaku Pengguna

**Skenario:** Sebuah aplikasi streaming memodelkan perilaku pengguna sebagai Markov Chain dengan 3 state:

- **S1:** Menonton (Watching)
- **S2:** Browsing (memilih konten)
- **S3:** Keluar (Exit)

**TPM berdasarkan data historis:**

$$P = \begin{bmatrix} 0.7 & 0.2 & 0.1 \\ 0.4 & 0.5 & 0.1 \\ 0 & 0 & 1 \end{bmatrix}$$

- Dari Watching: 70% tetap nonton, 20% pindah browsing, 10% keluar
- Dari Browsing: 40% mulai nonton, 50% lanjut browsing, 10% keluar
- Exit adalah _absorbing state_ — sekali keluar, tidak kembali

**Penggunaan:** Memprediksi probabilitas pengguna masih aktif setelah k menit — berguna untuk optimasi sistem rekomendasi dan strategi retensi pengguna.

---

## SLIDE 11 — MCMC: IDE DAN DEFINISI

### Dari Markov Chain ke MCMC _(Tsun, 2020, hal. 346)_

**Sifat kunci Markov Chain:** Tidak peduli dari mana kita mulai, setelah berjalan cukup lama, distribusi state konvergen ke **stationary distribution** π.

> **Definition 9.6.4: Markov Chain Monte Carlo (MCMC)**  
> MCMC adalah teknik untuk menyelesaikan masalah optimasi yang sulit (atau untuk sampling dari distribusi). Strateginya:
>
> **I.** Definisikan Markov Chain di mana _states_ = semua solusi yang mungkin, dan _transition probabilities_ menghasilkan stationary distribution π yang memberi probabilitas lebih tinggi pada solusi "baik".
>
> **II.** Jalankan simulasi Markov Chain untuk banyak iterasi — mulai dari state awal manapun, lakukan transisi sesuai TPM. Setelah cukup lama, kita akan sampai di state dengan probabilitas tinggi (= solusi yang baik).

**Kunci:** Kita tidak perlu menghitung π secara eksplisit — kita cukup _mendefinisikan_ transisi yang "mengarah" ke solusi baik.

> Sumber: Tsun, 2020, hal. 346

---

## SLIDE 12 — MCMC: CONTOH 1 — KNAPSACK PROBLEM

### Definition 9.6.5: The 0-1 Knapsack Problem _(Tsun, 2020, hal. 346)_

**Diberikan:** n item dengan berat $w_1, \ldots, w_n$ dan nilai $v_1, \ldots, v_n$, dan kapasitas knapsack W.  
**Tujuan:** Pilih subset item yang memaksimalkan total nilai dengan total berat ≤ W.

Solusi $x = (x_1, \ldots, x_n) \in \{0,1\}^n$ — $2^n$ kemungkinan solusi (NP-Hard untuk diselesaikan secara optimal!).

**Algoritma MCMC** _(Tsun, 2020, hal. 347)_:

```
Algorithm 3: MCMC untuk 0-1 Knapsack

x      ← vektor n nol (knapsack kosong)
best_x ← x

for t = 1, ..., NUM_ITER:
    k      ← bilangan bulat acak dari {1, ..., n}
    new_x  ← x dengan x[k] di-flip (0→1 atau 1→0)

    if new_x memenuhi batasan berat:
        x ← new_x
        if value(x) > value(best_x):
            best_x ← x

return best_x
```

**Ide inti:** Mulai dari "tidak ambil apa-apa", lalu secara acak flip satu item, terima jika masih valid, dan catat solusi terbaik sepanjang waktu.

> Sumber: Tsun, 2020, hal. 347

---

### `[KASUS NYATA]` — Knapsack dalam Alokasi Resource Cloud

**Skenario:** Platform cloud ingin memilih kombinasi microservices yang akan di-deploy pada satu server (kapasitas W = 32 GB RAM), memaksimalkan total revenue per jam sambil memenuhi batasan memori:

| Microservice    | RAM (GB) | Revenue/jam |
| --------------- | -------- | ----------- |
| Auth Service    | 2        | Rp 50.000   |
| Search Engine   | 8        | Rp 200.000  |
| Recommendation  | 12       | Rp 350.000  |
| Analytics       | 6        | Rp 180.000  |
| Notification    | 4        | Rp 100.000  |
| Payment Gateway | 10       | Rp 400.000  |

Total kombinasi yang mungkin: $2^6 = 64$ (masih bisa brute-force). Tapi dengan 100 microservices: $2^{100}$ — mustahil!

**MCMC bekerja:** Mulai dari state acak → flip satu service per iterasi → pertahankan jika RAM tidak melebihi batas → catat kombinasi terbaik. Setelah 100.000 iterasi, solusi yang dihasilkan mendekati optimal dalam hitungan milidetik.

---

## SLIDE 13 — MCMC: CONTOH 2 — TRAVELLING SALESMAN PROBLEM (TSP)

### Definition 9.6.6: TSP _(Tsun, 2020, hal. 347–348)_

**Diberikan:** n lokasi dan jarak antar setiap pasang lokasi.  
**Tujuan:** Temukan urutan kunjungan yang mulai dan berakhir di lokasi yang sama, mengunjungi tiap lokasi tepat satu kali, dengan total jarak minimum.

Jumlah solusi: $n!$ — untuk n = 50 kota: $50! \approx 3 \times 10^{64}$ kemungkinan (mustahil di-enumerate!).

**Algoritma MCMC dengan "temperature" T** _(Tsun, 2020, hal. 348)_:

```
Algorithm 4: MCMC untuk TSP

route      ← permutasi acak dari n lokasi
best_route ← route

for i = 1, ..., NUM_ITER:
    new_route ← route, tapi dua lokasi berurutan ditukar (swap acak)
    Δ         ← dist(new_route) − dist(route)

    if Δ < 0 OR (T > 0 AND Uniform(0,1) < e^(−Δ/T)):
        route ← new_route      ← terima rute baru

    if dist(route) < dist(best_route):
        best_route ← route

return best_route
```

**Kunci inovatif — parameter T (Temperature):**

- $\Delta < 0$: rute baru lebih pendek → selalu diterima (_exploitation_)
- $\Delta \geq 0$: rute baru lebih panjang → diterima dengan probabilitas $e^{-\Delta/T}$ (_exploration_)

Ketika T besar: eksplorasi lebih banyak (keluar dari local optima). Ketika T kecil: lebih eksploitatif.

> Sumber: Tsun, 2020, hal. 348

---

### `[KASUS NYATA]` — TSP dalam Logistik Pengiriman

**Skenario:** Sebuah startup logistik perlu mengoptimalkan rute kurir yang harus mengunjungi 15 titik pengiriman sebelum kembali ke gudang. Dengan $15! \approx 1,3 \times 10^{12}$ kemungkinan rute, brute-force tidak mungkin.

**MCMC bekerja:**

1. Mulai dari rute acak (misalnya urutan alamat sesuai urutan order masuk)
2. Pada setiap iterasi: tukar dua titik pengiriman secara acak
3. Jika rute baru lebih pendek → terima selalu
4. Jika lebih panjang → terima dengan probabilitas $e^{-\Delta/T}$ (untuk keluar dari jebakan lokal)
5. Setelah 50.000 iterasi → hasilnya mendekati rute optimal

**Implikasi bisnis:** Pengurangan 15–20% total jarak tempuh vs rute naif = penghematan bahan bakar signifikan secara kumulatif. Prinsip MCMC ini digunakan di sistem seperti Google Maps route optimization dan platform logistik seperti Lalamove.

---

## SLIDE 14 — TIGA PENDEKATAN: PERBANDINGAN

### Kapan Menggunakan Masing-masing?

| Aspek                | Probability via Simulation                                      | Bloom Filter                                             | MCMC                                                           |
| -------------------- | --------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------- |
| **Tipe masalah**     | Estimasi probabilitas / ekspektasi yang sulit dihitung analitik | Membership check (apakah x ada dalam set?)               | Optimasi kombinatorial yang sulit (NP-Hard)                    |
| **Cara kerja**       | Jalankan banyak percobaan acak → hitung proporsi/rata-rata      | Bit array + hash functions → jawab "yes/maybe" atau "no" | Markov Chain acak → konvergen ke distribusi dengan solusi baik |
| **Output**           | Estimasi probabilitas / nilai ekspektasi                        | TRUE (mungkin false positive) atau FALSE (pasti benar)   | Solusi yang mendekati optimal                                  |
| **Trade-off**        | Akurasi vs waktu komputasi (lebih banyak trial = lebih akurat)  | Ruang kecil vs ada false positive                        | Kecepatan vs optimalitas (tidak garantikan solusi terbaik)     |
| **Contoh dari buku** | Simulasi koin, shuffle array                                    | Google Chrome URL check                                  | Knapsack, TSP                                                  |
| **Contoh nyata**     | Estimasi probabilitas tabrakan hash, ping-pong                  | Cassandra, Bitcoin, Medium                               | Logistik pengiriman, alokasi resource                          |

**Benang merah:** Ketiga teknik ini menggunakan **keacakan (randomness)** secara cerdas untuk menyelesaikan masalah yang secara deterministik sulit atau mahal.

---

## SLIDE 15 — KESIMPULAN

### Yang Telah Kita Pelajari Hari Ini

✅ **Probability via Simulation** — probabilitas = proporsi jangka panjang; komputer bisa mensimulasikan jutaan percobaan dalam detik untuk mengestimasi nilai yang sulit dihitung analitik  
_(Contoh buku: rata-rata lemparan koin p=1/3; shuffle 100 elemen → estimasi probabilitas tepat 13 fixed)_

✅ **Bloom Filter** — struktur data probabilistik: bit array + k hash functions; selalu benar untuk "tidak ada", bisa false positive untuk "ada"; hemat ruang ~60× dibanding Set  
_(Contoh buku: Google Chrome URL check — 200 MB → 3,375 MB; formula FPR: $(1-(1-1/m)^n)^k$)_

✅ **Markov Chain** — DTSP dengan Markov property (masa depan hanya bergantung pada keadaan sekarang) dan stationary transitions; direpresentasikan oleh Transition Probability Matrix (TPM)  
_(Contoh nyata: model perilaku pengguna streaming — Watching/Browsing/Exit)_

✅ **MCMC** — gunakan Markov Chain untuk sampling dari distribusi sulit atau optimasi NP-Hard; states = solusi; transitions mengarah ke solusi lebih baik; jalankan banyak iterasi sampai konvergen  
_(Contoh buku: Knapsack — flip item acak; TSP — swap kota dengan parameter temperature T)_

✅ **Prinsip umum** — keacakan bukan kelemahan; digunakan secara cerdas, ia menghasilkan algoritma yang elegan, hemat ruang, dan bekerja baik dalam praktik meskipun tidak menjamin optimalitas absolut

> Semua definisi, algoritma, dan contoh bersumber dari: Tsun, _Probability & Statistics with Applications to Computing_, 2020, Sections 9.2, 9.4, 9.6

---

## SLIDE 16 — REFLEKSI & KUIS

### Refleksi

**❓ Pertanyaan 1 (Konseptual)**  
Bloom Filter selalu benar jika mengatakan URL "tidak ada", tapi bisa salah (false positive) jika mengatakan URL "ada". Dalam konteks Google Chrome yang mengecek URL berbahaya, mengapa false positive _dapat ditoleransi_ tapi false negative _tidak bisa ditoleransi_? Jelaskan konsekuensi dari masing-masing jenis kesalahan.

**❓ Pertanyaan 2 (Terapan — simulasi)**  
Anda ingin mengestimasi probabilitas mendapat setidaknya satu angka 6 dari 3 lemparan dadu adil. Nilai analitiknya: $1 - (5/6)^3 \approx 0{,}421$.  
Tuliskan pseudocode (dalam Python atau bahasa apapun) untuk mengestimasi probabilitas ini via simulasi dengan 10.000 percobaan. Berapa nilai yang Anda harapkan dari output?

**❓ Pertanyaan 3 (Kritis)**  
MCMC untuk TSP menggunakan parameter "temperature" T yang mengizinkan transisi ke solusi _lebih buruk_ dengan probabilitas $e^{-\Delta/T}$. Mengapa menerima solusi yang lebih buruk sesekali justru membantu menemukan solusi yang lebih baik secara keseluruhan? Hubungkan jawaban Anda dengan konsep _local optimum_ vs _global optimum_.

---

### Kasus Nyata yang Digunakan dalam Slide Ini

| Slide | Kasus                                              | Domain                   |
| ----- | -------------------------------------------------- | ------------------------ |
| 4     | Birthday problem & collision detection password    | Cybersecurity            |
| 5     | Estimasi rata-rata baca dokumen per resolusi tiket | SaaS / Support Analytics |
| 9     | Tabel penggunaan Bloom Filter di industri          | Lintas domain            |
| 10    | Model Markov perilaku pengguna streaming           | Product Analytics        |
| 12    | Alokasi microservices di server cloud (Knapsack)   | Cloud Engineering        |
| 13    | Optimasi rute pengiriman kurir (TSP)               | Logistics Tech           |
