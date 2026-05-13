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
import { betaPDF, lnGamma } from "../../utils/mathUtils";
import { cssVar } from "../../utils/themeColors";

const PRESETS: { label: string; k: number; m: number }[] = [
  { label: "Belum ada data", k: 0, m: 0 },
  { label: "8 klik, 2 tidak", k: 8, m: 2 },
  { label: "80 klik, 20 tidak", k: 80, m: 20 },
  { label: "2 klik, 3 tidak", k: 2, m: 3 },
];

export function BetaExplorer() {
  const [k, setK] = useState(0);
  const [m, setM] = useState(0);

  const colors = useMemo(
    () => ({
      grid: cssVar("--border"),
      beta: cssVar("--chart-3"),
      marker: cssVar("--chart-2"),
      mean: cssVar("--chart-4"),
    }),
    []
  );

  const { alpha, beta, mode, mean, curve, yMax, lnB, peakDensity } = useMemo(() => {
    const alpha = k + 1;
    const beta = m + 1;
    const mode = k === 0 && m === 0 ? null : k / (k + m);
    const mean = alpha / (alpha + beta);
    const lnB = lnGamma(alpha) + lnGamma(beta) - lnGamma(alpha + beta);
    const points = 201;
    const curve = Array.from({ length: points }, (_, i) => {
      const x = i / (points - 1);
      return { x, y: betaPDF(x, alpha, beta) };
    });
    const peak = Math.max(...curve.map((p) => (Number.isFinite(p.y) ? p.y : 0)));
    const peakDensity = mode === null ? 1 : betaPDF(mode, alpha, beta);
    const yMax = Math.max(1.5, peak * 1.1);
    return { alpha, beta, mode, mean, curve, yMax, lnB, peakDensity };
  }, [k, m]);

  const applyPreset = (preset: { k: number; m: number }) => {
    setK(preset.k);
    setM(preset.m);
  };

  return (
    <ModuleCard
      moduleNumber={3}
      totalModules={4}
      title="Beta Distribution Explorer"
      distribution="Beta(α, β)"
      context={
        <p>
          <strong>Kasus:</strong> Anda memantau <em>click-through rate</em>{" "}
          (CTR) fitur baru. Sebelum ada data, semua nilai CTR dianggap sama
          mungkin. Seiring data terkumpul, keyakinan Anda menguat.
        </p>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="beta-k" className="flex items-baseline justify-between text-sm font-semibold text-foreground">
            <span>k — Jumlah Klik (sukses)</span>
            <span className="font-mono text-primary">{k}</span>
          </label>
          <input
            id="beta-k"
            type="range"
            min={0}
            max={100}
            value={k}
            onChange={(e) => setK(parseInt(e.target.value, 10))}
            className="mt-2 w-full accent-primary"
          />
        </div>
        <div>
          <label htmlFor="beta-m" className="flex items-baseline justify-between text-sm font-semibold text-foreground">
            <span>m — Jumlah Tidak Klik (gagal)</span>
            <span className="font-mono text-primary">{m}</span>
          </label>
          <input
            id="beta-m"
            type="range"
            min={0}
            max={100}
            value={m}
            onChange={(e) => setM(parseInt(e.target.value, 10))}
            className="mt-2 w-full accent-primary"
          />
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
        <Stat label="α = k + 1" value={String(alpha)} />
        <Stat label="β = m + 1" value={String(beta)} />
        <Stat
          label="Modus"
          value={mode === null ? "—" : mode.toFixed(3)}
          highlight
        />
        <Stat label="Mean" value={mean.toFixed(3)} />
      </div>

      {k === 0 && m === 0 && (
        <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
          Beta(1, 1) = Uniform(0, 1) — Tidak ada modus, semua nilai CTR sama mungkin.
        </div>
      )}

      <DerivationPanel>
        <p className="font-semibold">Step 1 — Definisi Beta (Tsun, 2020, hal. 269):</p>
        <BlockMath
          math={String.raw`f_X(x) = \frac{1}{B(\alpha, \beta)}\, x^{\alpha - 1} (1-x)^{\beta - 1}, \quad x \in (0, 1)`}
        />

        <p className="font-semibold">Step 2 — Parameter dari data (off-by-one):</p>
        <BlockMath
          math={String.raw`\alpha = k + 1 = ${k} + 1 = ${alpha}, \quad \beta = m + 1 = ${m} + 1 = ${beta}`}
        />

        <p className="font-semibold">Step 3 — Hitung B(α, β) via Lanczos lnΓ:</p>
        <BlockMath
          math={String.raw`B(\alpha, \beta) = \frac{\Gamma(\alpha)\,\Gamma(\beta)}{\Gamma(\alpha + \beta)} \implies \ln B(${alpha}, ${beta}) = ${lnB.toFixed(4)}`}
        />

        <p className="font-semibold">Step 4 — Substitusi ke PDF:</p>
        <BlockMath
          math={String.raw`f_X(x) = \frac{x^{${alpha - 1}} (1-x)^{${beta - 1}}}{B(${alpha}, ${beta})}`}
        />

        <p className="font-semibold">Step 5 — Modus dan Mean:</p>
        <BlockMath
          math={String.raw`\text{Mode} = \frac{\alpha - 1}{\alpha + \beta - 2} = \frac{${k}}{${k + m}} ${mode === null ? "= \\text{tak terdefinisi}" : `= ${mode.toFixed(3)}`}`}
        />
        <BlockMath
          math={String.raw`\text{Mean} = \frac{\alpha}{\alpha + \beta} = \frac{${alpha}}{${alpha + beta}} = ${mean.toFixed(3)}`}
        />

        {mode !== null && (
          <>
            <p className="font-semibold">Step 6 — Densitas puncak (di modus):</p>
            <BlockMath
              math={String.raw`f_X(${mode.toFixed(3)}) = ${peakDensity.toFixed(3)}`}
            />
          </>
        )}
      </DerivationPanel>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">
          PDF Beta(α, β)
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
                domain={[0, 1]}
                tickFormatter={(v) => v.toFixed(1)}
                label={{ value: "x (CTR)", position: "insideBottom", offset: -2 }}
              />
              <YAxis
                domain={[0, yMax]}
                tickFormatter={(v) => v.toFixed(1)}
                width={50}
              />
              <Tooltip
                formatter={(v) => Number(v).toFixed(3)}
                labelFormatter={(v) => `x = ${Number(v).toFixed(3)}`}
              />
              <Area
                type="monotone"
                dataKey="y"
                stroke={colors.beta}
                strokeWidth={2}
                fill={colors.beta}
                fillOpacity={0.3}
              />
              {mode !== null && (
                <ReferenceLine
                  x={mode}
                  stroke={colors.marker}
                  strokeDasharray="5 5"
                  label={{
                    value: `Modus = ${mode.toFixed(3)}`,
                    position: "top",
                    fill: colors.marker,
                    fontSize: 12,
                  }}
                />
              )}
              <ReferenceLine
                x={mean}
                stroke={colors.mean}
                strokeDasharray="2 4"
                label={{
                  value: `Mean = ${mean.toFixed(3)}`,
                  position: "insideTopRight",
                  fill: colors.mean,
                  fontSize: 12,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-md border border-border bg-muted px-4 py-3 font-mono text-sm text-foreground">
        <p>
          Beta(α={alpha}, β={beta})
        </p>
        <p>Modus : {mode === null ? "—" : mode.toFixed(3)}</p>
        <p>Mean  : {mean.toFixed(3)}</p>
        <p className="mt-2 font-sans text-muted-foreground">
          Interpretasi: Seolah-olah sudah mengamati {k} klik dan {m} tidak klik.
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
