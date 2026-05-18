import { useMemo, useState } from "react";
import { BlockMath } from "react-katex";
import { DerivationPanel } from "../../components/DerivationPanel";
import { ModuleCard } from "../../components/ModuleCard";
import { bernoulliCI, mulberry32 } from "../../utils/mathUtils";
import { cssVar } from "../../utils/themeColors";

const LEVELS = [
  { label: "80%", value: 0.8, z: 1.282 },
  { label: "90%", value: 0.9, z: 1.645 },
  { label: "95%", value: 0.95, z: 1.96 },
  { label: "99%", value: 0.99, z: 2.576 },
] as const;
type LevelValue = (typeof LEVELS)[number]["value"];

export function CIInterpretationSimulator() {
  const [theta, setTheta] = useState(0.5);
  const [n, setN] = useState(100);
  const [K, setK] = useState(100);
  const [level, setLevel] = useState<LevelValue>(0.95);
  const [runCounter, setRunCounter] = useState(0);

  const colors = useMemo(
    () => ({
      hit: cssVar("--chart-5"),
      miss: cssVar("--destructive"),
      truth: cssVar("--chart-2"),
    }),
    [],
  );

  const levelMeta = LEVELS.find((l) => l.value === level)!;
  const z = levelMeta.z;
  const levelPct = Math.round(level * 100);

  const { trials, hitCount, hitPct } = useMemo(() => {
    const seed = 1000 + runCounter * 7919;
    const rng = mulberry32(seed);
    const trials = Array.from({ length: K }, () => {
      let successes = 0;
      for (let j = 0; j < n; j++) {
        if (rng() < theta) successes += 1;
      }
      const ci = bernoulliCI(successes, n, z);
      return {
        thetaHat: ci.thetaHat,
        lower: ci.lower,
        upper: ci.upper,
        contains: theta >= ci.lower && theta <= ci.upper,
      };
    });
    const hitCount = trials.filter((t) => t.contains).length;
    const hitPct = (hitCount / K) * 100;
    return { trials, hitCount, hitPct };
  }, [theta, n, K, z, runCounter]);

  const expectedPct = levelPct;
  const barHeightPct = 100 / K;

  return (
    <ModuleCard
      moduleNumber={3}
      totalModules={4}
      title="Interpretation Simulator: Apa Artinya '95% Confident'?"
      distribution="Monte Carlo CI"
      context={
        <p>
          <strong>Kasus:</strong> Simulasikan prosedur survei berulang kali —
          dengan θ yang sebenarnya <em>diketahui</em> — lalu hitung berapa
          persen interval yang benar-benar mengandung θ. Ini membongkar
          miskonsepsi paling umum tentang CI.
        </p>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label
            htmlFor="cis-theta"
            className="flex items-baseline justify-between text-sm font-semibold text-foreground"
          >
            <span>θ sesungguhnya</span>
            <span className="font-mono text-primary">{theta.toFixed(2)}</span>
          </label>
          <input
            id="cis-theta"
            type="range"
            min={0.05}
            max={0.95}
            step={0.01}
            value={theta}
            onChange={(e) => setTheta(parseFloat(e.target.value))}
            className="mt-2 w-full accent-primary"
          />
        </div>
        <div>
          <label
            htmlFor="cis-n"
            className="flex items-baseline justify-between text-sm font-semibold text-foreground"
          >
            <span>n per sampel</span>
            <span className="font-mono text-primary">{n}</span>
          </label>
          <input
            id="cis-n"
            type="range"
            min={30}
            max={500}
            step={5}
            value={n}
            onChange={(e) => setN(parseInt(e.target.value, 10))}
            className="mt-2 w-full accent-primary"
          />
        </div>
        <div>
          <label
            htmlFor="cis-K"
            className="flex items-baseline justify-between text-sm font-semibold text-foreground"
          >
            <span>K trial</span>
            <span className="font-mono text-primary">{K}</span>
          </label>
          <input
            id="cis-K"
            type="range"
            min={20}
            max={200}
            step={5}
            value={K}
            onChange={(e) => setK(parseInt(e.target.value, 10))}
            className="mt-2 w-full accent-primary"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">
            Confidence level
          </p>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setLevel(opt.value)}
                className={[
                  "rounded-md border px-3 py-1.5 text-xs font-semibold shadow-sm",
                  level === opt.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary hover:bg-primary/10",
                ].join(" ")}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setRunCounter((c) => c + 1)}
          className="ml-auto rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          🎲 Jalankan Ulang
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="K (total trial)" value={String(K)} />
        <Stat label="Mengandung θ" value={`${hitCount} / ${K}`} highlight />
        <Stat label="Coverage rate" value={`${hitPct.toFixed(1)}%`} />
        <Stat label="Diharapkan" value={`≈ ${expectedPct}%`} />
      </div>

      <DerivationPanel>
        <p className="font-semibold">
          Step 1 — Definisi (Tsun, 2020, hal. 301):
        </p>
        <BlockMath
          math={String.raw`P\!\left(\theta \in [\hat{\theta} - \Delta,\, \hat{\theta} + \Delta]\right) = 1 - \alpha`}
        />
        <p className="font-sans italic text-foreground">
          “If we repeat this process several times (getting n samples each time
          and constructing different confidence intervals), about 100(1−α)% of
          the confidence intervals we construct will contain θ.”
        </p>

        <p className="font-semibold">Step 2 — Parameter simulasi:</p>
        <BlockMath
          math={String.raw`\theta = ${theta.toFixed(2)},\quad n = ${n},\quad K = ${K},\quad z_{1-\alpha/2} = ${z}`}
        />

        <p className="font-semibold">Step 3 — Substitusi (per trial i):</p>
        <BlockMath
          math={String.raw`x_{i,1}, \ldots, x_{i,n} \sim \mathrm{Ber}(${theta.toFixed(2)}) \implies \hat{\theta}_i = \frac{1}{n}\sum_j x_{i,j},\quad CI_i = \hat{\theta}_i \pm ${z} \cdot \frac{\hat{\sigma}_i}{\sqrt{${n}}}`}
        />

        <p className="font-semibold">Step 4 — Hasil:</p>
        <BlockMath
          math={String.raw`\frac{\#\{i : \theta \in CI_i\}}{K} = \frac{${hitCount}}{${K}} = ${hitPct.toFixed(1)}\%`}
        />
        <p className="font-sans text-foreground">
          Nilai ini mendekati nominal {expectedPct}% — bukan karena θ
          "berfluktuasi", tetapi karena <em>interval</em> berfluktuasi seiring
          sampel. θ tetap. Itulah arti frequentist dari "{expectedPct}%
          confidence".
        </p>
      </DerivationPanel>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">
          {K} confidence interval — garis hijau mengandung θ, merah meleset
        </p>
        <div
          className="relative w-full rounded-md border border-border bg-muted"
          style={{ height: Math.max(220, Math.min(420, K * 3)), minWidth: 300 }}
        >
          <div className="absolute inset-0">
            {trials.map((t, i) => {
              const left = `${t.lower * 100}%`;
              const width = `${Math.max(0.3, (t.upper - t.lower) * 100)}%`;
              const top = `${i * barHeightPct}%`;
              return (
                <div
                  key={`${runCounter}-${i}`}
                  className="absolute"
                  style={{
                    left,
                    width,
                    top,
                    height: `${Math.max(1, barHeightPct * 0.7)}%`,
                    backgroundColor: t.contains ? colors.hit : colors.miss,
                    opacity: 0.85,
                    borderRadius: 1,
                  }}
                  title={`Trial ${i + 1}: [${t.lower.toFixed(3)}, ${t.upper.toFixed(3)}] ${t.contains ? "✓" : "✗"}`}
                />
              );
            })}
            <div
              className="absolute top-0 bottom-0"
              style={{
                left: `${theta * 100}%`,
                width: 2,
                backgroundColor: colors.truth,
              }}
            />
            <div
              className="absolute -top-1 text-[11px] font-semibold"
              style={{
                left: `calc(${theta * 100}% + 6px)`,
                color: colors.truth,
              }}
            >
              θ = {theta.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
          <span>0.0</span>
          <span>0.25</span>
          <span>0.5</span>
          <span>0.75</span>
          <span>1.0</span>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card">
        <p className="border-b border-border px-4 py-2 text-sm font-semibold text-foreground">
          Miskonsepsi vs interpretasi yang benar
        </p>
        <div className="grid divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-destructive">
              ❌ Salah
            </p>
            <p className="text-sm text-foreground">
              "Ada {levelPct}% probabilitas bahwa θ berada di dalam interval
              ini."
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              θ adalah parameter tetap — entah berada di interval, atau tidak.
              Tidak ada keacakan pada θ setelah data diamati.
            </p>
          </div>
          <div className="p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-chart-5">
              ✅ Benar
            </p>
            <p className="text-sm text-foreground">
              "{levelPct}% dari prosedur seperti ini akan menghasilkan interval
              yang mengandung θ."
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Yang acak adalah <em>interval</em>, bukan θ. Coverage rate di atas
              membuktikan ini.
            </p>
          </div>
        </div>
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
