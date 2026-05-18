import { useMemo, useState } from "react";
import { BlockMath, InlineMath } from "react-katex";
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
import { mulberry32 } from "../../utils/mathUtils";
import { cssVar } from "../../utils/themeColors";

type Scenario = "geometric" | "fixedPoints" | "atLeastOneSix";

const SCENARIOS: {
  id: Scenario;
  label: string;
  short: string;
}[] = [
  {
    id: "geometric",
    label: "(a) Lemparan sampai sukses — Geometric(p)",
    short: "Geometric",
  },
  {
    id: "fixedPoints",
    label: "(b) Tepat 13 fixed points dalam shuffle 100",
    short: "Shuffle 100",
  },
  {
    id: "atLeastOneSix",
    label: "(c) Setidaknya satu 6 dalam 3 lemparan dadu",
    short: "Tiga dadu",
  },
];

const N_MIN = 10;
const N_MAX = 100_000;
const MAX_CHART_POINTS = 500;

// Log-slider: t ∈ [0, 100] → n ∈ [10, 100000]
const tToN = (t: number) => Math.round(Math.pow(10, 1 + (4 * t) / 100));
const nToT = (n: number) =>
  Math.max(0, Math.min(100, ((Math.log10(n) - 1) / 4) * 100));

function fisherYatesShuffleCount(n: number, rng: () => number): number {
  const arr = new Array(n);
  for (let i = 0; i < n; i++) arr[i] = i + 1;
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  let fixed = 0;
  for (let i = 0; i < n; i++) if (arr[i] === i + 1) fixed += 1;
  return fixed;
}

