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
import { bernoulliLikelihood } from "../../utils/mathUtils";

const MIN_TRIALS = 1;
const MAX_TRIALS = 10;
const DEFAULT_TRIALS: (0 | 1)[] = [1, 1, 0, 1, 0];

export function BernoulliMLE() {
  const [trials, setTrials] = useState<(0 | 1)[]>(DEFAULT_TRIALS);

  const { n, k, thetaHat, likelihoodAtHat, curve } = useMemo(() => {
    const n = trials.length;
    const k = trials.reduce<number>((s, x) => s + x, 0);
    const thetaHat = n === 0 ? 0 : k / n;
    const likelihoodAtHat = bernoulliLikelihood(thetaHat, k, n);
    const curve = Array.from({ length: 101 }, (_, i) => {
      const theta = i / 100;
      return { theta, L: bernoulliLikelihood(theta, k, n) };
    });
    return { n, k, thetaHat, likelihoodAtHat, curve };
  }, [trials]);

  const toggleTrial = (i: number) =>
    setTrials((prev) => prev.map((v, idx) => (idx === i ? ((1 - v) as 0 | 1) : v)));

  const addTrial = () =>
    setTrials((prev) => (prev.length < MAX_TRIALS ? [...prev, 1] : prev));

  const removeTrial = () =>
    setTrials((prev) => (prev.length > MIN_TRIALS ? prev.slice(0, -1) : prev));

  const candidateThetas = [0.1, 0.3, thetaHat, 0.8, 1.0];

  return (
    <ModuleCard
      moduleNumber={1}
      totalModules={3}
      title="MLE: Bernoulli"
      distribution="Bernoulli"
      context={
        <p>
          <strong>Kasus:</strong> Tim QA menguji sejumlah fitur. Setiap fitur:
          ✅ lulus (1) atau ❌ gagal (0). Berapa estimasi probabilitas lulus (θ)?
        </p>
      }
    >
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">
          Data percobaan ({n} fitur)
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {trials.map((v, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleTrial(i)}
              className={[
                "flex h-12 w-12 items-center justify-center rounded-md border text-xl transition-colors",
                v === 1
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-rose-300 bg-rose-50 text-rose-700",
              ].join(" ")}
              aria-label={`Trial ${i + 1}: ${v === 1 ? "lulus" : "gagal"}`}
            >
              {v === 1 ? "✅" : "❌"}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={addTrial}
            disabled={trials.length >= MAX_TRIALS}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Tambah Fitur
          </button>
          <button
            type="button"
            onClick={removeTrial}
            disabled={trials.length <= MIN_TRIALS}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            − Hapus
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="n (total trial)" value={String(n)} />
        <Stat label="k (sukses)" value={String(k)} />
        <Stat label="θ̂ MLE" value={thetaHat.toFixed(3)} highlight />
        <Stat label="L(θ̂)" value={likelihoodAtHat.toExponential(3)} />
      </div>

      <DerivationPanel>
        <p className="font-semibold">Step 1 — Likelihood:</p>
        <BlockMath math={String.raw`L(\theta) = \theta^{${k}} (1-\theta)^{${n - k}}`} />

        <p className="font-semibold">Step 2 — Log-likelihood:</p>
        <BlockMath
          math={String.raw`\ln L(\theta) = ${k} \ln\theta + ${n - k} \ln(1-\theta)`}
        />

        <p className="font-semibold">Step 3 — Derivatif, set ke nol:</p>
        <BlockMath
          math={String.raw`\frac{d \ln L}{d\theta} = \frac{${k}}{\theta} - \frac{${n - k}}{1-\theta} = 0`}
        />

        <p className="font-semibold">Step 4 — Selesaikan:</p>
        <BlockMath
          math={String.raw`${k}(1-\theta) = ${n - k}\,\theta \implies ${k} = ${n}\theta \implies \hat{\theta}_{MLE} = \frac{${k}}{${n}} = ${thetaHat.toFixed(3)}`}
        />
      </DerivationPanel>

      {(k === 0 || k === n) && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          {k === 0
            ? "Semua gagal → θ̂ = 0"
            : "Semua lulus → θ̂ = 1"}
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">
          Kurva Likelihood L(θ)
        </p>
        <div className="h-64 w-full" style={{ minWidth: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curve} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="theta"
                type="number"
                domain={[0, 1]}
                tickFormatter={(v) => v.toFixed(1)}
                label={{ value: "θ", position: "insideBottom", offset: -2 }}
              />
              <YAxis
                tickFormatter={(v) => v.toExponential(1)}
                width={70}
              />
              <Tooltip
                formatter={(v) => Number(v).toExponential(3)}
                labelFormatter={(v) => `θ = ${Number(v).toFixed(3)}`}
              />
              <Line
                type="monotone"
                dataKey="L"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              <ReferenceLine
                x={thetaHat}
                stroke="#ef4444"
                strokeDasharray="5 5"
                label={{
                  value: `θ̂ = ${thetaHat.toFixed(3)}`,
                  position: "top",
                  fill: "#ef4444",
                  fontSize: 12,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">
          Perbandingan kandidat θ
        </p>
        <div className="overflow-hidden rounded-md border border-cardBorder">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-2 font-semibold text-slate-600">θ</th>
                <th className="px-4 py-2 font-semibold text-slate-600">L(θ)</th>
                <th className="px-4 py-2 font-semibold text-slate-600">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {candidateThetas.map((theta, idx) => {
                const isMLE = idx === 2;
                return (
                  <tr
                    key={idx}
                    style={isMLE ? { backgroundColor: "#dcfce7" } : undefined}
                    className="border-t border-cardBorder"
                  >
                    <td className="px-4 py-2 font-mono text-slate-800">
                      {isMLE ? (
                        <strong>θ̂ MLE = {theta.toFixed(3)}</strong>
                      ) : (
                        theta.toFixed(2)
                      )}
                    </td>
                    <td className="px-4 py-2 font-mono text-slate-800">
                      {bernoulliLikelihood(theta, k, n).toExponential(3)}
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      {isMLE ? "← tertinggi" : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
