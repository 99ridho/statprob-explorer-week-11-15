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
import { cssVar } from "../../utils/themeColors";

const LEVELS = [
  { label: "90%", value: 0.9, z: 1.645 },
  { label: "95%", value: 0.95, z: 1.96 },
  { label: "98%", value: 0.98, z: 2.326 },
  { label: "99%", value: 0.99, z: 2.576 },
] as const;
type LevelValue = (typeof LEVELS)[number]["value"];

const CHART_LEVELS = LEVELS.filter((l) => l.value !== 0.98);

const PRESETS: {
  label: string;
  n: number;
  sigma: number;
  level: LevelValue;
  margin: number;
}[] = [
  { label: "Slide 10 default (σ=0.5, n=100)", n: 100, sigma: 0.5, level: 0.95, margin: 0.05 },
  { label: "A/B test margin ±2% (n_min=2401)", n: 2401, sigma: 0.5, level: 0.95, margin: 0.02 },
  { label: "Survei politik (σ=0.5, n=1000)", n: 1000, sigma: 0.5, level: 0.95, margin: 0.03 },
];

const N_MIN = 10;
const N_MAX = 10000;

const tToN = (t: number) => Math.round(Math.pow(10, 1 + (3 * t) / 100));
const nToT = (n: number) =>
  Math.max(0, Math.min(100, ((Math.log10(n) - 1) / 3) * 100));

