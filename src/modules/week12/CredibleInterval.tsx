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
import { betaInverseCDF, betaPDF, bernoulliCI } from "../../utils/mathUtils";
import { cssVar } from "../../utils/themeColors";

const LEVELS = [
  { label: "80%", value: 0.8, z: 1.282 },
  { label: "90%", value: 0.9, z: 1.645 },
  { label: "95%", value: 0.95, z: 1.96 },
  { label: "99%", value: 0.99, z: 2.576 },
] as const;
type LevelValue = (typeof LEVELS)[number]["value"];

const PRESETS: {
  label: string;
  alpha0: number;
  beta0: number;
  k: number;
  m: number;
  level: LevelValue;
}[] = [
  { label: "Buku Tsun (n=12, k=11)", alpha0: 7, beta0: 3, k: 11, m: 1, level: 0.8 },
  { label: "Retention smart-sync (prior historis)", alpha0: 14, beta0: 6, k: 210, m: 90, level: 0.95 },
  { label: "Uninformative + Bernoulli buku", alpha0: 1, beta0: 1, k: 136, m: 264, level: 0.99 },
];

export function CredibleInterval() {
  const [alpha0, setAlpha0] = useState(7);
  const [beta0, setBeta0] = useState(3);
  const [k, setK] = useState(11);
  const [m, setM] = useState(1);
  const [level, setLevel] = useState<LevelValue>(0.8);

  const colors = useMemo(
    () => ({
      grid: cssVar("--border"),
      curve: cssVar("--chart-3"),
      band: cssVar("--chart-1"),
      mean: cssVar("--chart-4"),
      mode: cssVar("--chart-2"),
      freq: cssVar("--chart-5"),
    }),
    [],
  );

  const levelMeta = LEVELS.find((l) => l.value === level)!;
  const z = levelMeta.z;
  const levelPct = Math.round(level * 100);
  const alphaVal = 1 - level;

  const {
    alpha,
    beta,
    posteriorMean,
    posteriorMode,
    lower,
    upper,
    curve,
    yMax,
    freqCI,
  } = useMemo(() => {
    const alpha = alpha0 + k;
    const beta = beta0 + m;
    const posteriorMean = alpha / (alpha + beta);
    const posteriorMode =
      alpha > 1 && beta > 1
        ? (alpha - 1) / (alpha + beta - 2)
        : null;
    const lower = betaInverseCDF(alphaVal / 2, alpha, beta);
    const upper = betaInverseCDF(1 - alphaVal / 2, alpha, beta);
    const n = k + m;
    const freqCI = n > 0 ? bernoulliCI(k, n, z) : null;

    const points = 201;
    const curve = Array.from({ length: points }, (_, i) => {
      const x = i / (points - 1);
      const density = betaPDF(x, alpha, beta);
      const inCI = x >= lower && x <= upper;
      return {
        x,
        density,
        ciBand: inCI ? density : 0,
      };
    });
    const peak = Math.max(...curve.map((p) => (Number.isFinite(p.density) ? p.density : 0)));
    const yMax = Math.max(1.5, peak * 1.1);
    return {
      alpha,
      beta,
      posteriorMean,
      posteriorMode,
      lower,
      upper,
      curve,
      yMax,
      freqCI,
    };
  }, [alpha0, beta0, k, m, alphaVal, z]);

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setAlpha0(p.alpha0);
    setBeta0(p.beta0);
    setK(p.k);
    setM(p.m);
    setLevel(p.level);
  };

  return (
    <ModuleCard
      moduleNumber={4}
      totalModules={4}
      title="Credible Interval (Bayesian) vs Confidence Interval"
      distribution="Beta posterior — konjugat Bernoulli"
      context={
        <p>
          <strong>Kasus:</strong> NimbusStore mengestimasi retention rate fitur
          baru. Kombinasikan prior dari data historis dengan observasi baru.
          Bandingkan credible interval (Bayesian) dengan confidence interval
          (frequentist).
        </p>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SliderField
          id="cr-a0"
          label="α₀ (prior)"
          value={alpha0}
          min={1}
          max={50}
          onChange={setAlpha0}
        />
        <SliderField
          id="cr-b0"
          label="β₀ (prior)"
          value={beta0}
          min={1}
          max={50}
          onChange={setBeta0}
        />
        <SliderField
          id="cr-k"
          label="k (sukses baru)"
          value={k}
          min={0}
          max={500}
          onChange={setK}
        />
        <SliderField
          id="cr-m"
          label="m (gagal baru)"
          value={m}
          min={0}
          max={500}
          onChange={setM}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">
          Credible level
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
        <Stat label="α posterior" value={String(alpha)} />
        <Stat label="β posterior" value={String(beta)} />
        <Stat label="Posterior mean" value={posteriorMean.toFixed(3)} />
        <Stat
          label="Posterior mode"
          value={posteriorMode === null ? "—" : posteriorMode.toFixed(3)}
        />
      </div>

      <DerivationPanel>
        <p className="font-semibold">
          Step 1 — Definisi credible interval (Tsun, 2020, hal. 304, Def 8.2.1):
        </p>
        <BlockMath
          math={String.raw`P(\Theta \in [a, b]) = 1 - \alpha,\quad [a, b] = \left[F_Y^{-1}\!\left(\tfrac{\alpha}{2}\right),\; F_Y^{-1}\!\left(1 - \tfrac{\alpha}{2}\right)\right]`}
        />

        <p className="font-semibold">Step 2 — Parameter posterior (konjugat Beta–Bernoulli):</p>
        <BlockMath
          math={String.raw`\Theta \mid x \sim \mathrm{Beta}(\alpha_0 + k,\; \beta_0 + m) = \mathrm{Beta}(${alpha0} + ${k},\; ${beta0} + ${m}) = \mathrm{Beta}(${alpha},\; ${beta})`}
        />

        <p className="font-semibold">Step 3 — Substitusi kuantil:</p>
        <BlockMath
          math={String.raw`a = F^{-1}_{\mathrm{Beta}(${alpha}, ${beta})}\!\left(${(alphaVal / 2).toFixed(3)}\right),\quad b = F^{-1}_{\mathrm{Beta}(${alpha}, ${beta})}\!\left(${(1 - alphaVal / 2).toFixed(3)}\right)`}
        />

        <p className="font-semibold">Step 4 — Hasil:</p>
        <BlockMath
          math={String.raw`\text{Credible Interval}_{${levelPct}\%} = [${lower.toFixed(4)},\; ${upper.toFixed(4)}]`}
        />
        <p className="font-sans text-foreground">
          Interpretasi langsung: ada {levelPct}% probabilitas bahwa Θ berada di
          antara <strong>{lower.toFixed(3)}</strong> dan{" "}
          <strong>{upper.toFixed(3)}</strong>.
        </p>
      </DerivationPanel>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">
          Posterior Beta(α, β) dengan pita credible interval {levelPct}%
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
                tickFormatter={(v) => Number(v).toFixed(1)}
                label={{ value: "θ", position: "insideBottom", offset: -2 }}
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
                labelFormatter={(v) => `θ = ${Number(v).toFixed(3)}`}
              />
              <Area
                type="monotone"
                dataKey="density"
                stroke={colors.curve}
                strokeWidth={2}
                fill={colors.curve}
                fillOpacity={0.15}
                name="Posterior PDF"
              />
              <Area
                type="monotone"
                dataKey="ciBand"
                stroke="none"
                fill={colors.band}
                fillOpacity={0.4}
                name={`Credible band ${levelPct}%`}
              />
              <ReferenceLine
                x={posteriorMean}
                stroke={colors.mean}
                strokeDasharray="2 4"
                label={{
                  value: `mean = ${posteriorMean.toFixed(3)}`,
                  position: "insideTopRight",
                  fill: colors.mean,
                  fontSize: 11,
                }}
              />
              {posteriorMode !== null && (
                <ReferenceLine
                  x={posteriorMode}
                  stroke={colors.mode}
                  strokeDasharray="5 5"
                  label={{
                    value: `mode = ${posteriorMode.toFixed(3)}`,
                    position: "top",
                    fill: colors.mode,
                    fontSize: 11,
                  }}
                />
              )}
              <ReferenceLine x={lower} stroke={colors.band} strokeDasharray="1 3" />
              <ReferenceLine x={upper} stroke={colors.band} strokeDasharray="1 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">
          Perbandingan langsung: Credible Interval vs Confidence Interval
        </p>
        <div className="overflow-hidden rounded-md border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2 font-semibold text-muted-foreground">
                  Dimensi
                </th>
                <th className="px-4 py-2 font-semibold text-muted-foreground">
                  Credible Interval (Bayesian)
                </th>
                <th className="px-4 py-2 font-semibold text-muted-foreground">
                  Confidence Interval (Frequentist)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-2 font-semibold text-foreground">
                  Apa itu θ?
                </td>
                <td className="px-4 py-2 text-foreground">Variabel acak Θ</td>
                <td className="px-4 py-2 text-foreground">Tetap, tidak diketahui</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-semibold text-foreground">
                  Interval pada data ini
                </td>
                <td className="px-4 py-2 font-mono text-foreground" style={{ color: colors.band }}>
                  [{lower.toFixed(3)}, {upper.toFixed(3)}]
                </td>
                <td className="px-4 py-2 font-mono text-foreground" style={{ color: colors.freq }}>
                  {freqCI
                    ? `[${freqCI.lower.toFixed(3)}, ${freqCI.upper.toFixed(3)}]`
                    : "—"}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-semibold text-foreground">
                  Rumus
                </td>
                <td className="px-4 py-2 font-mono text-xs text-foreground">
                  [F⁻¹(α/2), F⁻¹(1−α/2)]
                </td>
                <td className="px-4 py-2 font-mono text-xs text-foreground">
                  θ̂ ± z·σ̂/√n
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-semibold text-foreground">
                  Interpretasi
                </td>
                <td className="px-4 py-2 text-foreground">
                  P(Θ ∈ [a,b]) = {levelPct}% — pernyataan probabilitas langsung
                </td>
                <td className="px-4 py-2 text-foreground">
                  {levelPct}% dari prosedur akan menghasilkan interval yang
                  mengandung θ
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-semibold text-foreground">
                  Butuh prior?
                </td>
                <td className="px-4 py-2 text-foreground">Ya — Beta(α₀, β₀)</td>
                <td className="px-4 py-2 text-foreground">Tidak</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-md border border-border bg-muted px-4 py-3 font-mono text-sm text-foreground">
        <p>
          Posterior : Beta({alpha}, {beta}) — seolah-olah sudah mengamati{" "}
          {alpha - 1} sukses dan {beta - 1} gagal total (prior + data).
        </p>
        <p className="mt-1 font-sans text-muted-foreground">
          Bila α₀ = 1, β₀ = 1 (uniform prior), posterior runtuh ke Beta(k+1,
          m+1) — identik dengan Modul 11.3 Beta Explorer.
        </p>
      </div>
    </ModuleCard>
  );
}

function SliderField({
  id,
  label,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
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
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="mt-2 w-full accent-primary"
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
