import { useMemo, useState } from "react";
import { BlockMath } from "react-katex";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DerivationPanel } from "../../components/DerivationPanel";
import { ModuleCard } from "../../components/ModuleCard";
import {
  mulberry32,
  normalInverseCDF,
  oneSampleZProportion,
  pValueFromZ,
} from "../../utils/mathUtils";
import { cssVar } from "../../utils/themeColors";

const N_LOG_MIN = 2; // 10^2 = 100
const N_LOG_MAX = 6; // 10^6 = 1,000,000

// Practical-significance threshold for the conversion-rate effect (Δ in
// proportion units). The slide-13 example uses ~0.01% as the "not meaningful"
// scale; we set the default well below typical product thresholds.
const PRACTICAL_THRESHOLD = 0.005;

export function PValueDrawbacks() {
  const [logN, setLogN] = useState(4); // 10,000
  const [delta, setDelta] = useState(0.001); // tiny effect: 0.1 percentage point
  const [p0, setP0] = useState(0.05);
  const [pHack, setPHack] = useState({
    K: 1000,
    maxN: 200,
    runCounter: 0,
  });

  const colors = useMemo(
    () => ({
      grid: cssVar("--border"),
      curve: cssVar("--chart-1"),
      threshold: cssVar("--chart-2"),
      marker: cssVar("--chart-4"),
      bad: cssVar("--destructive"),
      good: cssVar("--chart-5"),
    }),
    [],
  );

  // ── Sub-demo 1: n-effect ─────────────────────────────────────────────────
  const { nNow, zNow, pNow, statSig, practSig, table, curve } = useMemo(() => {
    const nNow = Math.round(Math.pow(10, logN));
    const p1 = p0 + delta;
    const sigma0 = Math.sqrt((p0 * (1 - p0)) / nNow);
    const zNow = sigma0 > 0 ? (p1 - p0) / sigma0 : NaN;
    const pNow = pValueFromZ(zNow, "two");
    const statSig = Number.isFinite(pNow) && pNow < 0.05;
    const practSig = Math.abs(delta) >= PRACTICAL_THRESHOLD;

    const tableNs = [100, 1_000, 10_000, 100_000, 1_000_000];
    const table = tableNs.map((nn) => {
      const s0 = Math.sqrt((p0 * (1 - p0)) / nn);
      const z = s0 > 0 ? delta / s0 : NaN;
      const p = pValueFromZ(z, "two");
      return {
        n: nn,
        z,
        p,
        statSig: Number.isFinite(p) && p < 0.05,
      };
    });

    const points = 60;
    const curve = Array.from({ length: points }, (_, i) => {
      const lN = N_LOG_MIN + ((N_LOG_MAX - N_LOG_MIN) * i) / (points - 1);
      const nn = Math.pow(10, lN);
      const s0 = Math.sqrt((p0 * (1 - p0)) / nn);
      const z = s0 > 0 ? delta / s0 : NaN;
      const p = pValueFromZ(z, "two");
      return { n: nn, p: Math.max(p, 1e-300) };
    });
    return { nNow, zNow, pNow, statSig, practSig, table, curve };
  }, [logN, delta, p0]);

  // ── Sub-demo 2: optional stopping / p-hacking ───────────────────────────
  const pHackResult = useMemo(() => {
    const { K, maxN, runCounter } = pHack;
    const seed = 7919 + runCounter * 1009;
    const rng = mulberry32(seed);
    // Each of K experiments: simulate Bernoulli(p0) with cumulative-checking
    // after every step; if at any point a two-sided z-test gives p<0.05,
    // record that as a (false-positive) early stop.
    let earlyStops = 0;
    let singleShotFP = 0;
    // pre-compute z critical value for two-sided alpha=0.05 for speed.
    const zCrit = normalInverseCDF(1 - 0.025); // ≈ 1.96
    for (let i = 0; i < K; i++) {
      let k = 0;
      let stopped = false;
      // Start peeking from n=10 to skip ill-defined CLT region
      const minPeek = 10;
      for (let n = 1; n <= maxN; n++) {
        if (rng() < p0) k += 1;
        if (n >= minPeek && !stopped) {
          const { z } = oneSampleZProportion(k, n, p0);
          if (Number.isFinite(z) && Math.abs(z) > zCrit) {
            stopped = true;
            earlyStops += 1;
          }
        }
      }
      // Single-shot test at the final n
      const finalZ = oneSampleZProportion(k, maxN, p0).z;
      if (Number.isFinite(finalZ) && Math.abs(finalZ) > zCrit) singleShotFP += 1;
    }
    return {
      K,
      maxN,
      earlyStops,
      earlyStopsPct: (earlyStops / K) * 100,
      singleShotFP,
      singleShotPct: (singleShotFP / K) * 100,
    };
  }, [pHack, p0]);

  const matrixVerdict = useMemo(() => {
    if (statSig && practSig) return { label: "Ideal ✅", tone: "good" as const };
    if (statSig && !practSig) return { label: "Hati-hati ⚠️", tone: "warn" as const };
    if (!statSig && practSig)
      return { label: "Butuh lebih banyak data", tone: "info" as const };
    return { label: "Tidak perlu ditindaklanjuti", tone: "neutral" as const };
  }, [statSig, practSig]);

  return (
    <ModuleCard
      moduleNumber={4}
      totalModules={4}
      title="Kelemahan P-Value: n-Effect, P-Hacking, dan Practical Significance"
      distribution="Pedagogi — bukan uji"
      context={
        <p>
          <strong>Kasus:</strong> P-value adalah alat yang kuat, tapi mudah
          disalahgunakan. Modul ini mendemonstrasikan tiga kelemahan utama:
          (1) p-value bergantung pada n, bukan effect size; (2) optional
          stopping (p-hacking) menggelembungkan false-positive rate; (3)
          statistical ≠ practical significance.
        </p>
      }
    >
      {/* ── Sub-demo 1 ──────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Sub-demo 1: n-Effect — p bisa kecil walau efek tidak bermakna
        </h4>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="pd-logn"
              className="flex items-baseline justify-between text-sm font-semibold text-foreground"
            >
              <span>n (log-scale)</span>
              <span className="font-mono text-primary">
                {nNow.toLocaleString()}
              </span>
            </label>
            <input
              id="pd-logn"
              type="range"
              min={N_LOG_MIN}
              max={N_LOG_MAX}
              step={0.01}
              value={logN}
              onChange={(e) => setLogN(parseFloat(e.target.value))}
              className="mt-2 w-full accent-primary"
            />
          </div>
          <div>
            <label
              htmlFor="pd-delta"
              className="flex items-baseline justify-between text-sm font-semibold text-foreground"
            >
              <span>δ — selisih proporsi</span>
              <span className="font-mono text-primary">{delta.toFixed(4)}</span>
            </label>
            <input
              id="pd-delta"
              type="range"
              min={0}
              max={0.05}
              step={0.0001}
              value={delta}
              onChange={(e) => setDelta(parseFloat(e.target.value))}
              className="mt-2 w-full accent-primary"
            />
          </div>
          <div>
            <label
              htmlFor="pd-p0"
              className="flex items-baseline justify-between text-sm font-semibold text-foreground"
            >
              <span>p₀ — baseline</span>
              <span className="font-mono text-primary">{p0.toFixed(2)}</span>
            </label>
            <input
              id="pd-p0"
              type="range"
              min={0.01}
              max={0.5}
              step={0.01}
              value={p0}
              onChange={(e) => setP0(parseFloat(e.target.value))}
              className="mt-2 w-full accent-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="n" value={nNow.toLocaleString()} />
          <Stat label="Z" value={Number.isFinite(zNow) ? zNow.toFixed(3) : "—"} />
          <Stat label="p-value" value={Number.isFinite(pNow) ? pNow.toExponential(3) : "—"} highlight />
          <Stat
            label={`Δ ≥ ${PRACTICAL_THRESHOLD}?`}
            value={practSig ? "Praktis" : "Tidak praktis"}
            highlight
          />
        </div>

        <div className="overflow-hidden rounded-md border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-3 py-2 font-semibold text-muted-foreground">n</th>
                <th className="px-3 py-2 font-semibold text-muted-foreground">Z</th>
                <th className="px-3 py-2 font-semibold text-muted-foreground">p-value</th>
                <th className="px-3 py-2 font-semibold text-muted-foreground">Statistical?</th>
                <th className="px-3 py-2 font-semibold text-muted-foreground">Practical?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {table.map((row) => (
                <tr key={row.n}>
                  <td className="px-3 py-2 font-mono text-foreground">
                    {row.n.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-mono text-foreground">
                    {Number.isFinite(row.z) ? row.z.toFixed(3) : "—"}
                  </td>
                  <td className="px-3 py-2 font-mono text-foreground">
                    {Number.isFinite(row.p) ? row.p.toExponential(2) : "—"}
                  </td>
                  <td
                    className="px-3 py-2 font-semibold"
                    style={{ color: row.statSig ? colors.bad : colors.good }}
                  >
                    {row.statSig ? "Signifikan (p<0.05)" : "Tidak signifikan"}
                  </td>
                  <td
                    className="px-3 py-2 font-semibold"
                    style={{ color: practSig ? colors.good : colors.threshold }}
                  >
                    {practSig
                      ? `Δ = ${delta.toFixed(4)} ≥ ${PRACTICAL_THRESHOLD}`
                      : `Δ = ${delta.toFixed(4)} < ${PRACTICAL_THRESHOLD}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">
            Bagaimana p-value runtuh saat n membesar (δ = {delta.toFixed(4)})
          </p>
          <div className="h-60 w-full" style={{ minWidth: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={curve}
                margin={{ top: 16, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                <XAxis
                  dataKey="n"
                  type="number"
                  scale="log"
                  domain={[Math.pow(10, N_LOG_MIN), Math.pow(10, N_LOG_MAX)]}
                  tickFormatter={(v) => Number(v).toExponential(0)}
                  label={{ value: "n (log)", position: "insideBottom", offset: -2 }}
                />
                <YAxis
                  scale="log"
                  domain={[1e-20, 1]}
                  tickFormatter={(v) => Number(v).toExponential(0)}
                  width={70}
                />
                <Tooltip
                  formatter={(v) => Number(v).toExponential(2)}
                  labelFormatter={(v) => `n = ${Number(v).toFixed(0)}`}
                />
                <Line
                  type="monotone"
                  dataKey="p"
                  stroke={colors.curve}
                  strokeWidth={2}
                  dot={false}
                  name="p-value(n)"
                />
                <ReferenceLine
                  y={0.05}
                  stroke={colors.threshold}
                  strokeDasharray="4 4"
                  label={{
                    value: "α = 0.05",
                    position: "insideTopRight",
                    fill: colors.threshold,
                    fontSize: 11,
                  }}
                />
                <ReferenceLine
                  x={nNow}
                  stroke={colors.marker}
                  strokeDasharray="3 3"
                  label={{
                    value: `n = ${nNow.toLocaleString()}`,
                    position: "top",
                    fill: colors.marker,
                    fontSize: 11,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── Sub-demo 2 ──────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Sub-demo 2: P-Hacking / Optional Stopping
        </h4>

        <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Simulasi: jalankan {pHackResult.K} eksperimen Bernoulli(p₀={p0.toFixed(2)})
          dengan H₀ benar (δ = 0). Pada "peeking", tester mengecek p setiap
          observasi dan berhenti begitu p &lt; 0.05. Bandingkan rate
          false-positive vs uji single-shot di akhir.
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="ph-K"
              className="flex items-baseline justify-between text-sm font-semibold text-foreground"
            >
              <span>K eksperimen</span>
              <span className="font-mono text-primary">{pHack.K}</span>
            </label>
            <input
              id="ph-K"
              type="range"
              min={200}
              max={3000}
              step={100}
              value={pHack.K}
              onChange={(e) =>
                setPHack((s) => ({ ...s, K: parseInt(e.target.value, 10) }))
              }
              className="mt-2 w-full accent-primary"
            />
          </div>
          <div>
            <label
              htmlFor="ph-maxN"
              className="flex items-baseline justify-between text-sm font-semibold text-foreground"
            >
              <span>n maksimum per eksperimen</span>
              <span className="font-mono text-primary">{pHack.maxN}</span>
            </label>
            <input
              id="ph-maxN"
              type="range"
              min={50}
              max={500}
              step={10}
              value={pHack.maxN}
              onChange={(e) =>
                setPHack((s) => ({ ...s, maxN: parseInt(e.target.value, 10) }))
              }
              className="mt-2 w-full accent-primary"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() =>
                setPHack((s) => ({ ...s, runCounter: s.runCounter + 1 }))
              }
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              🎲 Jalankan Ulang
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            label="Single-shot FPR"
            value={`${pHackResult.singleShotPct.toFixed(1)}%`}
          />
          <Stat label="Diharapkan" value="≈ 5.0%" />
          <Stat
            label="Optional-stopping FPR"
            value={`${pHackResult.earlyStopsPct.toFixed(1)}%`}
            highlight
          />
          <Stat
            label="Faktor inflasi"
            value={`${
              pHackResult.singleShotPct > 0
                ? (
                    pHackResult.earlyStopsPct / pHackResult.singleShotPct
                  ).toFixed(2)
                : "∞"
            }×`}
            highlight
          />
        </div>

        <div className="rounded-md border border-border bg-muted px-4 py-3 text-xs text-muted-foreground">
          Ketika H₀ benar, single-shot test harus menolak ~5% dari waktu. Tapi
          "peeking" setiap observasi sampai p &lt; 0.05 menggelembungkan FPR
          jauh di atas 5% — inilah <strong>p-hacking via optional stopping</strong>.
          Itu sebabnya batas waktu eksperimen harus ditetapkan{" "}
          <em>sebelum</em> data dikumpulkan.
        </div>
      </section>

      <DerivationPanel>
        <p className="font-semibold">
          Step 1 — Definisi p-value & familywise error (Tsun, 2020, hal. 309–310):
        </p>
        <BlockMath
          math={String.raw`p = P(\text{data seekstrem ini} \mid H_0 \text{ benar}),\quad FWER = P(\text{≥1 false positive di antara } m \text{ uji})`}
        />

        <p className="font-semibold">Step 2 — Parameter sub-demo n-effect:</p>
        <BlockMath
          math={String.raw`p_0 = ${p0},\, \delta = ${delta.toFixed(4)},\, n = ${nNow},\, p_1 = p_0 + \delta = ${(p0 + delta).toFixed(4)}`}
        />

        <p className="font-semibold">Step 3 — Substitusi (Z untuk proporsi):</p>
        <BlockMath
          math={String.raw`Z = \frac{p_1 - p_0}{\sqrt{p_0(1-p_0)/n}} = \frac{${delta.toFixed(4)}}{\sqrt{${(p0 * (1 - p0)).toFixed(4)}/${nNow}}} = ${Number.isFinite(zNow) ? zNow.toFixed(3) : "\\text{NaN}"}`}
        />

        <p className="font-semibold">Step 4 — Hasil & verdict matrix:</p>
        <BlockMath
          math={String.raw`p_{\text{two-sided}} = ${Number.isFinite(pNow) ? pNow.toExponential(3) : "\\text{NaN}"} \;\Rightarrow\; \text{statistik: } ${statSig ? "\\text{signifikan}" : "\\text{tidak signifikan}"}`}
        />
        <p className="font-sans text-foreground">
          Pelajaran utama:{" "}
          <strong>p-value bergantung pada n</strong>. Effect size yang sama
          dapat memberikan p ≈ 0.3 pada n = 100 dan p ≈ 0 pada n = 1.000.000.
          Selalu laporkan effect size, bukan hanya p.
        </p>
      </DerivationPanel>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">
          Matriks 2×2: Statistical vs Practical Significance (live)
        </p>
        <div className="overflow-hidden rounded-md border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2 font-semibold text-muted-foreground" />
                <th className="px-4 py-2 font-semibold text-muted-foreground">
                  Statistis Signifikan (p &lt; 0.05)
                </th>
                <th className="px-4 py-2 font-semibold text-muted-foreground">
                  Tidak Statistis Signifikan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-2 font-semibold text-foreground">
                  Praktis Signifikan (δ ≥ {PRACTICAL_THRESHOLD})
                </td>
                <td
                  className="px-4 py-2"
                  style={{
                    backgroundColor:
                      statSig && practSig ? `${colors.good}33` : undefined,
                  }}
                >
                  Ideal ✅
                </td>
                <td
                  className="px-4 py-2"
                  style={{
                    backgroundColor:
                      !statSig && practSig ? `${colors.threshold}33` : undefined,
                  }}
                >
                  Butuh lebih banyak data
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-semibold text-foreground">
                  Tidak Praktis Signifikan
                </td>
                <td
                  className="px-4 py-2"
                  style={{
                    backgroundColor:
                      statSig && !practSig ? `${colors.bad}33` : undefined,
                  }}
                >
                  Hati-hati ⚠️
                </td>
                <td
                  className="px-4 py-2"
                  style={{
                    backgroundColor:
                      !statSig && !practSig ? `${colors.grid}33` : undefined,
                  }}
                >
                  Tidak perlu ditindaklanjuti
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-sm font-semibold text-foreground">
          Verdict pada konfigurasi saat ini:{" "}
          <span
            style={{
              color:
                matrixVerdict.tone === "good"
                  ? colors.good
                  : matrixVerdict.tone === "warn"
                    ? colors.bad
                    : matrixVerdict.tone === "info"
                      ? colors.threshold
                      : colors.marker,
            }}
          >
            {matrixVerdict.label}
          </span>
        </p>
      </div>

      <div className="rounded-md border border-border bg-muted px-4 py-3 text-xs text-muted-foreground">
        Sumber: Tsun, 2020, hal. 305–310 (definisi p-value & prosedur 8.3.3);
        slide 12–13 minggu 13 (drawback table & 2×2 matrix). Ambang Δ ≥{" "}
        {PRACTICAL_THRESHOLD} adalah heuristik pedagogis — di praktiknya effect
        size yang "berarti" ditentukan oleh domain bisnis, bukan statistik.
      </div>
    </ModuleCard>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-md border px-3 py-2",
        highlight
          ? "border-primary/30 bg-primary/10"
          : "border-border bg-muted",
      ].join(" ")}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={[
          "mt-0.5 font-mono text-lg font-semibold",
          highlight ? "text-primary" : "text-foreground",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}