export function CIWidthExplorer() {
  const [n, setN] = useState(400);
  const [sigma, setSigma] = useState(0.5);
  const [level, setLevel] = useState<LevelValue>(0.95);
  const [margin, setMargin] = useState(0.02);

  const colors = useMemo(
    () => ({
      grid: cssVar("--border"),
      line90: cssVar("--chart-5"),
      line95: cssVar("--chart-1"),
      line99: cssVar("--chart-4"),
      marker: cssVar("--chart-2"),
      target: cssVar("--chart-3"),
    }),
    [],
  );

  const levelMeta = LEVELS.find((l) => l.value === level)!;
  const z = levelMeta.z;
  const levelPct = Math.round(level * 100);

  const { halfWidth, fullWidth, nMin, curve, halfAtCurrent } = useMemo(() => {
    const halfWidth = (z * sigma) / Math.sqrt(n);
    const fullWidth = 2 * halfWidth;
    const nMin = margin > 0 ? Math.ceil(Math.pow((z * sigma) / margin, 2)) : 0;
    const points = 80;
    const curve = Array.from({ length: points }, (_, i) => {
      const lnN = Math.log(N_MIN) + (i * (Math.log(N_MAX) - Math.log(N_MIN))) / (points - 1);
      const nn = Math.exp(lnN);
      const row: Record<string, number> = { n: nn };
      for (const lvl of CHART_LEVELS) {
        row[`d${Math.round(lvl.value * 100)}`] = (lvl.z * sigma) / Math.sqrt(nn);
      }
      return row;
    });
    const halfAtCurrent = halfWidth;
    return { halfWidth, fullWidth, nMin, curve, halfAtCurrent };
  }, [n, sigma, z, margin]);

  const tableRows = [25, 100, 400, 1600].map((nn) => ({
    n: nn,
    d90: (1.645 * sigma) / Math.sqrt(nn),
    d95: (1.96 * sigma) / Math.sqrt(nn),
    d99: (2.576 * sigma) / Math.sqrt(nn),
  }));

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setN(p.n);
    setSigma(p.sigma);
    setLevel(p.level);
    setMargin(p.margin);
  };

  return (
    <ModuleCard
      moduleNumber={2}
      totalModules={4}
      title="Width Explorer: Pengaruh n dan Confidence Level"
      distribution="CLT — Lebar CI"
      context={
        <p>
          <strong>Kasus:</strong> Tim produk menjalankan A/B test; berapa{" "}
          <em>n</em> minimum agar margin error ≤ ±2% pada confidence 95%?
          Eksplorasi trade-off antara ukuran sampel, tingkat keyakinan, dan
          presisi.
        </p>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="cw-n"
            className="flex items-baseline justify-between text-sm font-semibold text-foreground"
          >
            <span>n — ukuran sampel (log)</span>
            <span className="font-mono text-primary">{n}</span>
          </label>
          <input
            id="cw-n"
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={nToT(n)}
            onChange={(e) => setN(tToN(parseFloat(e.target.value)))}
            className="mt-2 w-full accent-primary"
          />
        </div>
        <div>
          <label
            htmlFor="cw-sigma"
            className="flex items-baseline justify-between text-sm font-semibold text-foreground"
          >
            <span>σ — standar deviasi (asumsi)</span>
            <span className="font-mono text-primary">{sigma.toFixed(2)}</span>
          </label>
          <input
            id="cw-sigma"
            type="range"
            min={0.05}
            max={0.5}
            step={0.01}
            value={sigma}
            onChange={(e) => setSigma(parseFloat(e.target.value))}
            className="mt-2 w-full accent-primary"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
        <div>
          <label
            htmlFor="cw-m"
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            Target margin error (m)
          </label>
          <input
            id="cw-m"
            type="number"
            min={0.001}
            max={0.5}
            step={0.005}
            value={margin}
            onChange={(e) => setMargin(parseFloat(e.target.value) || 0.001)}
            className="h-10 w-32 rounded-md border border-border bg-card px-2 text-base font-mono text-foreground focus:border-ring focus:outline-hidden focus:ring-2 focus:ring-ring/40"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            digunakan untuk hitung n minimum.
          </p>
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
        <Stat label="z" value={z.toFixed(3)} />
        <Stat label="Δ = zσ/√n" value={halfWidth.toFixed(4)} highlight />
        <Stat label="Lebar (2Δ)" value={fullWidth.toFixed(4)} />
        <Stat label={`n_min (m ≤ ${margin})`} value={String(nMin)} />
      </div>

      <DerivationPanel>
        <p className="font-semibold">
          Step 1 — Definisi lebar CI (Tsun, 2020, hal. 300):
        </p>
        <BlockMath
          math={String.raw`\text{Lebar} = 2 \cdot z_{1-\alpha/2} \cdot \frac{\sigma}{\sqrt{n}}`}
        />

        <p className="font-semibold">Step 2 — Parameter saat ini:</p>
        <BlockMath
          math={String.raw`z = ${z},\quad \sigma = ${sigma.toFixed(2)},\quad n = ${n}`}
        />

        <p className="font-semibold">Step 3 — Substitusi:</p>
        <BlockMath
          math={String.raw`\Delta = \frac{z \cdot \sigma}{\sqrt{n}} = \frac{${z} \times ${sigma.toFixed(2)}}{\sqrt{${n}}} = ${halfWidth.toFixed(4)}`}
        />
        <BlockMath
          math={String.raw`2\Delta = ${fullWidth.toFixed(4)}`}
        />

        <p className="font-semibold">Step 4 — Hasil & inversi untuk n minimum:</p>
        <BlockMath
          math={String.raw`\frac{z \sigma}{\sqrt{n}} \leq m \implies n \geq \left(\frac{z\sigma}{m}\right)^2 = \left(\frac{${z} \times ${sigma.toFixed(2)}}{${margin}}\right)^2 = ${nMin}`}
        />
        <p className="font-sans text-foreground">
          Untuk margin error ≤ <strong>{margin}</strong> pada confidence{" "}
          {levelPct}%, dibutuhkan minimal <strong>n = {nMin}</strong> sampel.
          Untuk mempersempit Δ menjadi setengahnya, <em>n</em> harus dikalikan
          4.
        </p>
      </DerivationPanel>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">
          Half-width Δ(n) = zσ/√n (sumbu-x log)
        </p>
        <div className="h-72 w-full" style={{ minWidth: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={curve}
              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis
                dataKey="n"
                type="number"
                scale="log"
                domain={[N_MIN, N_MAX]}
                ticks={[10, 30, 100, 300, 1000, 3000, 10000]}
                tickFormatter={(v) => String(Number(v))}
                label={{ value: "n", position: "insideBottom", offset: -2 }}
              />
              <YAxis
                tickFormatter={(v) => Number(v).toFixed(2)}
                width={50}
                label={{
                  value: "Δ (half-width)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                formatter={(v) => Number(v).toFixed(4)}
                labelFormatter={(v) => `n = ${Math.round(Number(v))}`}
              />
              <Line
                type="monotone"
                dataKey="d90"
                stroke={colors.line90}
                strokeWidth={2}
                dot={false}
                name="90% (z=1.645)"
              />
              <Line
                type="monotone"
                dataKey="d95"
                stroke={colors.line95}
                strokeWidth={2}
                dot={false}
                name="95% (z=1.96)"
              />
              <Line
                type="monotone"
                dataKey="d99"
                stroke={colors.line99}
                strokeWidth={2}
                dot={false}
                name="99% (z=2.576)"
              />
              <ReferenceLine
                x={n}
                stroke={colors.marker}
                strokeDasharray="5 5"
                label={{
                  value: `n = ${n}`,
                  position: "top",
                  fill: colors.marker,
                  fontSize: 12,
                }}
              />
              <ReferenceLine
                y={margin}
                stroke={colors.target}
                strokeDasharray="4 4"
                label={{
                  value: `target m = ${margin}`,
                  position: "insideTopRight",
                  fill: colors.target,
                  fontSize: 11,
                }}
              />
              <ReferenceLine
                y={halfAtCurrent}
                stroke={colors.marker}
                strokeDasharray="1 3"
                strokeOpacity={0.4}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">
          Tabel pengaruh n (σ = {sigma.toFixed(2)})
        </p>
        <div className="overflow-hidden rounded-md border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2 font-semibold text-muted-foreground">n</th>
                <th className="px-4 py-2 font-semibold text-muted-foreground">
                  Δ pada 90%
                </th>
                <th className="px-4 py-2 font-semibold text-muted-foreground">
                  Δ pada 95%
                </th>
                <th className="px-4 py-2 font-semibold text-muted-foreground">
                  Δ pada 99%
                </th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.n} className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-foreground">{row.n}</td>
                  <td className="px-4 py-2 font-mono text-foreground">
                    {row.d90.toFixed(4)}
                  </td>
                  <td className="px-4 py-2 font-mono text-foreground">
                    {row.d95.toFixed(4)}
                  </td>
                  <td className="px-4 py-2 font-mono text-foreground">
                    {row.d99.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Setiap kali n dikali 4, Δ berkurang setengahnya — biaya operasional
          menjadi mahal untuk peningkatan presisi kecil.
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
