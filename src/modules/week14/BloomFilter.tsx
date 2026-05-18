import { useMemo, useState } from "react";
import { BlockMath, InlineMath } from "react-katex";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DerivationPanel } from "../../components/DerivationPanel";
import { ModuleCard } from "../../components/ModuleCard";
import { bloomFPR, bloomHash, mulberry32 } from "../../utils/mathUtils";
import { cssVar } from "../../utils/themeColors";

type Preset = {
  label: string;
  m: number;
  k: number;
  n: number;
  note?: string;
};

const PRESETS: Preset[] = [
  { label: "Default (m=1024, k=4, n=200)", m: 1024, k: 4, n: 200 },
  { label: "Kecil (m=128, k=3, n=40)", m: 128, k: 3, n: 40 },
  { label: "Padat (m=512, k=6, n=400)", m: 512, k: 6, n: 400 },
  {
    label: "Google Chrome (m=900.000, k=30, n=5·10⁶)",
    m: 900_000,
    k: 30,
    n: 5_000_000,
    note: "Heatmap dilewati pada ukuran ini; FPR teoritis tetap dihitung dari rumus.",
  },
];

const M_MIN = 64;
const M_MAX = 4096;
const K_MIN = 1;
const K_MAX = 10;
const N_MIN = 0;
const N_MAX = 500;

// Heatmap rendering cap: only render when m × k cells fit a reasonable count.
const HEATMAP_MAX_CELLS = 16_000;

// FPR chart: sweep n ∈ [0, N_PLOT_MAX] holding (m, k) fixed.
const N_PLOT_MAX = 800;

// Deterministic universe of candidate URLs for the empirical FPR test. Built
// once per (m, k, n, run) — see useMemo. We use a generic URL template so the
// pedagogy maps to the Chrome example.
function buildInsertedUrls(n: number, rng: () => number): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const id = Math.floor(rng() * 1_000_000_000);
    out.push(`https://example.com/page/${id}`);
  }
  return out;
}

function buildTestUrls(count: number, rng: () => number): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const id = Math.floor(rng() * 1_000_000_000);
    out.push(`https://test.example.com/q/${id}`);
  }
  return out;
}

