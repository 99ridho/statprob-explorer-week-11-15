import { useMemo, useState } from "react";
import { BlockMath } from "react-katex";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DerivationPanel } from "../../components/DerivationPanel";
import { ModuleCard } from "../../components/ModuleCard";
import { bernoulliCI } from "../../utils/mathUtils";
import { cssVar } from "../../utils/themeColors";

const LEVELS = [
  { label: "90%", value: 0.9, z: 1.645 },
  { label: "95%", value: 0.95, z: 1.96 },
  { label: "99%", value: 0.99, z: 2.576 },
] as const;
type LevelValue = (typeof LEVELS)[number]["value"];

const PRESETS: {
  label: string;
  n: number;
  k: number;
  level: LevelValue;
}[] = [
  { label: "Buku Tsun (n=400, k=136)", n: 400, k: 136, level: 0.99 },
  { label: "NimbusStore upload (n=200, k=154)", n: 200, k: 154, level: 0.95 },
  { label: "Retention smart-sync (n=300, k=210)", n: 300, k: 210, level: 0.95 },
  { label: "E-commerce gagal bayar (n=500, k=45)", n: 500, k: 45, level: 0.95 },
];

const N_MIN = 10;
const N_MAX = 2000;

export function CIProportion() {
  const [n, setN] = useState(400);
  const [k, setK] = useState(136);
  const [level, setLevel] = useState<LevelValue>(0.99);

  const colors = useMemo(
    () => ({
      grid: cssVar("--border"),
      curve: cssVar("--chart-1"),
      ciFill: cssVar("--chart-3"),
      marker: cssVar("--chart-2"),
      mean: cssVar("--chart-4"),
    }),
    [],
  );

  const levelMeta = LEVELS.find((l) => l.value === level)!;
  const z = levelMeta.z;
  const alphaPct = Math.round((1 - level) * 100);
  const levelPct = Math.round(level * 100);

  const { thetaHat, sigmaHat, halfWidth, lower, upper, curve, yMax, sd } =
    useMemo(() => {
      const ci = bernoulliCI(k, n, z);
      const sd = ci.thetaHat * (1 - ci.thetaHat) === 0 || n === 0
        ? 0
        : Math.sqrt((ci.thetaHat * (1 - ci.thetaHat)) / n);
      const points = 201;
      const xMin = sd > 0 ? Math.max(0, ci.thetaHat - 4 * sd) : 0;
      const xMax = sd > 0 ? Math.min(1, ci.thetaHat + 4 * sd) : 1;
      const span = xMax - xMin || 1;
      const curve = Array.from({ length: points }, (_, i) => {
        const x = xMin + (i * span) / (points - 1);
        const density =
          sd > 0
            ? (1 / (sd * Math.sqrt(2 * Math.PI))) *
              Math.exp(-((x - ci.thetaHat) ** 2) / (2 * sd * sd))
            : 0;
        const inCI = x >= ci.lower && x <= ci.upper;
        return {
          x,
          density,
          ciBand: inCI ? density : 0,
        };
      });
      const peak = Math.max(...curve.map((p) => p.density));
      const yMax = Math.max(1, peak * 1.1);
      return {
        thetaHat: ci.thetaHat,
        sigmaHat: ci.sigmaHat,
        halfWidth: ci.halfWidth,
        lower: ci.lower,
        upper: ci.upper,
        curve,
        yMax,
        sd,
      };
    }, [k, n, z]);

  const handleNChange = (next: number) => {
    setN(next);
    if (k > next) setK(next);
  };

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setN(p.n);
    setK(p.k);
    setLevel(p.level);
  };

  return (
    <ModuleCard
      moduleNumber={1}
      totalModules={4}
      title="Confidence Interval untuk Proporsi (Bernoulli)"
      distribution="Bernoulli + CLT"
      context={
        <p>
          <strong>Kasus:</strong> Tim QA NimbusStore mengamati upload success
          rate dari <em>n</em> percobaan. Bangun confidence interval untuk θ
          sesungguhnya menggunakan CLT.
        </p>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="cip-n"
            className="flex items-baseline justify-between text-sm font-semibold text-foreground"
          >
            <span>n — ukuran sampel</span>
            <span className="font-mono text-primary">{n}</span>
          </label>
          <input
            id="cip-n"
            type="range"
            min={N_MIN}
            max={N_MAX}
            value={n}
            onChange={(e) => handleNChange(parseInt(e.target.value, 10))}
            className="mt-2 w-full accent-primary"
          />
        </div>
        <div>
          <label
            htmlFor="cip-k"
            className="flex items-baseline justify-between text-sm font-semibold text-foreground"
          >
            <span>k — jumlah sukses</span>
            <span className="font-mono text-primary">{k}</span>
          </label>
          <input
            id="cip-k"
            type="range"
            min={0}
            max={n}
            value={k}
            onChange={(e) => setK(parseInt(e.target.value, 10))}
            className="mt-2 w-full accent-primary"
          />
        </div>
      </div>

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
              {opt.label} (z = {opt.z})
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => applyPreset(preset)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm hover:border-primary hover:bg-primary/10"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="θ̂ = k / n" value={thetaHat.toFixed(3)} highlight />
        <Stat label="σ̂ = √(θ̂(1−θ̂))" value={sigmaHat.toFixed(3)} />
        <Stat label={`z_{1-α/2}`} value={z.toFixed(3)} />
        <Stat label="Δ (half-width)" value={halfWidth.toFixed(4)} />
      </div>

      <DerivationPanel>
        <p className="font-semibold">
          Step 1 — Definisi CI (Tsun, 2020, hal. 300):
        </p>
        <BlockMath
          math={String.raw`\left[\hat{\theta} - z_{1-\alpha/2} \cdot \frac{\sigma}{\sqrt{n}},\; \hat{\theta} + z_{1-\alpha/2} \cdot \frac{\sigma}{\sqrt{n}}\right]`}
        />

        <p className="font-semibold">Step 2 — Parameter dari data:</p>
        <BlockMath
          math={String.raw`\hat{\theta} = \frac{k}{n} = \frac{${k}}{${n}} = ${thetaHat.toFixed(3)}`}
        />
        <BlockMath
          math={String.raw`\hat{\sigma} \approx \sqrt{\hat{\theta}(1 - \hat{\theta})} = \sqrt{${thetaHat.toFixed(3)} \times ${(1 - thetaHat).toFixed(3)}} = ${sigmaHat.toFixed(3)}`}
        />
        <BlockMath
          math={String.raw`\alpha = ${(1 - level).toFixed(2)},\quad z_{1-\alpha/2} = z_{${(1 - (1 - level) / 2).toFixed(3)}} = ${z}`}
        />

        <p className="font-semibold">Step 3 — Substitusi:</p>
        <BlockMath
          math={String.raw`\hat{\theta} \pm z \cdot \frac{\hat{\sigma}}{\sqrt{n}} = ${thetaHat.toFixed(3)} \pm ${z} \cdot \frac{${sigmaHat.toFixed(3)}}{\sqrt{${n}}} = ${thetaHat.toFixed(3)} \pm ${halfWidth.toFixed(4)}`}
        />

        <p className="font-semibold">Step 4 — Hasil:</p>
        <BlockMath
          math={String.raw`CI_{${levelPct}\%} = [${lower.toFixed(3)},\; ${upper.toFixed(3)}]`}
        />
        <p className="font-sans text-foreground">
          Kami {levelPct}% yakin bahwa θ sesungguhnya berada di antara{" "}
          <strong>{(lower * 100).toFixed(1)}%</strong> dan{" "}
          <strong>{(upper * 100).toFixed(1)}%</strong>. Titik estimasi terbaik:{" "}
          <strong>{(thetaHat * 100).toFixed(1)}%</strong>.
        </p>
      </DerivationPanel>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">
          Distribusi sampling θ̂ dan pita CI {levelPct}%
        </p>
        <div className="h-72 w-full" style={{ minWidth: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={curve}
              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis
                dataKey="x"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(v) => Number(v).toFixed(2)}
                label={{
                  value: "x (kandidat nilai θ)",
                  position: "insideBottom",
                  offset: -2,
                }}
              />
              <YAxis
                domain={[0, yMax]}
                tickFormatter={(v) => Number(v).toFixed(1)}
                width={50}
              />
              <Tooltip
                formatter={(v, name) =>
                  name === "ciBand" && Number(v) === 0
                    ? ""
                    : Number(v).toFixed(3)
                }
                labelFormatter={(v) => `x = ${Number(v).toFixed(3)}`}
              />
              <Area
                type="monotone"
                dataKey="density"
                stroke={colors.curve}
                strokeWidth={2}
                fill={colors.curve}
                fillOpacity={0.1}
                name="N(θ̂, σ̂²/n)"
              />
              <Area
                type="monotone"
                dataKey="ciBand"
                stroke="none"
                fill={colors.ciFill}
                fillOpacity={0.45}
                name={`Pita CI ${levelPct}%`}
              />
              <ReferenceLine
                x={thetaHat}
                stroke={colors.marker}
                strokeDasharray="5 5"
                label={{
                  value: `θ̂ = ${thetaHat.toFixed(3)}`,
                  position: "top",
                  fill: colors.marker,
                  fontSize: 12,
                }}
              />
              <ReferenceLine
                x={lower}
                stroke={colors.mean}
                strokeDasharray="2 4"
                label={{
                  value: lower.toFixed(3),
                  position: "insideBottomLeft",
                  fill: colors.mean,
                  fontSize: 11,
                }}
              />
              <ReferenceLine
                x={upper}
                stroke={colors.mean}
                strokeDasharray="2 4"
                label={{
                  value: upper.toFixed(3),
                  position: "insideBottomRight",
                  fill: colors.mean,
                  fontSize: 11,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Distribusi sampling: σ̂/√n = {sd.toFixed(4)}. Pita berbayang menunjukkan
          rentang nilai θ yang konsisten dengan data pada tingkat keyakinan{" "}
          {levelPct}%.
        </p>
      </div>

      <div className="rounded-md border border-border bg-muted px-4 py-3 font-mono text-sm text-foreground">
        <p>
          CI<sub>{levelPct}%</sub> = [{lower.toFixed(3)}, {upper.toFixed(3)}]
        </p>
        <p>Margin error ±{halfWidth.toFixed(4)} (α = 0.{alphaPct.toString().padStart(2, "0")})</p>
        <p className="mt-2 font-sans text-muted-foreground">
          ⚠ Interpretasi: bukan "ada {levelPct}% probabilitas θ ada di sini",
          melainkan "{levelPct}% dari prosedur serupa akan menghasilkan interval
          yang mengandung θ".
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
