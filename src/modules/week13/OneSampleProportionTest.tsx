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
  oneSampleZProportion,
  pValueFromZ,
  type Tail,
} from "../../utils/mathUtils";
import { cssVar } from "../../utils/themeColors";

const TAILS: { label: string; value: Tail; symbol: string }[] = [
  { label: "Satu sisi kanan (Hₐ: p > p₀)", value: "greater", symbol: ">" },
  { label: "Satu sisi kiri (Hₐ: p < p₀)", value: "less", symbol: "<" },
  { label: "Dua sisi (Hₐ: p ≠ p₀)", value: "two", symbol: "≠" },
];

const ALPHAS = [0.1, 0.05, 0.01] as const;
type AlphaValue = (typeof ALPHAS)[number];

interface Preset {
  label: string;
  p0: number;
  n: number;
  k: number;
  tail: Tail;
  alpha: AlphaValue;
}

const PRESETS: Preset[] = [
  {
    label: "Buku Washington (p₀=0.75, n=137, k=131)",
    p0: 0.75,
    n: 137,
    k: 131,
    tail: "greater",
    alpha: 0.01,
  },
  {
    label: "Antivirus 95% claim (p₀=0.95, n=200, k=188)",
    p0: 0.95,
    n: 200,
    k: 188,
    tail: "less",
    alpha: 0.05,
  },
];