export function BloomFilter() {
  const [m, setM] = useState(1024);
  const [k, setK] = useState(4);
  const [n, setN] = useState(200);
  const [runCounter, setRunCounter] = useState(0);
  const [queryStr, setQueryStr] = useState("https://example.com/page/0");
  const [insertStr, setInsertStr] = useState("");
  // Manual inserts persist across re-runs of the auto-population? No — keep
  // them ephemeral: a Set of additional URLs the user typed in via "Insert".
  const [manualInserts, setManualInserts] = useState<string[]>([]);

  const colors = useMemo(
    () => ({
      grid: cssVar("--border"),
      curve: cssVar("--chart-1"),
      ref: cssVar("--chart-2"),
      lit: cssVar("--chart-4"),
      empirical: cssVar("--chart-5"),
    }),
    [],
  );

  // Build the bit-array (k rows × m columns), insert the auto-population,
  // and compute empirical FPR over a held-out test set.
  const {
    bits,
    empiricalFPR,
    queryBits,
    queryContains,
    fprCurve,
    empiricalPoint,
    activeM,
    activeK,
    activeN,
    truncated,
  } = useMemo(() => {
    // Effective values for the heatmap/empirical pass: clamp m × k to avoid
    // OOM on the Google Chrome preset. The FPR chart still uses the real m,k.
    const cells = m * k;
    const truncated = cells > HEATMAP_MAX_CELLS;
    const activeM = truncated ? Math.min(m, 1024) : m;
    const activeK = truncated ? Math.min(k, 10) : k;
    // Cap the inserted count too — running 5e6 inserts in the browser is
    // infeasible; the analytic FPR is still informative on its own.
    const activeN = truncated ? Math.min(n, 500) : n;

    const seed = 911 + runCounter * 16777619;
    const rng = mulberry32(seed);
    const bits: Uint8Array[] = Array.from(
      { length: activeK },
      () => new Uint8Array(activeM),
    );
    const insertedUrls = buildInsertedUrls(activeN, rng);
    const allInserted = insertedUrls.concat(manualInserts);
    for (const url of allInserted) {
      for (let row = 0; row < activeK; row++) {
        const idx = bloomHash(url, row, activeM);
        bits[row][idx] = 1;
      }
    }

    // Empirical FPR: how many of TEST_COUNT non-inserted URLs return "yes"?
    const TEST_COUNT = 2000;
    const testRng = mulberry32(seed ^ 0xa5a5a5a5);
    const testUrls = buildTestUrls(TEST_COUNT, testRng);
    let falsePositives = 0;
    for (const url of testUrls) {
      let all = true;
      for (let row = 0; row < activeK; row++) {
        if (bits[row][bloomHash(url, row, activeM)] !== 1) {
          all = false;
          break;
        }
      }
      if (all) falsePositives += 1;
    }
    const empiricalFPR = falsePositives / TEST_COUNT;

    // Query indices + verdict — always uses the actual m, k the user picked
    // for the heatmap (= activeM, activeK).
    const queryBits: number[] = [];
    let queryContains = true;
    for (let row = 0; row < activeK; row++) {
      const idx = bloomHash(queryStr, row, activeM);
      queryBits.push(idx);
      if (bits[row][idx] !== 1) queryContains = false;
    }

    // FPR curve: theoretical FPR vs n for the full requested (m, k).
    const stride = Math.max(1, Math.floor(N_PLOT_MAX / 200));
    const fprCurve: { n: number; fpr: number }[] = [];
    for (let nn = 0; nn <= N_PLOT_MAX; nn += stride) {
      fprCurve.push({ n: nn, fpr: bloomFPR(m, k, nn) });
    }
    const empiricalPoint = [{ n: activeN, fpr: empiricalFPR }];

    return {
      bits,
      empiricalFPR,
      queryBits,
      queryContains,
      fprCurve,
      empiricalPoint,
      activeM,
      activeK,
      activeN,
      truncated,
    };
  }, [m, k, n, manualInserts, queryStr, runCounter]);

  const theoreticalFPR = useMemo(() => bloomFPR(m, k, n), [m, k, n]);

  const handleInsert = () => {
    const s = insertStr.trim();
    if (!s) return;
    setManualInserts((cur) => (cur.includes(s) ? cur : [...cur, s]));
    setInsertStr("");
  };

  const applyPreset = (p: Preset) => {
    setM(p.m);
    setK(p.k);
    setN(p.n);
    setManualInserts([]);
  };

  const canRenderHeatmap = !truncated;

  return (
    <ModuleCard
      moduleNumber={2}
      totalModules={3}
      title="Bloom Filter — Membership Testing Probabilistik"
      distribution="k hash · bit array · FPR (Tsun §9.4)"
      context={
        <p>
          <strong>Kasus:</strong> Google Chrome menyimpan jutaan URL berbahaya
          tapi tidak ingin melakukan query database untuk setiap navigasi
          pengguna. Bloom Filter memberi jawaban “pasti tidak” / “mungkin ya”
          dalam ruang ~60× lebih kecil dari Set lengkap (Tsun, 2020, hal.
          326–330).
        </p>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="bf-m"
            className="flex items-baseline justify-between text-sm font-semibold text-foreground"
          >
            <span>m — kolom per row</span>
            <span className="font-mono text-primary">{m}</span>
          </label>
          <input
            id="bf-m"
            type="range"
            min={M_MIN}
            max={M_MAX}
            step={32}
            value={Math.min(m, M_MAX)}
            onChange={(e) => setM(parseInt(e.target.value, 10))}
            className="mt-2 w-full accent-primary"
          />
        </div>
        <div>
          <label
            htmlFor="bf-k"
            className="flex items-baseline justify-between text-sm font-semibold text-foreground"
          >
            <span>k — banyak hash</span>
            <span className="font-mono text-primary">{k}</span>
          </label>
          <input
            id="bf-k"
            type="range"
            min={K_MIN}
            max={K_MAX}
            step={1}
            value={Math.min(k, K_MAX)}
            onChange={(e) => setK(parseInt(e.target.value, 10))}
            className="mt-2 w-full accent-primary"
          />
        </div>
        <div>
          <label
            htmlFor="bf-n"
            className="flex items-baseline justify-between text-sm font-semibold text-foreground"
          >
            <span>n — URL ter-insert</span>
            <span className="font-mono text-primary">
              {n.toLocaleString()}
            </span>
          </label>
          <input
            id="bf-n"
            type="range"
            min={N_MIN}
            max={N_MAX}
            step={5}
            value={Math.min(n, N_MAX)}
            onChange={(e) => setN(parseInt(e.target.value, 10))}
            className="mt-2 w-full accent-primary"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(p)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm hover:border-primary hover:bg-primary/10"
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setRunCounter((c) => c + 1);
            setManualInserts([]);
          }}
          className="ml-auto rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          🎲 Re-seed
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="FPR teoritis"
          value={theoreticalFPR.toExponential(3)}
          highlight
        />
        <Stat
          label="FPR empiris"
          value={
            truncated ? "—" : empiricalFPR.toExponential(3)
          }
        />
        <Stat label="bit terpakai" value={`${activeK} × ${activeM}`} />
        <Stat
          label="byte ekuivalen"
          value={`${((m * k) / 8).toLocaleString(undefined, { maximumFractionDigits: 0 })} B`}
        />
      </div>

      <DerivationPanel>
        <p className="font-semibold">
          Step 1 — Definisi (Theorem 9.4.39, Tsun, 2020, hal. 329):
        </p>
        <BlockMath
          math={String.raw`P(\text{false positive}) = \left(1 - \left(1 - \tfrac{1}{m}\right)^{n}\right)^{k}`}
        />
        <p className="font-sans text-foreground text-xs">
          Catatan: rumus eksak di atas, bukan bentuk asimtotik{" "}
          <InlineMath math={String.raw`(1 - e^{-kn/m})^k`} /> yang sering
          dipakai di teks pengantar.
        </p>

        <p className="font-semibold">Step 2 — Parameter dari data:</p>
        <BlockMath
          math={String.raw`m = ${m},\quad k = ${k},\quad n = ${n}`}
        />
        <BlockMath
          math={String.raw`1 - \tfrac{1}{m} = 1 - \tfrac{1}{${m}} = ${(1 - 1 / m).toFixed(6)}`}
        />

        <p className="font-semibold">Step 3 — Substitusi:</p>
        <BlockMath
          math={String.raw`P(\text{FP}) = \left(1 - (1 - \tfrac{1}{${m}})^{${n}}\right)^{${k}} = \left(1 - ${Math.pow(1 - 1 / m, n).toExponential(3)}\right)^{${k}}`}
        />

        <p className="font-semibold">Step 4 — Hasil:</p>
        <BlockMath
          math={String.raw`P(\text{FP}) = ${theoreticalFPR.toExponential(4)}`}
        />
        <p className="font-sans text-foreground">
          {truncated
            ? "Heatmap dan FPR empiris dilewati pada ukuran preset Google Chrome (m × k = "
            : "Eksperimen empiris (test set "}
          {truncated
            ? `${(m * k).toLocaleString()} sel > batas ${HEATMAP_MAX_CELLS.toLocaleString()})`
            : "2.000 URL non-anggota) menghasilkan FPR = "}
          {truncated ? "; FPR teoritis tetap valid dari rumus." : (
            <>
              <strong>{empiricalFPR.toExponential(3)}</strong>, sesuai estimasi
              teoritis.
            </>
          )}
        </p>
      </DerivationPanel>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">
          Bit array — {canRenderHeatmap ? `${activeK} baris × ${activeM} kolom` : "tidak dirender pada ukuran ini"}
        </p>
        {canRenderHeatmap ? (
          <div className="rounded-md border border-border bg-muted p-2">
            <div className="grid gap-0.5">
              {bits.map((row, rowIdx) => (
                <div
                  key={rowIdx}
                  className="flex flex-wrap items-center gap-px"
                  style={{ minHeight: 12 }}
                >
                  <span className="mr-2 inline-block w-12 shrink-0 font-mono text-[11px] text-muted-foreground">
                    h<sub>{rowIdx + 1}</sub>
                  </span>
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: `repeat(${activeM}, minmax(0, 1fr))`,
                      flex: 1,
                      gap: 1,
                    }}
                  >
                    {Array.from(row).map((b, colIdx) => {
                      const isQueryHit = queryBits[rowIdx] === colIdx;
                      return (
                        <span
                          key={colIdx}
                          title={`row ${rowIdx + 1}, col ${colIdx}: ${b ? "1" : "0"}${isQueryHit ? " (query hit)" : ""}`}
                          style={{
                            backgroundColor: b ? colors.lit : "transparent",
                            outline: isQueryHit
                              ? `1px solid ${colors.ref}`
                              : "none",
                            display: "block",
                            width: "100%",
                            height: 6,
                            borderRadius: 1,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Sel berwarna = bit 1; outline = posisi yang diuji oleh query
              terakhir.
            </p>
          </div>
        ) : (
          <p className="rounded-md border border-dashed border-border bg-muted p-3 text-xs text-muted-foreground">
            Heatmap dilewati: m × k = {(m * k).toLocaleString()} sel melebihi
            batas {HEATMAP_MAX_CELLS.toLocaleString()}. Untuk preset Google
            Chrome (m=900.000, k=30), FPR teoritis ={" "}
            <strong>{theoreticalFPR.toExponential(3)}</strong> tetap valid —
            ini adalah inti pedagogis Tsun §9.4: rumus tidak butuh simulasi.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-sm font-semibold text-foreground">
            Insert URL (manual)
          </p>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={insertStr}
              onChange={(e) => setInsertStr(e.target.value)}
              placeholder="https://example.com/malicious"
              className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground"
            />
            <button
              type="button"
              onClick={handleInsert}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              add
            </button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Insert manual: {manualInserts.length} URL · auto-insert: {activeN}
          </p>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-sm font-semibold text-foreground">Query URL</p>
          <input
            type="text"
            value={queryStr}
            onChange={(e) => setQueryStr(e.target.value)}
            className="mt-2 w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono text-muted-foreground">
              indices: [{queryBits.join(", ")}]
            </span>
            <span
              className={[
                "rounded-md px-2 py-0.5 font-semibold",
                queryContains
                  ? "bg-amber-100 text-amber-900"
                  : "bg-emerald-100 text-emerald-900",
              ].join(" ")}
            >
              {queryContains
                ? "TRUE — mungkin ada (cek server)"
                : "FALSE — pasti tidak ada"}
            </span>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">
          FPR teoritis sebagai fungsi n (m, k tetap) — titik = FPR empiris di n
          saat ini
        </p>
        <div className="h-64 w-full" style={{ minWidth: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={fprCurve}
              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis
                dataKey="n"
                type="number"
                domain={[0, N_PLOT_MAX]}
                label={{
                  value: "n (URL ter-insert)",
                  position: "insideBottom",
                  offset: -2,
                }}
              />
              <YAxis
                domain={[0, 1]}
                tickFormatter={(v) => Number(v).toFixed(2)}
                width={50}
              />
              <Tooltip
                formatter={(v) => Number(v).toFixed(5)}
                labelFormatter={(v) => `n = ${Number(v)}`}
              />
              <Line
                type="monotone"
                dataKey="fpr"
                stroke={colors.curve}
                strokeWidth={2}
                dot={false}
                name="FPR teoritis"
                isAnimationActive={false}
              />
              <Scatter
                data={empiricalPoint}
                fill={colors.empirical}
                name="FPR empiris"
              />
              <ReferenceLine
                x={Math.min(n, N_PLOT_MAX)}
                stroke={colors.ref}
                strokeDasharray="5 5"
                label={{
                  value: `n = ${n}`,
                  position: "top",
                  fill: colors.ref,
                  fontSize: 11,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Kurva: P(FP) = (1 − (1 − 1/m)^n)^k. Naikkan n → bit array makin penuh
          → FPR meningkat. Naikkan k atau m untuk mengompensasi.
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
