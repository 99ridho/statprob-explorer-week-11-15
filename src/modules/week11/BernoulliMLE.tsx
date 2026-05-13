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
import { cssVar } from "../../utils/themeColors";

const MIN_TRIALS = 1;
const MAX_TRIALS = 10;
const DEFAULT_TRIALS: (0 | 1)[] = [1, 1, 0, 1, 0];

export function BernoulliMLE() {
  const [trials, setTrials] = useState<(0 | 1)[]>(DEFAULT_TRIALS);

  const colors = useMemo(
    () => ({
      grid: cssVar("--border"),
      curve: cssVar("--chart-1"),
      marker: cssVar("--chart-2"),
      highlight: cssVar("--chart-5"),
    }),
    [],
  );

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
    setTrials((prev) =>
      prev.map((v, idx) => (idx === i ? ((1 - v) as 0 | 1) : v)),
    );

  const addTrial = () =>
    setTrials((prev) => (prev.length < MAX_TRIALS ? [...prev, 1] : prev));

  const removeTrial = () =>
    setTrials((prev) => (prev.length > MIN_TRIALS ? prev.slice(0, -1) : prev));

  const candidateThetas = [0.1, 0.3, thetaHat, 0.8, 1.0];

  return (
    <ModuleCard
      moduleNumber={1}
      totalModules={4}
      title="MLE: Bernoulli"
      distribution="Bernoulli"
      context={
        <p>
          <strong>Kasus:</strong> Tim QA menguji sejumlah fitur. Setiap fitur:
          ✅ lulus (1) atau ❌ gagal (0). Berapa estimasi probabilitas lulus
          (θ)?
        </p>
      }
    >
      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">
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
                  ? "border-secondary bg-secondary/10 text-secondary"
                  : "border-destructive bg-destructive/10 text-destructive",
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
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Tambah Fitur
          </button>
          <button
            type="button"
            onClick={removeTrial}
            disabled={trials.length <= MIN_TRIALS}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
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
        <BlockMath
          math={String.raw`L(\theta) = \theta^{${k}} (1-\theta)^{${n - k}}`}
        />

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
        <div className="rounded-md border border-accent bg-accent/20 px-4 py-2 text-sm text-accent-foreground">
          {k === 0 ? "Semua gagal → θ̂ = 0" : "Semua lulus → θ̂ = 1"}
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">
          Kurva Likelihood L(θ)
        </p>
        <div className="h-64 w-full" style={{ minWidth: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={curve}
              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis
                dataKey="theta"
                type="number"
                domain={[0, 1]}
                tickFormatter={(v) => v.toFixed(1)}
                label={{ value: "θ", position: "insideBottom", offset: -2 }}
              />
              <YAxis tickFormatter={(v) => v.toExponential(1)} width={70} />
              <Tooltip
                formatter={(v) => Number(v).toExponential(3)}
                labelFormatter={(v) => `θ = ${Number(v).toFixed(3)}`}
              />
              <Line
                type="monotone"
                dataKey="L"
                stroke={colors.curve}
                strokeWidth={2}
                dot={false}
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
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">
          Perbandingan kandidat θ
        </p>
        <div className="overflow-hidden rounded-md border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2 font-semibold text-muted-foreground">
                  θ
                </th>
                <th className="px-4 py-2 font-semibold text-muted-foreground">
                  L(θ)
                </th>
                <th className="px-4 py-2 font-semibold text-muted-foreground">
                  Catatan
                </th>
              </tr>
            </thead>
            <tbody>
              {candidateThetas.map((theta, idx) => {
                const isMLE = idx === 2;
                return (
                  <tr
                    key={idx}
                    style={
                      isMLE ? { backgroundColor: colors.highlight } : undefined
                    }
                    className="border-t border-border"
                  >
                    <td className="px-4 py-2 font-mono text-foreground">
                      {isMLE ? (
                        <strong>θ̂ MLE = {theta.toFixed(3)}</strong>
                      ) : (
                        theta.toFixed(2)
                      )}
                    </td>
                    <td className="px-4 py-2 font-mono text-foreground">
                      {bernoulliLikelihood(theta, k, n).toExponential(3)}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
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