export function OneSampleProportionTest() {
  const [p0, setP0] = useState(0.75);
  const [n, setN] = useState(137);
  const [k, setK] = useState(131);
  const [tail, setTail] = useState<Tail>("greater");
  const [alpha, setAlpha] = useState<AlphaValue>(0.01);

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

  const { zStat, sigma0, pHat, pValue, reject, zCrit, curve, yMax } = useMemo(() => {
    const safeK = Math.min(Math.max(0, k), n);
    const { z: zStat, sigma0 } = oneSampleZProportion(safeK, n, p0);
    const pHat = n > 0 ? safeK / n : 0;
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
    return { zStat, sigma0, pHat, pValue, reject, zCrit, curve, yMax: 0.45 };
  }, [k, n, p0, tail, alpha]);

  const applyPreset = (p: Preset) => {
    setP0(p.p0);
    setN(p.n);
    setK(p.k);
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
      moduleNumber={2}
      totalModules={4}
      title="Uji Hipotesis Satu Sampel: Proporsi (Z-Test)"
      distribution="Bernoulli + CLT"
      context={
        <p>
          <strong>Kasus:</strong> Tim security menguji klaim vendor antivirus
          atau survei pemilih: apakah proporsi sukses sesuai klaim p₀? Pakai
          Z-test berbasis CLT untuk proporsi sampel (Tsun, 2020, hal. 308).
        </p>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NumberField
          id="osp-p0"
          label="p₀ (klaim baseline)"
          value={p0}
          onChange={setP0}
          step={0.01}
          min={0.001}
          max={0.999}
        />
        <NumberField
          id="osp-n"
          label="n (ukuran sampel)"
          value={n}
          onChange={(next) => {
            setN(next);
            if (k > next) setK(next);
          }}
          step={1}
          min={2}
          integer
        />
        <NumberField
          id="osp-k"
          label="k (jumlah sukses)"
          value={k}
          onChange={(next) => setK(Math.max(0, Math.min(n, next)))}
          step={1}
          min={0}
          integer
        />
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
        <Stat label="p̂ = k/n" value={pHat.toFixed(4)} />
        <Stat label="σ₀ = √(p₀(1−p₀)/n)" value={Number.isFinite(sigma0) ? sigma0.toFixed(4) : "—"} />
        <Stat label="Z-statistic" value={Number.isFinite(zStat) ? zStat.toFixed(3) : "—"} highlight />
        <Stat
          label="Keputusan"
          value={reject ? "Tolak H₀" : "Gagal tolak H₀"}
          highlight
        />
      </div>

      <DerivationPanel>
        <p className="font-semibold">
          Step 1 — Definisi Z-statistic untuk proporsi (Tsun, 2020, hal. 308):
        </p>
        <BlockMath
          math={String.raw`\bar{X} \approx N\!\left(p_0,\, \frac{p_0(1-p_0)}{n}\right) \implies Z = \frac{k/n - p_0}{\sqrt{p_0(1-p_0)/n}}`}
        />

        <p className="font-semibold">Step 2 — Parameter dari data:</p>
        <BlockMath
          math={String.raw`p_0 = ${p0},\quad n = ${n},\quad k = ${k},\quad \hat{p} = \frac{${k}}{${n}} = ${pHat.toFixed(4)}`}
        />
        <BlockMath
          math={String.raw`H_0: p = ${p0} \qquad H_a: p ${tailSymbol} ${p0},\quad \alpha = ${alpha}`}
        />

        <p className="font-semibold">Step 3 — σ₀ dan substitusi:</p>
        <BlockMath
          math={String.raw`\sigma_0 = \sqrt{\frac{${p0}(1-${p0})}{${n}}} = \sqrt{\frac{${(p0 * (1 - p0)).toFixed(4)}}{${n}}} = ${Number.isFinite(sigma0) ? sigma0.toFixed(4) : "\\text{NaN}"}`}
        />
        <BlockMath
          math={String.raw`Z = \frac{${pHat.toFixed(4)} - ${p0}}{${Number.isFinite(sigma0) ? sigma0.toFixed(4) : "\\sigma_0"}} = ${Number.isFinite(zStat) ? zStat.toFixed(3) : "\\text{NaN}"}`}
        />

        <p className="font-semibold">Step 4 — p-value:</p>
        <BlockMath math={pFormulaMath} />

        <p className="font-semibold">Step 5 — Kesimpulan:</p>
        <BlockMath
          math={String.raw`p = ${pValue.toExponential(3)} \;${reject ? "<" : "\\geq"}\; \alpha = ${alpha} \implies \textbf{${reject ? "Tolak\\ H_0" : "Gagal\\ menolak\\ H_0"}}`}
        />
        <p className="font-sans text-foreground">
          {reject ? (
            <>
              Ada bukti statistik signifikan terhadap H₀ pada α = {alpha}. Data
              mendukung Hₐ: p {tailSymbol} {p0}.
            </>
          ) : (
            <>
              Belum cukup bukti untuk menolak H₀ pada α = {alpha}. Perbedaan
              antara p̂ = {pHat.toFixed(3)} dan p₀ = {p0} bisa dijelaskan oleh
              variasi sampling biasa (lihat slide 9 Tsun).
            </>
          )}
        </p>
      </DerivationPanel>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">
          Distribusi Z di bawah H₀ — rejection region (merah), p-value (oranye), observed Z
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
        {Number.isFinite(zStat) && Math.abs(zStat) > 4 && (
          <p className="mt-1 text-xs text-muted-foreground">
            |Z| = {Math.abs(zStat).toFixed(3)} berada di luar [−4, 4]; p-value
            tetap dihitung benar.
          </p>
        )}
      </div>

      <div className="rounded-md border border-border bg-muted px-4 py-3 font-mono text-sm text-foreground">
        <p>
          Z = {Number.isFinite(zStat) ? zStat.toFixed(3) : "—"}, p ={" "}
          {Number.isFinite(pValue) ? pValue.toExponential(3) : "—"}, α = {alpha}{" "}
          → <strong>{reject ? "Tolak H₀" : "Gagal menolak H₀"}</strong>
        </p>
        <p className="mt-2 font-sans text-muted-foreground">
          ⚠ "Gagal menolak" ≠ "klaim p₀ terbukti benar". Sampel mungkin terlalu
          kecil untuk mendeteksi perbedaan kecil (underpowered).
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
  max,
  integer,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
  max?: number;
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
        max={max}
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