export function ProbabilityViaSimulation() {
  const [scenario, setScenario] = useState<Scenario>("geometric");
  const [nTrials, setNTrials] = useState(5000);
  const [p, setP] = useState(1 / 3);
  const [runCounter, setRunCounter] = useState(0);

  const colors = useMemo(
    () => ({
      grid: cssVar("--border"),
      sim: cssVar("--chart-1"),
      truth: cssVar("--chart-2"),
    }),
    [],
  );

  // Analytic value depends on scenario.
  const analytic = useMemo(() => {
    if (scenario === "geometric") return 1 / p;
    if (scenario === "atLeastOneSix") return 1 - Math.pow(5 / 6, 3);
    // Fixed-points: known limit ≈ e^{-1}/13! by Poisson approximation. We do
    // not rely on this for "truth"; the chart references the simulator's own
    // long-run value. Use the Poisson(1) approximation as a reference.
    return Math.exp(-1) / 6227020800; // 13! = 6227020800
  }, [scenario, p]);

  const yLabel = scenario === "geometric" ? "E[X]" : "P(E)";
  const truthLabel =
    scenario === "geometric"
      ? `1/p = ${analytic.toFixed(3)}`
      : scenario === "atLeastOneSix"
        ? `1 − (5/6)³ = ${analytic.toFixed(4)}`
        : `e⁻¹/13! ≈ ${analytic.toExponential(3)}`;

  // Run the simulation. Recomputes on scenario / nTrials / p / runCounter.
  const { estimate, absError, curve, samplesPreview } = useMemo(() => {
    const seed = 1337 + runCounter * 2654435761;
    const rng = mulberry32(seed);
    const stride = Math.max(1, Math.floor(nTrials / MAX_CHART_POINTS));
    const curve: { trial: number; estimate: number }[] = [];
    const samplesPreview: number[] = [];
    let acc = 0;
    for (let t = 1; t <= nTrials; t++) {
      let outcome: number;
      if (scenario === "geometric") {
        // Count flips until first success with probability p.
        let flips = 0;
        // Guard against pathological tiny p: cap at 1e6 flips.
        const cap = 1_000_000;
        while (flips < cap) {
          flips += 1;
          if (rng() < p) break;
        }
        outcome = flips;
      } else if (scenario === "fixedPoints") {
        const fixed = fisherYatesShuffleCount(100, rng);
        outcome = fixed === 13 ? 1 : 0;
      } else {
        // atLeastOneSix: roll 3 dice, success if any equals 6.
        let any6 = 0;
        for (let i = 0; i < 3; i++) {
          const r = Math.floor(rng() * 6) + 1;
          if (r === 6) any6 = 1;
        }
        outcome = any6;
      }
      acc += outcome;
      if (samplesPreview.length < 12) samplesPreview.push(outcome);
      if (t % stride === 0 || t === nTrials) {
        curve.push({ trial: t, estimate: acc / t });
      }
    }
    const finalEstimate = acc / nTrials;
    return {
      estimate: finalEstimate,
      absError: Math.abs(finalEstimate - analytic),
      curve,
      samplesPreview,
    };
  }, [scenario, nTrials, p, runCounter, analytic]);

  return (
    <ModuleCard
      moduleNumber={1}
      totalModules={3}
      title="Probability via Simulation — Estimasi Tanpa Rumus Analitik"
      distribution="Monte Carlo · PRNG mulberry32"
      context={
        <p>
          <strong>Kasus:</strong> Beberapa probabilitas sulit dihitung dengan
          rumus tertutup. Sebagai computer scientist, kita dapat
          mensimulasikan percobaan secara berulang dan mengambil proporsi
          jangka panjang sebagai estimasi (Tsun, 2020, hal. 312).
        </p>
      }
    >
      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">Skenario</p>
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setScenario(s.id)}
              className={[
                "rounded-md border px-3 py-1.5 text-xs font-semibold shadow-sm",
                scenario === s.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary hover:bg-primary/10",
              ].join(" ")}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="pvs-ntrials"
            className="flex items-baseline justify-between text-sm font-semibold text-foreground"
          >
            <span>n_trials (skala log)</span>
            <span className="font-mono text-primary">
              {nTrials.toLocaleString()}
            </span>
          </label>
          <input
            id="pvs-ntrials"
            type="range"
            min={0}
            max={100}
            step={1}
            value={nToT(nTrials)}
            onChange={(e) => setNTrials(tToN(parseInt(e.target.value, 10)))}
            className="mt-2 w-full accent-primary"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Range: {N_MIN.toLocaleString()} – {N_MAX.toLocaleString()}
          </p>
        </div>
        {scenario === "geometric" && (
          <div>
            <label
              htmlFor="pvs-p"
              className="flex items-baseline justify-between text-sm font-semibold text-foreground"
            >
              <span>p — probabilitas sukses</span>
              <span className="font-mono text-primary">{p.toFixed(3)}</span>
            </label>
            <input
              id="pvs-p"
              type="range"
              min={0.05}
              max={0.95}
              step={0.01}
              value={p}
              onChange={(e) => setP(parseFloat(e.target.value))}
              className="mt-2 w-full accent-primary"
            />
          </div>
        )}
        <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setRunCounter((c) => c + 1)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            🎲 Jalankan Ulang
          </button>
          <p className="text-xs text-muted-foreground">
            PRNG seed = 1337 + run·2654435761 (deterministik per "Jalankan
            Ulang").
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label={`Estimasi ${yLabel}`}
          value={
            scenario === "geometric"
              ? estimate.toFixed(3)
              : estimate.toFixed(5)
          }
          highlight
        />
        <Stat
          label={`Analitik ${yLabel}`}
          value={
            scenario === "geometric"
              ? analytic.toFixed(3)
              : scenario === "atLeastOneSix"
                ? analytic.toFixed(5)
                : analytic.toExponential(3)
          }
        />
        <Stat label="|error|" value={absError.toExponential(2)} />
        <Stat label="n_trials" value={nTrials.toLocaleString()} />
      </div>

      <DerivationPanel>
        <p className="font-semibold">
          Step 1 — Definisi (Tsun, 2020, hal. 312):
        </p>
        <BlockMath
          math={String.raw`P(E) = \lim_{N \to \infty} \frac{\#\{\text{percobaan di mana }E\text{ terjadi}\}}{N}`}
        />
        {scenario === "geometric" && (
          <BlockMath
            math={String.raw`X \sim \mathrm{Geometric}(p) \implies \mathbb{E}[X] = \frac{1}{p}\quad(\text{Tsun, 2020, hal. 313})`}
          />
        )}
        {scenario === "atLeastOneSix" && (
          <BlockMath
            math={String.raw`P(\text{tidak satupun 6 dalam 3 lemparan}) = \left(\tfrac{5}{6}\right)^3 \implies P(\geq 1\text{ enam}) = 1 - \left(\tfrac{5}{6}\right)^3`}
          />
        )}
        {scenario === "fixedPoints" && (
          <BlockMath
            math={String.raw`P(\text{tepat 13 fixed points dalam shuffle } n{=}100) \approx \frac{e^{-1}}{13!}\quad(\text{Poisson approx., Tsun, 2020, hal. 314})`}
          />
        )}

        <p className="font-semibold">Step 2 — Parameter simulasi:</p>
        {scenario === "geometric" && (
          <BlockMath
            math={String.raw`p = ${p.toFixed(3)},\quad N = ${nTrials},\quad \tfrac{1}{p} = ${(1 / p).toFixed(3)}`}
          />
        )}
        {scenario === "atLeastOneSix" && (
          <BlockMath
            math={String.raw`\text{3 lemparan dadu adil},\quad N = ${nTrials},\quad 1 - (5/6)^3 = ${analytic.toFixed(5)}`}
          />
        )}
        {scenario === "fixedPoints" && (
          <BlockMath
            math={String.raw`\text{shuffle array}~[1,\ldots,100],\quad N = ${nTrials}`}
          />
        )}

        <p className="font-semibold">Step 3 — Substitusi (pseudocode):</p>
        {scenario === "geometric" && (
          <BlockMath
            math={String.raw`\hat{\mathbb{E}}[X] = \frac{1}{N}\sum_{t=1}^{N} \mathrm{flips}_t = \frac{1}{${nTrials}}\sum_{t=1}^{${nTrials}} \mathrm{flips}_t`}
          />
        )}
        {scenario === "atLeastOneSix" && (
          <BlockMath
            math={String.raw`\hat{P}(E) = \frac{1}{N}\sum_{t=1}^{N} \mathbb{1}[\text{ada 6}]_t = \frac{\#\text{sukses}}{${nTrials}}`}
          />
        )}
        {scenario === "fixedPoints" && (
          <BlockMath
            math={String.raw`\hat{P}(E) = \frac{1}{N}\sum_{t=1}^{N} \mathbb{1}[\text{fixed}_t = 13] = \frac{\#\text{sukses}}{${nTrials}}`}
          />
        )}

        <p className="font-semibold">Step 4 — Hasil:</p>
        <BlockMath
          math={String.raw`\hat{${scenario === "geometric" ? String.raw`\mathbb{E}[X]` : "P"}} = ${
            scenario === "geometric"
              ? estimate.toFixed(3)
              : estimate.toFixed(5)
          },\quad |\,\hat{\cdot} - \text{analitik}\,| = ${absError.toExponential(2)}`}
        />
        <p className="font-sans text-foreground">
          Semakin besar <code>n_trials</code>, semakin kecil error (laju{" "}
          <InlineMath math={String.raw`\mathcal{O}(1/\sqrt{N})`} /> dari Hukum
          Bilangan Besar). Coba slider — dari 10 ke 100.000 — dan amati
          konvergensi pada grafik di bawah.
        </p>
      </DerivationPanel>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">
          Konvergensi: estimasi berjalan vs nomor percobaan
        </p>
        <div className="h-72 w-full" style={{ minWidth: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={curve}
              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis
                dataKey="trial"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(v) => Number(v).toLocaleString()}
                label={{
                  value: "trial t",
                  position: "insideBottom",
                  offset: -2,
                }}
              />
              <YAxis
                tickFormatter={(v) =>
                  scenario === "geometric"
                    ? Number(v).toFixed(2)
                    : Number(v).toFixed(3)
                }
                width={60}
              />
              <Tooltip
                formatter={(v) =>
                  scenario === "geometric"
                    ? Number(v).toFixed(4)
                    : Number(v).toFixed(5)
                }
                labelFormatter={(v) => `t = ${Number(v).toLocaleString()}`}
              />
              <Line
                type="monotone"
                dataKey="estimate"
                stroke={colors.sim}
                strokeWidth={2}
                dot={false}
                name={`estimasi ${yLabel}`}
                isAnimationActive={false}
              />
              <ReferenceLine
                y={analytic}
                stroke={colors.truth}
                strokeDasharray="5 5"
                label={{
                  value: truthLabel,
                  position: "right",
                  fill: colors.truth,
                  fontSize: 11,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Garis hijau putus-putus = nilai analitik. Garis biru = estimasi
          berjalan setelah t percobaan. Estimasi konvergen ke nilai analitik
          sesuai Hukum Bilangan Besar.
        </p>
      </div>

      <div className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-foreground">
        <p className="font-semibold">
          12 sampel pertama dari run ini:
        </p>
        <p className="mt-1 font-mono text-xs">
          [{samplesPreview.join(", ")}
          {nTrials > samplesPreview.length ? ", …" : ""}]
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {scenario === "geometric"
            ? "Setiap sampel = jumlah lemparan sampai kepala pertama muncul."
            : scenario === "atLeastOneSix"
              ? "Setiap sampel = 1 jika setidaknya satu 6 dari 3 dadu, 0 jika tidak."
              : "Setiap sampel = 1 jika tepat 13 elemen tetap di posisi awalnya setelah shuffle, 0 jika tidak."}
        </p>
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
