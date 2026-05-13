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
import { ModuleCard } from "../../components/ModuleCard";
import { DerivationPanel } from "../../components/DerivationPanel";
import { poissonLogLikelihood } from "../../utils/mathUtils";

const MIN_OBS = 1;
const MAX_OBS = 8;
const MAX_VALUE = 20;
const DEFAULT_OBS = [3, 0, 2, 7];

function clamp(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(MAX_VALUE, Math.floor(value)));
}

export function PoissonMLE() {
  const [obs, setObs] = useState<number[]>(DEFAULT_OBS);

  const { n, sumX, thetaHat, curve, suppressChart } = useMemo(() => {
    const n = obs.length;
    const sumX = obs.reduce((s, x) => s + x, 0);
    const thetaHat = n === 0 ? 0 : sumX / n;
    const suppressChart = sumX === 0;
    const xMax = Math.max(2 * thetaHat, 10);
    const xMin = 0.01;
    const points = 200;
    const step = (xMax - xMin) / (points - 1);
    const curve = suppressChart
      ? []
      : Array.from({ length: points }, (_, i) => {
          const theta = xMin + i * step;
          return { theta, lnL: poissonLogLikelihood(theta, n, sumX) };
        });
    return { n, sumX, thetaHat, curve, suppressChart };
  }, [obs]);

  const setValue = (i: number, raw: string) => {
    const value = clamp(parseInt(raw, 10));
    setObs((prev) => prev.map((v, idx) => (idx === i ? value : v)));
  };

  const addObs = () =>
    setObs((prev) => (prev.length < MAX_OBS ? [...prev, 0] : prev));

  const removeObs = () =>
    setObs((prev) => (prev.length > MIN_OBS ? prev.slice(0, -1) : prev));

  return (
    <ModuleCard
      moduleNumber={2}
      totalModules={3}
      title="MLE: Poisson"
      distribution="Poisson"
      context={
        <p>
          <strong>Kasus:</strong> Sistem DevOps mencatat jumlah error API per
          jam. Berapa estimasi rata-rata error per jam (λ)?
        </p>
      }
    >
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">
          Observasi error per jam ({n} jam)
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {obs.map((v, i) => (
            <label
              key={i}
              className="flex flex-col items-center gap-1 text-xs text-slate-500"
            >
              <span>Jam {i + 1}</span>
              <input
                type="number"
                min={0}
                max={MAX_VALUE}
                value={v}
                onChange={(e) => setValue(i, e.target.value)}
                className="h-10 w-16 rounded-md border border-cardBorder bg-white px-2 text-center text-base font-mono text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </label>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={addObs}
            disabled={obs.length >= MAX_OBS}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Tambah Jam
          </button>
          <button
            type="button"
            onClick={removeObs}
            disabled={obs.length <= MIN_OBS}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            − Hapus
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="n (observasi)" value={String(n)} />
        <Stat label="Σxᵢ" value={String(sumX)} />
        <Stat label="θ̂ MLE" value={thetaHat.toFixed(3)} highlight />
      </div>

      <DerivationPanel>
        <p className="font-semibold">Step 1 — Likelihood:</p>
        <BlockMath
          math={`L(\\theta) = \\prod_{i=1}^{${n}} \\frac{e^{-\\theta}\\theta^{x_i}}{x_i!} = \\frac{e^{-${n}\\theta} \\cdot \\theta^{${sumX}}}{\\prod x_i!}`}
        />

        <p className="font-semibold">
          Step 2 — Log-likelihood (drop konstanta C):
        </p>
        <BlockMath
          math={`\\ln L(\\theta) = -${n}\\theta + ${sumX}\\ln\\theta + C`}
        />

        <p className="font-semibold">Step 3 — Derivatif, set ke nol:</p>
        <BlockMath
          math={`\\frac{d \\ln L}{d\\theta} = -${n} + \\frac{${sumX}}{\\theta} = 0`}
        />

        <p className="font-semibold">Step 4 — Selesaikan:</p>
        <BlockMath
          math={`\\hat{\\theta}_{MLE} = \\frac{${sumX}}{${n}} = ${thetaHat.toFixed(3)}`}
        />
      </DerivationPanel>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">
          Kurva Log-Likelihood ln L(θ)
        </p>
        {suppressChart ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Σxᵢ = 0 → log-likelihood tidak terdefinisi pada θ &gt; 0 (ln 0).
            Tambahkan minimal satu error untuk menampilkan kurva.
          </div>
        ) : (
          <div className="h-64 w-full" style={{ minWidth: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={curve}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="theta"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(v) => v.toFixed(1)}
                  label={{
                    value: "θ (error per jam)",
                    position: "insideBottom",
                    offset: -2,
                  }}
                />
                <YAxis
                  tickFormatter={(v) => v.toFixed(1)}
                  width={60}
                  label={{
                    value: "ln L(θ)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(v) => Number(v).toFixed(3)}
                  labelFormatter={(v) => `θ = ${Number(v).toFixed(3)}`}
                />
                <Line
                  type="monotone"
                  dataKey="lnL"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <ReferenceLine
                  x={thetaHat}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{
                    value: `θ̂ = ${thetaHat.toFixed(2)} error/jam`,
                    position: "top",
                    fill: "#ef4444",
                    fontSize: 12,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {!suppressChart && (
        <div className="rounded-md border-l-4 border-indigo-400 bg-indigo-50 px-4 py-3 text-sm text-slate-700">
          Estimasi MLE: rata-rata{" "}
          <strong>{thetaHat.toFixed(2)} error per jam</strong>. Sistem alerting:
          kirim notifikasi jika error &gt;{" "}
          <strong>{(2 * thetaHat).toFixed(2)} per jam</strong>.
        </div>
      )}
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
          ? "border-indigo-200 bg-indigo-50"
          : "border-cardBorder bg-slate-50",
      ].join(" ")}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p
        className={[
          "mt-0.5 font-mono text-lg font-semibold",
          highlight ? "text-indigo-700" : "text-slate-800",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}
