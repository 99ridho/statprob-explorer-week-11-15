import { useMemo, useState } from "react";
import { BlockMath } from "react-katex";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DerivationPanel } from "../../components/DerivationPanel";
import { ModuleCard } from "../../components/ModuleCard";
import { betaPDF, dirichletPDF, lnMultiBeta } from "../../utils/mathUtils";
import { cssVar } from "../../utils/themeColors";

const CATEGORIES = [
  { key: "p1", label: "Positif", emoji: "😊" },
  { key: "p2", label: "Netral", emoji: "😐" },
  { key: "p3", label: "Negatif", emoji: "😞" },
] as const;

const PRESETS: { label: string; k1: number; k2: number; k3: number }[] = [
  { label: "Belum ada data", k1: 0, k2: 0, k3: 0 },
  { label: "Ulasan awal (600/250/150)", k1: 600, k2: 250, k3: 150 },
  { label: "Imbang (10/10/10)", k1: 10, k2: 10, k3: 10 },
  { label: "Polar (50/5/45)", k1: 50, k2: 5, k3: 45 },
];

export function DirichletExplorer() {
  const [k1, setK1] = useState(0);
  const [k2, setK2] = useState(0);
  const [k3, setK3] = useState(0);

  const colors = useMemo(
    () => ({
      grid: cssVar("--border"),
      pos: cssVar("--chart-5"),
      net: cssVar("--chart-3"),
      neg: cssVar("--chart-4"),
    }),
    []
  );

  const seriesColors = [colors.pos, colors.net, colors.neg];

  const {
    alphas,
    alpha0,
    modes,
    means,
    curve,
    yMax,
    isUniform,
    lnB,
    densityAtMode,
  } = useMemo(() => {
    const ks = [k1, k2, k3];
    const alphas = ks.map((k) => k + 1);
    const alpha0 = alphas[0] + alphas[1] + alphas[2];
    const totalK = ks[0] + ks[1] + ks[2];
    const isUniform = totalK === 0;
    const modes = isUniform
      ? [null, null, null]
      : ks.map((k) => k / totalK);
    const means = alphas.map((a) => a / alpha0);
    const lnB = lnMultiBeta(alphas);
    const densityAtMode = isUniform
      ? null
      : dirichletPDF(modes as number[], alphas);
    const points = 201;
    const curve = Array.from({ length: points }, (_, i) => {
      const x = i / (points - 1);
      return {
        x,
        p1: betaPDF(x, alphas[0], alpha0 - alphas[0]),
        p2: betaPDF(x, alphas[1], alpha0 - alphas[1]),
        p3: betaPDF(x, alphas[2], alpha0 - alphas[2]),
      };
    });
    let peak = 0;
    for (const point of curve) {
      for (const key of ["p1", "p2", "p3"] as const) {
        const v = point[key];
        if (Number.isFinite(v) && v > peak) peak = v;
      }
    }
    const yMax = Math.max(1.5, peak * 1.1);
    return {
      alphas,
      alpha0,
      modes,
      means,
      curve,
      yMax,
      isUniform,
      lnB,
      densityAtMode,
    };
  }, [k1, k2, k3]);

  const applyPreset = (preset: { k1: number; k2: number; k3: number }) => {
    setK1(preset.k1);
    setK2(preset.k2);
    setK3(preset.k3);
  };

  return (
    <ModuleCard
      moduleNumber={4}
      totalModules={4}
      title="Dirichlet Distribution Explorer"
      distribution="Dir(α₁, α₂, α₃)"
      context={
        <p>
          <strong>Kasus:</strong> Sebuah platform e-commerce mengklasifikasikan
          sentimen ulasan produk menjadi tiga kategori: 😊 Positif, 😐 Netral,
          😞 Negatif. Sistem memperbarui distribusi Dirichlet setiap kali
          ulasan baru masuk — tanpa melatih ulang model dari nol.
        </p>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <SliderField
          id="dir-k1"
          label="k₁ — Ulasan Positif"
          value={k1}
          onChange={setK1}
        />
        <SliderField
          id="dir-k2"
          label="k₂ — Ulasan Netral"
          value={k2}
          onChange={setK2}
        />
        <SliderField
          id="dir-k3"
          label="k₃ — Ulasan Negatif"
          value={k3}
          onChange={setK3}
        />
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
        <Stat label="α₁ = k₁ + 1" value={String(alphas[0])} />
        <Stat label="α₂ = k₂ + 1" value={String(alphas[1])} />
        <Stat label="α₃ = k₃ + 1" value={String(alphas[2])} />
        <Stat label="α₀ = Σ αⱼ" value={String(alpha0)} highlight />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {CATEGORIES.map((cat, i) => (
          <CategoryStat
            key={cat.key}
            color={seriesColors[i]}
            title={`${cat.emoji} ${cat.label}`}
            mode={modes[i]}
            mean={means[i]}
          />
        ))}
      </div>

      {isUniform && (
        <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
          Dir(1, 1, 1) = Uniform pada simplex — semua proporsi sama mungkin.
        </div>
      )}

      <DerivationPanel>
        <p className="font-semibold">Step 1 — Definisi Dirichlet (Tsun, 2020, hal. 270):</p>
        <BlockMath
          math={String.raw`f_X(x) = \frac{1}{B(\alpha)} \prod_{i=1}^{r} x_i^{\alpha_i - 1}, \quad x_i \in (0, 1),\ \sum_{i=1}^{r} x_i = 1`}
        />

        <p className="font-semibold">Step 2 — Parameter dari data (r = 3, off-by-one):</p>
        <BlockMath
          math={String.raw`\alpha_i = k_i + 1 \implies \alpha = (${k1}+1,\ ${k2}+1,\ ${k3}+1) = (${alphas[0]},\ ${alphas[1]},\ ${alphas[2]})`}
        />
        <BlockMath
          math={String.raw`\alpha_0 = \sum_{j=1}^{3} \alpha_j = ${alphas[0]} + ${alphas[1]} + ${alphas[2]} = ${alpha0}`}
        />

        <p className="font-semibold">Step 3 — Hitung B(α) via multivariate Lanczos lnΓ:</p>
        <BlockMath
          math={String.raw`B(\alpha) = \frac{\prod_{i=1}^{3} \Gamma(\alpha_i)}{\Gamma(\alpha_0)} \implies \ln B(\alpha) = \sum_{i=1}^{3} \ln \Gamma(\alpha_i) - \ln \Gamma(\alpha_0) = ${lnB.toFixed(4)}`}
        />

        <p className="font-semibold">Step 4 — Substitusi ke PDF:</p>
        <BlockMath
          math={String.raw`f_X(x) = \frac{x_1^{${alphas[0] - 1}}\, x_2^{${alphas[1] - 1}}\, x_3^{${alphas[2] - 1}}}{B(${alphas[0]}, ${alphas[1]}, ${alphas[2]})}`}
        />

        <p className="font-semibold">Step 5 — Modus dan Mean per kategori:</p>
        <BlockMath
          math={String.raw`\hat{p}_i = \frac{k_i}{\sum_j k_j} ${
            isUniform
              ? "= \\text{tak terdefinisi (semua } k_i = 0\\text{)}"
              : `= \\left(\\tfrac{${k1}}{${k1 + k2 + k3}},\\ \\tfrac{${k2}}{${k1 + k2 + k3}},\\ \\tfrac{${k3}}{${k1 + k2 + k3}}\\right) = (${modes[0]!.toFixed(3)},\\ ${modes[1]!.toFixed(3)},\\ ${modes[2]!.toFixed(3)})`
          }`}
        />
        <BlockMath
          math={String.raw`\bar{p}_i = \frac{\alpha_i}{\alpha_0} = \left(\tfrac{${alphas[0]}}{${alpha0}},\ \tfrac{${alphas[1]}}{${alpha0}},\ \tfrac{${alphas[2]}}{${alpha0}}\right) = (${means[0].toFixed(3)},\ ${means[1].toFixed(3)},\ ${means[2].toFixed(3)})`}
        />

        {!isUniform && densityAtMode !== null && (
          <>
            <p className="font-semibold">Step 6 — Densitas pada modus:</p>
            <BlockMath
              math={String.raw`f_X(\hat{p}) = ${densityAtMode.toExponential(3)}`}
            />
          </>
        )}

        <p className="font-semibold">Step 7 — Hubungan Beta–Dirichlet (marginal):</p>
        <BlockMath
          math={String.raw`X_i \sim \mathrm{Beta}(\alpha_i,\ \alpha_0 - \alpha_i) \implies X_1 \sim \mathrm{Beta}(${alphas[0]},\ ${alpha0 - alphas[0]})`}
        />
        <p className="font-sans text-muted-foreground">
          Bila k₃ = 0 dan hanya k₁, k₂ yang divariasikan, marginal Positif
          identik dengan Beta(k₁+1, k₂+1) di Modul 3 — Dirichlet runtuh menjadi
          Beta saat r = 2.
        </p>
      </DerivationPanel>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">
          Marginal PDF — Beta(αᵢ, α₀ − αᵢ) per kategori
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
                label={{
                  value: "x (proporsi kategori)",
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
                formatter={(v) => Number(v).toFixed(3)}
                labelFormatter={(v) => `x = ${Number(v).toFixed(3)}`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="p1"
                name="Positif"
                stroke={colors.pos}
                strokeWidth={2}
                fill={colors.pos}
                fillOpacity={0.25}
              />
              <Area
                type="monotone"
                dataKey="p2"
                name="Netral"
                stroke={colors.net}
                strokeWidth={2}
                fill={colors.net}
                fillOpacity={0.25}
              />
              <Area
                type="monotone"
                dataKey="p3"
                name="Negatif"
                stroke={colors.neg}
                strokeWidth={2}
                fill={colors.neg}
                fillOpacity={0.25}
              />
              <ReferenceLine
                x={means[0]}
                stroke={colors.pos}
                strokeDasharray="2 4"
              />
              <ReferenceLine
                x={means[1]}
                stroke={colors.net}
                strokeDasharray="2 4"
              />
              <ReferenceLine
                x={means[2]}
                stroke={colors.neg}
                strokeDasharray="2 4"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-md border border-border bg-muted px-4 py-3 font-mono text-sm text-foreground">
        <p>
          Dir(α₁={alphas[0]}, α₂={alphas[1]}, α₃={alphas[2]})
        </p>
        <p>
          Modus :{" "}
          {isUniform
            ? "—"
            : `(${modes[0]!.toFixed(3)}, ${modes[1]!.toFixed(3)}, ${modes[2]!.toFixed(3)})`}
        </p>
        <p>
          Mean  : ({means[0].toFixed(3)}, {means[1].toFixed(3)},{" "}
          {means[2].toFixed(3)})
        </p>
        <p className="mt-2 font-sans text-muted-foreground">
          Interpretasi: Seolah-olah sudah mengamati {k1} positif, {k2} netral,
          dan {k3} negatif.
        </p>
      </div>
    </ModuleCard>
  );
}

function SliderField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
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
        min={0}
        max={1000}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="mt-2 w-full accent-primary"
      />
    </div>
  );
}

function CategoryStat({
  color,
  title,
  mode,
  mean,
}: {
  color: string;
  title: string;
  mode: number | null;
  mean: number;
}) {
  return (
    <div
      className="rounded-md border bg-muted px-3 py-2"
      style={{ borderColor: color }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-wider"
        style={{ color }}
      >
        {title}
      </p>
      <p className="mt-1 font-mono text-sm text-foreground">
        Modus : {mode === null ? "—" : mode.toFixed(3)}
      </p>
      <p className="font-mono text-sm text-foreground">
        Mean &nbsp;: {mean.toFixed(3)}
      </p>
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
