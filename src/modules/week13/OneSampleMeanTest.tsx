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
  oneSampleZ,
  pValueFromZ,
  type Tail,
} from "../../utils/mathUtils";
import { cssVar } from "../../utils/themeColors";

const TAILS: { label: string; value: Tail; symbol: string; hint: string }[] = [
  { label: "Satu sisi kanan (Hₐ: μ > μ₀)", value: "greater", symbol: ">", hint: "Ingin bukti rata-rata lebih besar dari baseline" },
  { label: "Satu sisi kiri (Hₐ: μ < μ₀)", value: "less", symbol: "<", hint: "Ingin bukti rata-rata lebih kecil dari baseline" },
  { label: "Dua sisi (Hₐ: μ ≠ μ₀)", value: "two", symbol: "≠", hint: "Ingin bukti rata-rata berbeda dari baseline (arah apapun)" },
];

const ALPHAS = [0.1, 0.05, 0.01] as const;
type AlphaValue = (typeof ALPHAS)[number];

interface Preset {
  label: string;
  mu0: number;
  sigma: number;
  n: number;
  xbar: number;
  tail: Tail;
  alpha: AlphaValue;
}

const PRESETS: Preset[] = [
  {
    label: "Buku Tsun SuperSAT (μ₀=1059, σ=210, n=100, x̄=1113)",
    mu0: 1059,
    sigma: 210,
    n: 100,
    xbar: 1113,
    tail: "greater",
    alpha: 0.05,
  },
  {
    label: "MLOps latency (μ₀=120 ms, σ=24, n=64, x̄=113)",
    mu0: 120,
    sigma: 24,
    n: 64,
    xbar: 113,
    tail: "less",
    alpha: 0.05,
  },
];

export function OneSampleMeanTest() {
  const [mu0, setMu0] = useState(1059);
  const [xbar, setXbar] = useState(1113);
  const [sigma, setSigma] = useState(210);
  const [n, setN] = useState(100);
  const [tail, setTail] = useState<Tail>("greater");
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

  const {
    zStat,
    pValue,
    reject,
    zCrit,
    curve,
    yMax,
  } = useMemo(() => {
    const zStat = oneSampleZ(xbar, mu0, sigma, n);
    const pValue = pValueFromZ(zStat, tail);
    const reject = pValue < alpha;
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
    const yMax = 0.45;
    return { zStat, pValue, reject, zCrit, curve, yMax };
  }, [xbar, mu0, sigma, n, tail, alpha]);

  const applyPreset = (p: Preset) => {
    setMu0(p.mu0);
    setXbar(p.xbar);
    setSigma(p.sigma);
    setN(p.n);
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
      moduleNumber={1}
      totalModules={4}
      title="Uji Hipotesis Satu Sampel: Rata-rata (Z-Test)"
      distribution="Normal — CLT untuk x̄"
      context={
        <p>
          <strong>Kasus:</strong> SuperSAT Prep mengklaim siswanya meraih skor
          SAT lebih tinggi dari rata-rata nasional (μ₀ = 1059). Dari sampel{" "}
          <em>n</em> siswa, rata-rata skor x̄ teramati. Pakai prosedur 6 langkah
          Tsun (2020, hal. 306–307) untuk memutuskan apakah klaim didukung.
        </p>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NumberField id="osm-mu0" label="μ₀ (baseline)" value={mu0} onChange={setMu0} step={1} />
        <NumberField id="osm-xbar" label="x̄ (sample mean)" value={xbar} onChange={setXbar} step={1} />
        <NumberField id="osm-sigma" label="σ (populasi)" value={sigma} onChange={setSigma} step={1} min={0.01} />
        <NumberField id="osm-n" label="n (ukuran sampel)" value={n} onChange={setN} step={1} min={2} integer />
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
                title={opt.hint}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">
            Significance level α
          </p>
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
        <Stat label="Z-statistic" value={Number.isFinite(zStat) ? zStat.toFixed(3) : "—"} highlight />
        <Stat label="p-value" value={Number.isFinite(pValue) ? pValue.toExponential(3) : "—"} />
        <Stat label="α" value={alpha.toString()} />
        <Stat
          label="Keputusan"
          value={reject ? "Tolak H₀" : "Gagal tolak H₀"}
          highlight
        />
      </div>

      <DerivationPanel>
        <p className="font-semibold">
          Step 1 — Definisi Z-statistic (Tsun, 2020, hal. 306):
        </p>
        <BlockMath
          math={String.raw`\bar{X} \approx N\!\left(\mu_0,\, \frac{\sigma^2}{n}\right) \implies Z = \frac{\bar{x} - \mu_0}{\sigma / \sqrt{n}}`}
        />

        <p className="font-semibold">Step 2 — Parameter dari data:</p>
        <BlockMath
          math={String.raw`\mu_0 = ${mu0},\quad \bar{x} = ${xbar},\quad \sigma = ${sigma},\quad n = ${n},\quad \alpha = ${alpha}`}
        />
        <BlockMath
          math={String.raw`H_0: \mu = ${mu0} \qquad H_a: \mu ${tailSymbol} ${mu0}`}
        />

        <p className="font-semibold">Step 3 — Substitusi:</p>
        <BlockMath
          math={String.raw`Z = \frac{${xbar} - ${mu0}}{${sigma} / \sqrt{${n}}} = \frac{${(xbar - mu0).toFixed(3)}}{${(sigma / Math.sqrt(n)).toFixed(3)}} = ${Number.isFinite(zStat) ? zStat.toFixed(3) : "\\text{NaN}"}`}
        />

        <p className="font-semibold">Step 4 — Hitung p-value:</p>
        <BlockMath math={pFormulaMath} />

        <p className="font-semibold">Step 5 — Kesimpulan:</p>
        <BlockMath
          math={String.raw`p = ${pValue.toExponential(3)} \;${reject ? "<" : "\\geq"}\; \alpha = ${alpha} \implies \textbf{${reject ? "Tolak\\ H_0" : "Gagal\\ menolak\\ H_0"}}`}
        />
        <p className="font-sans text-foreground">
          {reject ? (
            <>
              Ada bukti statistik yang cukup untuk menolak H₀ pada α = {alpha}.
              Data konsisten dengan klaim Hₐ: μ {tailSymbol} {mu0}.
            </>
          ) : (
            <>
              Tidak cukup bukti untuk menolak H₀ pada α = {alpha}.{" "}
              <em>Bukan berarti</em> H₀ benar — hanya saja data ini bisa muncul
              walau H₀ benar.
            </>
          )}
        </p>
      </DerivationPanel>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">
          Distribusi Z di bawah H₀ — rejection region (merah), p-value (oranye), observed Z (titik biru)
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
                name={`Rejection region (α = ${alpha})`}
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
            |Z| = {Math.abs(zStat).toFixed(3)} berada di luar rentang grafik
            [−4, 4]; nilai p-value tetap dihitung dengan benar.
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
          ⚠ "Gagal menolak H₀" bukan "menerima H₀". Lihat slide 11: p-value
          adalah P(data seekstrem ini | H₀ benar), bukan P(H₀ benar | data).
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
