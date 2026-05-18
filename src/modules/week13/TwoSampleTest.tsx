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
import {
  normalInverseCDF,
  pValueFromZ,
  twoSampleZ,
  type Tail,
} from "../../utils/mathUtils";
import { cssVar } from "../../utils/themeColors";

const TAILS: { label: string; value: Tail; symbol: string }[] = [
  { label: "Kanan (Hₐ: μ₁ > μ₂)", value: "greater", symbol: ">" },
  { label: "Kiri (Hₐ: μ₁ < μ₂)", value: "less", symbol: "<" },
  { label: "Dua sisi (Hₐ: μ₁ ≠ μ₂)", value: "two", symbol: "≠" },
];

const ALPHAS = [0.1, 0.05, 0.01] as const;
type AlphaValue = (typeof ALPHAS)[number];

interface Preset {
  label: string;
  x1: number;
  s1: number;
  n1: number;
  x2: number;
  s2: number;
  n2: number;
  tail: Tail;
  alpha: AlphaValue;
}

const PRESETS: Preset[] = [
  {
    label: "NimbusStore A/B UI (A: x̄=4.2 σ=1.0 n=80; B: x̄=3.8 σ=0.9 n=80)",
    x1: 4.2,
    s1: 1.0,
    n1: 80,
    x2: 3.8,
    s2: 0.9,
    n2: 80,
    tail: "two",
    alpha: 0.05,
  },
];

export function TwoSampleTest() {
  const [x1, setX1] = useState(4.2);
  const [s1, setS1] = useState(1.0);
  const [n1, setN1] = useState(80);
  const [x2, setX2] = useState(3.8);
  const [s2, setS2] = useState(0.9);
  const [n2, setN2] = useState(80);
  const [tail, setTail] = useState<Tail>("two");
  const [alpha, setAlpha] = useState<AlphaValue>(0.05);

  const colors = useMemo(
    () => ({
      grid: cssVar("--border"),
      curve: cssVar("--chart-1"),
      reject: cssVar("--destructive"),
      pTail: cssVar("--chart-2"),
      marker: cssVar("--chart-4"),
    }),
    [],
  );

  const { zStat, se, diff, pValue, reject, zCrit, curve, yMax } = useMemo(() => {
    const zStat = twoSampleZ(x1, s1, n1, x2, s2, n2);
    const se = Math.sqrt((s1 * s1) / n1 + (s2 * s2) / n2);
    const diff = x1 - x2;
    const pValue = pValueFromZ(zStat, tail);
    const reject = Number.isFinite(pValue) && pValue < alpha;

    let zCrit: { lo: number | null; hi: number | null };
    if (tail === "greater") zCrit = { lo: null, hi: normalInverseCDF(1 - alpha) };
    else if (tail === "less") zCrit = { lo: normalInverseCDF(alpha), hi: null };
    else
      zCrit = {
        lo: normalInverseCDF(alpha / 2),
        hi: normalInverseCDF(1 - alpha / 2),
      };

    const points = 241;
    const xMin = -4;
    const xMax = 4;
    const curve = Array.from({ length: points }, (_, i) => {
      const z = xMin + ((xMax - xMin) * i) / (points - 1);
      const density = Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI);
      const inRejection =
        (zCrit.hi !== null && z >= zCrit.hi) ||
        (zCrit.lo !== null && z <= zCrit.lo);
      let inPTail: boolean;
      if (tail === "greater") inPTail = Number.isFinite(zStat) && z >= zStat;
      else if (tail === "less") inPTail = Number.isFinite(zStat) && z <= zStat;
      else inPTail = Number.isFinite(zStat) && Math.abs(z) >= Math.abs(zStat);
      return {
        z,
        density,
        rejection: inRejection ? density : 0,
        pTail: inPTail ? density : 0,
      };
    });
    return { zStat, se, diff, pValue, reject, zCrit, curve, yMax: 0.45 };
  }, [x1, s1, n1, x2, s2, n2, tail, alpha]);

  const applyPreset = (p: Preset) => {
    setX1(p.x1);
    setS1(p.s1);
    setN1(p.n1);
    setX2(p.x2);
    setS2(p.s2);
    setN2(p.n2);
    setTail(p.tail);
    setAlpha(p.alpha);
  };

  const tailSymbol = TAILS.find((t) => t.value === tail)!.symbol;
  const pFormulaMath =
    tail === "greater"
      ? String.raw`p = P(Z \geq ${zStat.toFixed(3)}) = ${pValue.toExponential(3)}`
      : tail === "less"
        ? String.raw`p = P(Z \leq ${zStat.toFixed(3)}) = ${pValue.toExponential(3)}`
        : String.raw`p = 2\,P(Z \geq |${zStat.toFixed(3)}|) = ${pValue.toExponential(3)}`;

  return (
    <ModuleCard
      moduleNumber={3}
      totalModules={4}
      title="Uji Hipotesis Dua Sampel: Beda Rata-rata (A/B Test)"
      distribution="Normal — beda x̄₁ − x̄₂"
      context={
        <p>
          <strong>Kasus:</strong> NimbusStore membandingkan dua versi UI upload.
          Versi A vs Versi B — apakah perbedaan rata-rata durasi upload
          signifikan secara statistik? Uji dua populasi independen dengan σ₁,
          σ₂ diketahui (Tsun, 2020, hal. 309).
        </p>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-3">
          <p className="mb-3 text-sm font-semibold text-foreground">Populasi 1 (Versi A)</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <NumberField id="ts-x1" label="x̄₁" value={x1} onChange={setX1} step={0.1} />
            <NumberField id="ts-s1" label="σ₁" value={s1} onChange={setS1} step={0.1} min={0.01} />
            <NumberField id="ts-n1" label="n₁" value={n1} onChange={setN1} step={1} min={2} integer />
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <p className="mb-3 text-sm font-semibold text-foreground">Populasi 2 (Versi B)</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <NumberField id="ts-x2" label="x̄₂" value={x2} onChange={setX2} step={0.1} />
            <NumberField id="ts-s2" label="σ₂" value={s2} onChange={setS2} step={0.1} min={0.01} />
            <NumberField id="ts-n2" label="n₂" value={n2} onChange={setN2} step={1} min={2} integer />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">
            Hₐ (alternative)
          </p>
          <div className="flex flex-wrap gap-2">
            {TAILS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTail(opt.value)}
                className={[
                  "rounded-md border px-3 py-1.5 text-xs font-semibold shadow-sm",
                  tail === opt.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary hover:bg-primary/10",
                ].join(" ")}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">α</p>
          <div className="flex flex-wrap gap-2">
            {ALPHAS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAlpha(a)}
                className={[
                  "rounded-md border px-3 py-1.5 text-xs font-semibold shadow-sm",
                  alpha === a
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary hover:bg-primary/10",
                ].join(" ")}
              >
                α = {a}
              </button>
            ))}
          </div>
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
        <Stat label="x̄₁ − x̄₂" value={diff.toFixed(3)} />
        <Stat label="SE = √(σ₁²/n₁ + σ₂²/n₂)" value={se.toFixed(4)} />
        <Stat label="Z-statistic" value={Number.isFinite(zStat) ? zStat.toFixed(3) : "—"} highlight />
        <Stat
          label="Keputusan"
          value={reject ? "Tolak H₀" : "Gagal tolak H₀"}
          highlight
        />
      </div>

      <DerivationPanel>
        <p className="font-semibold">
          Step 1 — Definisi Z untuk beda dua rata-rata (Tsun, 2020, hal. 309):
        </p>
        <BlockMath
          math={String.raw`Z = \frac{\bar{x}_1 - \bar{x}_2}{\sqrt{\dfrac{\sigma_1^2}{n_1} + \dfrac{\sigma_2^2}{n_2}}}`}
        />

        <p className="font-semibold">Step 2 — Parameter dari data:</p>
        <BlockMath
          math={String.raw`\bar{x}_1 = ${x1},\, \sigma_1 = ${s1},\, n_1 = ${n1};\quad \bar{x}_2 = ${x2},\, \sigma_2 = ${s2},\, n_2 = ${n2}`}
        />
        <BlockMath
          math={String.raw`H_0: \mu_1 = \mu_2 \qquad H_a: \mu_1 ${tailSymbol} \mu_2,\quad \alpha = ${alpha}`}
        />

        <p className="font-semibold">Step 3 — SE dan substitusi:</p>
        <BlockMath
          math={String.raw`SE = \sqrt{\frac{${s1}^2}{${n1}} + \frac{${s2}^2}{${n2}}} = \sqrt{${((s1 * s1) / n1).toFixed(5)} + ${((s2 * s2) / n2).toFixed(5)}} = ${se.toFixed(4)}`}
        />
        <BlockMath
          math={String.raw`Z = \frac{${x1} - ${x2}}{${se.toFixed(4)}} = \frac{${diff.toFixed(3)}}{${se.toFixed(4)}} = ${Number.isFinite(zStat) ? zStat.toFixed(3) : "\\text{NaN}"}`}
        />

        <p className="font-semibold">Step 4 — p-value:</p>
        <BlockMath math={pFormulaMath} />

        <p className="font-semibold">Step 5 — Kesimpulan:</p>
        <BlockMath
          math={String.raw`p = ${pValue.toExponential(3)} \;${reject ? "<" : "\\geq"}\; \alpha = ${alpha} \implies \textbf{${reject ? "Tolak" : "Gagal\\ menolak"}}\ H_0`}
        />
        <p className="font-sans text-foreground">
          {reject ? (
            <>
              Ada perbedaan signifikan secara statistik antara dua populasi (p
              &lt; α). Hₐ: μ₁ {tailSymbol} μ₂ didukung data.
            </>
          ) : (
            <>
              Belum cukup bukti untuk menyimpulkan dua populasi berbeda. Selisih{" "}
              {diff.toFixed(3)} bisa terjadi dari variasi sampling biasa.
            </>
          )}
        </p>
      </DerivationPanel>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">
          Distribusi Z di bawah H₀ — rejection region, p-value, observed Z
        </p>
        <div className="h-72 w-full" style={{ minWidth: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={curve}
              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis
                dataKey="z"
                type="number"
                domain={[-4, 4]}
                tickFormatter={(v) => Number(v).toFixed(1)}
                label={{ value: "Z", position: "insideBottom", offset: -2 }}
              />
              <YAxis
                domain={[0, yMax]}
                tickFormatter={(v) => Number(v).toFixed(2)}
                width={50}
              />
              <Tooltip
                formatter={(v, name) =>
                  (name === "rejection" || name === "pTail") && Number(v) === 0
                    ? ""
                    : Number(v).toFixed(3)
                }
                labelFormatter={(v) => `z = ${Number(v).toFixed(3)}`}
              />
              <Area
                type="monotone"
                dataKey="density"
                stroke={colors.curve}
                strokeWidth={2}
                fill={colors.curve}
                fillOpacity={0.12}
                name="N(0,1) di bawah H₀"
              />
              <Area
                type="monotone"
                dataKey="pTail"
                stroke="none"
                fill={colors.pTail}
                fillOpacity={0.55}
                name="Area p-value"
              />
              <Area
                type="monotone"
                dataKey="rejection"
                stroke="none"
                fill={colors.reject}
                fillOpacity={0.3}
                name={`Rejection (α = ${alpha})`}
              />
              {Number.isFinite(zStat) && Math.abs(zStat) <= 4 && (
                <ReferenceLine
                  x={zStat}
                  stroke={colors.marker}
                  strokeWidth={2}
                  label={{
                    value: `Z = ${zStat.toFixed(3)}`,
                    position: "top",
                    fill: colors.marker,
                    fontSize: 12,
                  }}
                />
              )}
              {zCrit.hi !== null && (
                <ReferenceLine
                  x={zCrit.hi}
                  stroke={colors.reject}
                  strokeDasharray="4 4"
                  label={{
                    value: `z_crit = ${zCrit.hi.toFixed(3)}`,
                    position: "insideTopRight",
                    fill: colors.reject,
                    fontSize: 11,
                  }}
                />
              )}
              {zCrit.lo !== null && (
                <ReferenceLine
                  x={zCrit.lo}
                  stroke={colors.reject}
                  strokeDasharray="4 4"
                  label={{
                    value: `z_crit = ${zCrit.lo.toFixed(3)}`,
                    position: "insideTopLeft",
                    fill: colors.reject,
                    fontSize: 11,
                  }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-md border border-border bg-muted px-4 py-3 font-mono text-sm text-foreground">
        <p>
          Z = {Number.isFinite(zStat) ? zStat.toFixed(3) : "—"}, p ={" "}
          {Number.isFinite(pValue) ? pValue.toExponential(3) : "—"}, α = {alpha}{" "}
          → <strong>{reject ? "Tolak H₀" : "Gagal menolak H₀"}</strong>
        </p>
        <p className="mt-2 font-sans text-muted-foreground">
          Untuk σ tidak diketahui atau statistik non-mean, Tsun menyarankan
          bootstrap (Bab 9.7). Modul ini mengasumsikan σ₁, σ₂ diketahui.
        </p>
      </div>
    </ModuleCard>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
  step,
  min,
  integer,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
  integer?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between text-sm font-semibold text-foreground"
      >
        <span>{label}</span>
        <span className="font-mono text-primary">{value}</span>
      </label>
      <input
        id={id}
        type="number"
        value={value}
        step={step ?? "any"}
        min={min}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "" || raw === "-") return;
          const parsed = integer ? parseInt(raw, 10) : parseFloat(raw);
          if (!Number.isNaN(parsed)) onChange(parsed);
        }}
        className="mt-2 w-full rounded-md border border-border bg-card px-3 py-1.5 text-sm font-mono text-foreground focus:border-primary focus:outline-none"
      />
    </div>
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
