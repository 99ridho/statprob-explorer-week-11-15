import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BlockMath } from "react-katex";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DerivationPanel } from "../../components/DerivationPanel";
import { ModuleCard } from "../../components/ModuleCard";
import { mulberry32 } from "../../utils/mathUtils";
import { cssVar } from "../../utils/themeColors";

type Mode = "tsp" | "knapsack";

// ───────────────────────────── TSP ─────────────────────────────

type TSPCity = { x: number; y: number };
type TSPState = {
  cities: TSPCity[];
  route: number[];
  bestRoute: number[];
  bestLen: number;
  iter: number;
  history: { iter: number; length: number; best: number }[];
};

function buildCities(n: number, rng: () => number): TSPCity[] {
  return Array.from({ length: n }, () => ({ x: rng(), y: rng() }));
}

function routeLength(cities: TSPCity[], route: number[]): number {
  let total = 0;
  for (let i = 0; i < route.length; i++) {
    const a = cities[route[i]];
    const b = cities[route[(i + 1) % route.length]];
    total += Math.hypot(a.x - b.x, a.y - b.y);
  }
  return total;
}

function initTSP(nCities: number, seed: number): TSPState {
  const rng = mulberry32(seed);
  const cities = buildCities(nCities, rng);
  const route = Array.from({ length: nCities }, (_, i) => i);
  // Light Fisher-Yates shuffle for a random starting permutation.
  for (let i = route.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [route[i], route[j]] = [route[j], route[i]];
  }
  const len = routeLength(cities, route);
  return {
    cities,
    route: route.slice(),
    bestRoute: route.slice(),
    bestLen: len,
    iter: 0,
    history: [{ iter: 0, length: len, best: len }],
  };
}

function stepTSP(state: TSPState, T: number, rng: () => number): TSPState {
  const n = state.route.length;
  if (n < 2) return state;
  const i = Math.floor(rng() * n);
  const j = (i + 1) % n; // swap consecutive — Algorithm 4 in Tsun
  const newRoute = state.route.slice();
  [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];
  const curLen = routeLength(state.cities, state.route);
  const newLen = routeLength(state.cities, newRoute);
  const delta = newLen - curLen;
  let accepted = state.route;
  let acceptedLen = curLen;
  if (delta < 0 || (T > 0 && rng() < Math.exp(-delta / T))) {
    accepted = newRoute;
    acceptedLen = newLen;
  }
  const bestRoute =
    acceptedLen < state.bestLen ? accepted.slice() : state.bestRoute;
  const bestLen = acceptedLen < state.bestLen ? acceptedLen : state.bestLen;
  const nextIter = state.iter + 1;
  const history = state.history.concat({
    iter: nextIter,
    length: acceptedLen,
    best: bestLen,
  });
  // Cap history to a reasonable length (keep newest 800 points + start).
  const trimmed =
    history.length > 800 ? [history[0]].concat(history.slice(-799)) : history;
  return {
    cities: state.cities,
    route: accepted,
    bestRoute,
    bestLen,
    iter: nextIter,
    history: trimmed,
  };
}

// ─────────────────────────── Knapsack ──────────────────────────

type KnapItem = { w: number; v: number };
type KnapState = {
  items: KnapItem[];
  capacity: number;
  selection: Uint8Array;
  bestSelection: Uint8Array;
  bestValue: number;
  iter: number;
  rejected: number;
  history: { iter: number; value: number; best: number }[];
};

function buildItems(n: number, rng: () => number): KnapItem[] {
  return Array.from({ length: n }, () => ({
    w: 1 + Math.floor(rng() * 10),
    v: 5 + Math.floor(rng() * 50),
  }));
}

function knapWV(items: KnapItem[], sel: Uint8Array): { w: number; v: number } {
  let w = 0;
  let v = 0;
  for (let i = 0; i < items.length; i++) {
    if (sel[i]) {
      w += items[i].w;
      v += items[i].v;
    }
  }
  return { w, v };
}

function initKnap(
  nItems: number,
  capacity: number,
  seed: number,
): KnapState {
  const rng = mulberry32(seed);
  const items = buildItems(nItems, rng);
  const selection = new Uint8Array(nItems);
  const { v } = knapWV(items, selection);
  return {
    items,
    capacity,
    selection,
    bestSelection: new Uint8Array(selection),
    bestValue: v,
    iter: 0,
    rejected: 0,
    history: [{ iter: 0, value: v, best: v }],
  };
}

function stepKnap(state: KnapState, rng: () => number): KnapState {
  const n = state.items.length;
  if (n === 0) return state;
  const k = Math.floor(rng() * n);
  const trial = new Uint8Array(state.selection);
  trial[k] = trial[k] ? 0 : 1;
  const { w } = knapWV(state.items, trial);
  let nextSel = state.selection;
  let rejected = state.rejected;
  if (w <= state.capacity) {
    nextSel = trial;
  } else {
    rejected += 1;
  }
  const { v: nextV } = knapWV(state.items, nextSel);
  const bestSel =
    nextV > state.bestValue ? new Uint8Array(nextSel) : state.bestSelection;
  const bestValue = nextV > state.bestValue ? nextV : state.bestValue;
  const nextIter = state.iter + 1;
  const history = state.history.concat({
    iter: nextIter,
    value: nextV,
    best: bestValue,
  });
  const trimmed =
    history.length > 800 ? [history[0]].concat(history.slice(-799)) : history;
  return {
    items: state.items,
    capacity: state.capacity,
    selection: nextSel,
    bestSelection: bestSel,
    bestValue,
    iter: nextIter,
    rejected,
    history: trimmed,
  };
}

// ────────────────────────── Component ──────────────────────────

export function MCMCVisualizer() {
  const [mode, setMode] = useState<Mode>("tsp");
  const [nCities, setNCities] = useState(15);
  const [T, setT] = useState(0.5);
  const [stepsPerClick, setStepsPerClick] = useState(500);
  const [auto, setAuto] = useState(false);
  const [seed, setSeed] = useState(42);

  const [nItems, setNItems] = useState(10);
  const [capacity, setCapacity] = useState(30);
  const [TKnap, setTKnap] = useState(5);

  const [tspState, setTspState] = useState<TSPState>(() => initTSP(15, 42));
  const [tspSetup, setTspSetup] = useState<{ n: number; seed: number }>({
    n: 15,
    seed: 42,
  });
  const [knapState, setKnapState] = useState<KnapState>(() =>
    initKnap(10, 30, 42),
  );
  const [knapSetup, setKnapSetup] = useState<{
    n: number;
    W: number;
    seed: number;
  }>({ n: 10, W: 30, seed: 42 });

  // React 19 endorsed pattern: detect dep change during render and reset
  // state synchronously, avoiding the lint rule against setState-in-effect.
  if (tspSetup.n !== nCities || tspSetup.seed !== seed) {
    setTspSetup({ n: nCities, seed });
    setTspState(initTSP(nCities, seed));
  }
  if (
    knapSetup.n !== nItems ||
    knapSetup.W !== capacity ||
    knapSetup.seed !== seed
  ) {
    setKnapSetup({ n: nItems, W: capacity, seed });
    setKnapState(initKnap(nItems, capacity, seed));
  }

  const colors = useMemo(
    () => ({
      grid: cssVar("--border"),
      cur: cssVar("--chart-1"),
      best: cssVar("--chart-5"),
      city: cssVar("--chart-2"),
      route: cssVar("--chart-1"),
      sel: cssVar("--chart-4"),
    }),
    [],
  );

  // PRNG reused across steps for reproducibility-per-session.
  const rngRef = useRef<() => number>(mulberry32(seed ^ 0xc0ffee));
  useEffect(() => {
    rngRef.current = mulberry32(seed ^ 0xc0ffee);
  }, [seed]);

  const doSteps = useCallback(
    (count: number) => {
      if (mode === "tsp") {
        setTspState((s) => {
          let cur = s;
          for (let i = 0; i < count; i++) cur = stepTSP(cur, T, rngRef.current);
          return cur;
        });
      } else {
        setKnapState((s) => {
          let cur = s;
          for (let i = 0; i < count; i++) cur = stepKnap(cur, rngRef.current);
          return cur;
        });
      }
    },
    [mode, T],
  );

  // Auto-step via rAF.
  useEffect(() => {
    if (!auto) return;
    let raf = 0;
    const tick = () => {
      doSteps(20);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [auto, doSteps]);

  // ---------- TSP derived values ----------
  const tspCurLen = useMemo(
    () => routeLength(tspState.cities, tspState.route),
    [tspState],
  );

  // SVG path for the current route (close the loop).
  const tspRoutePath = useMemo(() => {
    const pad = 0.05;
    const sx = (x: number) => (pad + x * (1 - 2 * pad)) * 100;
    const sy = (y: number) => (1 - (pad + y * (1 - 2 * pad))) * 100;
    if (tspState.route.length === 0) return "";
    const pts = tspState.route.map((idx) => {
      const c = tspState.cities[idx];
      return `${sx(c.x).toFixed(2)},${sy(c.y).toFixed(2)}`;
    });
    return `M ${pts.join(" L ")} Z`;
  }, [tspState]);

  // ---------- Knapsack derived values ----------
  const knapCur = useMemo(
    () => knapWV(knapState.items, knapState.selection),
    [knapState],
  );
  const knapBest = useMemo(
    () => knapWV(knapState.items, knapState.bestSelection),
    [knapState],
  );

  return (
    <ModuleCard
      moduleNumber={3}
      totalModules={3}
      title="MCMC — Optimasi Kombinatorial dengan Markov Chain"
      distribution="Metropolis · TSP / 0-1 Knapsack"
      context={
        <p>
          <strong>Kasus:</strong> TSP dan 0-1 Knapsack adalah masalah NP-Hard:
          jumlah solusi tumbuh kombinatorial. MCMC mengeksplorasi ruang solusi
          dengan perbaikan acak + acceptance Metropolis{" "}
          <code>e^(−Δ/T)</code>, sehingga keluar dari local optimum (Tsun,
          2020, hal. 346–348, Algorithm 3 &amp; 4).
        </p>
      }
    >
      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">Mode</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("tsp");
              setAuto(false);
            }}
            className={[
              "rounded-md border px-3 py-1.5 text-xs font-semibold shadow-sm",
              mode === "tsp"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary hover:bg-primary/10",
            ].join(" ")}
          >
            TSP (Travelling Salesman)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("knapsack");
              setAuto(false);
            }}
            className={[
              "rounded-md border px-3 py-1.5 text-xs font-semibold shadow-sm",
              mode === "knapsack"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary hover:bg-primary/10",
            ].join(" ")}
          >
            0-1 Knapsack
          </button>
        </div>
      </div>

      {mode === "tsp" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="tsp-n"
              className="flex items-baseline justify-between text-sm font-semibold text-foreground"
            >
              <span>jumlah kota</span>
              <span className="font-mono text-primary">{nCities}</span>
            </label>
            <input
              id="tsp-n"
              type="range"
              min={5}
              max={25}
              step={1}
              value={nCities}
              onChange={(e) => setNCities(parseInt(e.target.value, 10))}
              className="mt-2 w-full accent-primary"
            />
          </div>
          <div>
            <label
              htmlFor="tsp-T"
              className="flex items-baseline justify-between text-sm font-semibold text-foreground"
            >
              <span>temperature T</span>
              <span className="font-mono text-primary">{T.toFixed(3)}</span>
            </label>
            <input
              id="tsp-T"
              type="range"
              min={0}
              max={50}
              step={0.1}
              value={T}
              onChange={(e) => setT(parseFloat(e.target.value))}
              className="mt-2 w-full accent-primary"
            />
          </div>
          <div>
            <label
              htmlFor="tsp-steps"
              className="flex items-baseline justify-between text-sm font-semibold text-foreground"
            >
              <span>steps per klik</span>
              <span className="font-mono text-primary">
                {stepsPerClick.toLocaleString()}
              </span>
            </label>
            <input
              id="tsp-steps"
              type="range"
              min={1}
              max={5000}
              step={1}
              value={stepsPerClick}
              onChange={(e) =>
                setStepsPerClick(parseInt(e.target.value, 10))
              }
              className="mt-2 w-full accent-primary"
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="knap-n"
              className="flex items-baseline justify-between text-sm font-semibold text-foreground"
            >
              <span>jumlah item</span>
              <span className="font-mono text-primary">{nItems}</span>
            </label>
            <input
              id="knap-n"
              type="range"
              min={5}
              max={20}
              step={1}
              value={nItems}
              onChange={(e) => setNItems(parseInt(e.target.value, 10))}
              className="mt-2 w-full accent-primary"
            />
          </div>
          <div>
            <label
              htmlFor="knap-W"
              className="flex items-baseline justify-between text-sm font-semibold text-foreground"
            >
              <span>kapasitas W</span>
              <span className="font-mono text-primary">{capacity}</span>
            </label>
            <input
              id="knap-W"
              type="range"
              min={5}
              max={100}
              step={1}
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value, 10))}
              className="mt-2 w-full accent-primary"
            />
          </div>
          <div>
            <label
              htmlFor="knap-T"
              className="flex items-baseline justify-between text-sm font-semibold text-foreground"
            >
              <span>temperature T (informational)</span>
              <span className="font-mono text-primary">
                {TKnap.toFixed(2)}
              </span>
            </label>
            <input
              id="knap-T"
              type="range"
              min={0}
              max={50}
              step={0.1}
              value={TKnap}
              onChange={(e) => setTKnap(parseFloat(e.target.value))}
              className="mt-2 w-full accent-primary"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Algorithm 3 (Knapsack) di Tsun hal. 347 hanya menerima move yang
              tidak melanggar kapasitas — tanpa T. T disediakan sebagai
              pembanding intuisi terhadap TSP.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => doSteps(1)}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm hover:border-primary hover:bg-primary/10"
        >
          1 step
        </button>
        <button
          type="button"
          onClick={() => doSteps(stepsPerClick)}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          ▶ Run {stepsPerClick.toLocaleString()} steps
        </button>
        <button
          type="button"
          onClick={() => setAuto((v) => !v)}
          className={[
            "rounded-md border px-3 py-1.5 text-xs font-semibold shadow-sm",
            auto
              ? "border-destructive bg-destructive text-white"
              : "border-border bg-card text-foreground hover:border-primary hover:bg-primary/10",
          ].join(" ")}
        >
          {auto ? "■ Stop auto" : "▷ Auto-step"}
        </button>
        <button
          type="button"
          onClick={() => {
            setAuto(false);
            setSeed((s) => s + 1);
          }}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm hover:border-primary hover:bg-primary/10"
        >
          ↺ Reset (seed = {seed + 1})
        </button>
      </div>

      {mode === "tsp" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            label="panjang rute"
            value={tspCurLen.toFixed(3)}
            highlight
          />
          <Stat label="terbaik" value={tspState.bestLen.toFixed(3)} />
          <Stat label="iter" value={tspState.iter.toLocaleString()} />
          <Stat label="T" value={T.toFixed(3)} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="nilai saat ini" value={knapCur.v.toString()} />
          <Stat label="berat" value={`${knapCur.w} / ${capacity}`} />
          <Stat
            label="best value"
            value={knapBest.v.toString()}
            highlight
          />
          <Stat
            label="rejected (>W)"
            value={knapState.rejected.toLocaleString()}
          />
        </div>
      )}

      <DerivationPanel>
        <p className="font-semibold">
          Step 1 — Definisi (Tsun, 2020, hal. {mode === "tsp" ? "348, Algorithm 4" : "347, Algorithm 3"}):
        </p>
        {mode === "tsp" ? (
          <>
            <BlockMath
              math={String.raw`\text{TSP: cari permutasi }\pi^\star = \arg\min_{\pi \in S_n}\sum_{i=1}^{n} d(\pi_i, \pi_{i+1})`}
            />
            <BlockMath
              math={String.raw`\text{Metropolis acceptance: }P(\text{terima} \mid \Delta) = \begin{cases}1 & \Delta < 0\\ e^{-\Delta/T} & \Delta \geq 0\end{cases}`}
            />
          </>
        ) : (
          <>
            <BlockMath
              math={String.raw`\text{0-1 Knapsack: cari }x^\star = \arg\max_{x \in \{0,1\}^n}\;\sum_i v_i x_i\;\text{ s.t. }\sum_i w_i x_i \leq W`}
            />
            <BlockMath
              math={String.raw`\text{Aturan acceptance (Alg. 3): terima jika }\sum w_i x_i' \leq W,\;\text{ tolak jika melanggar batas berat}`}
            />
          </>
        )}

        <p className="font-semibold">Step 2 — Parameter saat ini:</p>
        {mode === "tsp" ? (
          <BlockMath
            math={String.raw`n_{\text{kota}} = ${nCities},\quad T = ${T.toFixed(3)},\quad \text{iter} = ${tspState.iter}`}
          />
        ) : (
          <BlockMath
            math={String.raw`n_{\text{item}} = ${nItems},\quad W = ${capacity},\quad \text{iter} = ${knapState.iter}`}
          />
        )}

        <p className="font-semibold">Step 3 — Substitusi (proposal terakhir):</p>
        {mode === "tsp" ? (
          <BlockMath
            math={String.raw`\text{swap dua kota berurutan} \Rightarrow \Delta = L_{\text{new}} - L_{\text{cur}};\;\text{terima jika }\Delta < 0\text{ atau }u < e^{-\Delta/${T.toFixed(2)}}`}
          />
        ) : (
          <BlockMath
            math={String.raw`\text{flip }x_k\text{ acak} \Rightarrow \text{jika }\sum w_i x_i' = ${knapCur.w} \leq ${capacity}\text{ terima, jika tidak tolak}`}
          />
        )}

        <p className="font-semibold">Step 4 — Hasil:</p>
        {mode === "tsp" ? (
          <BlockMath
            math={String.raw`L_{\text{cur}} = ${tspCurLen.toFixed(4)},\quad L_{\text{best}} = ${tspState.bestLen.toFixed(4)}`}
          />
        ) : (
          <BlockMath
            math={String.raw`V_{\text{cur}} = ${knapCur.v},\quad V_{\text{best}} = ${knapBest.v},\quad \#\text{rejected} = ${knapState.rejected}`}
          />
        )}
        <p className="font-sans text-foreground">
          Ketika T besar (TSP), chain lebih sering menerima move "lebih buruk"
          → eksplorasi luas, keluar dari local optimum. Ketika T kecil,
          chain ke-arah eksploitasi → konvergen pada solusi terdekat (yang
          mungkin lokal).
        </p>
      </DerivationPanel>

      {mode === "tsp" ? (
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">
            Peta kota + rute saat ini (unit square)
          </p>
          <div className="rounded-md border border-border bg-muted p-2">
            <svg
              viewBox="0 0 100 100"
              className="block w-full"
              style={{ aspectRatio: "1 / 1", maxHeight: 360 }}
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                d={tspRoutePath}
                fill="none"
                stroke={colors.route}
                strokeWidth={0.4}
              />
              {tspState.cities.map((c, i) => {
                const pad = 0.05;
                const sx = (pad + c.x * (1 - 2 * pad)) * 100;
                const sy = (1 - (pad + c.y * (1 - 2 * pad))) * 100;
                return (
                  <g key={i}>
                    <circle cx={sx} cy={sy} r={1.2} fill={colors.city} />
                    <text
                      x={sx + 1.4}
                      y={sy - 0.6}
                      fontSize={2.4}
                      fill="currentColor"
                      className="text-foreground"
                    >
                      {i}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      ) : (
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">
            Bitmask seleksi (MCMC mengubah ini setiap iterasi)
          </p>
          <div className="grid grid-cols-10 gap-1 rounded-md border border-border bg-muted p-3 sm:grid-cols-20">
            {Array.from(knapState.selection).map((b, i) => (
              <div
                key={i}
                title={`item ${i}: w=${knapState.items[i].w}, v=${knapState.items[i].v}, ${b ? "ON" : "off"}`}
                className="flex aspect-square items-center justify-center rounded text-[10px] font-semibold"
                style={{
                  backgroundColor: b ? colors.sel : "transparent",
                  border: `1px solid ${colors.grid}`,
                  color: b ? "#fff" : "currentColor",
                }}
              >
                {i}
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Klik tidak mengubah; MCMC yang menggerakkan. Hover untuk melihat
            (w, v) per item.
          </p>
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">
          {mode === "tsp"
            ? "Panjang rute vs iterasi"
            : "Nilai vs iterasi"}
        </p>
        <div className="h-64 w-full" style={{ minWidth: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={
                mode === "tsp"
                  ? tspState.history.map((h) => ({
                      iter: h.iter,
                      cur: h.length,
                      best: h.best,
                    }))
                  : knapState.history.map((h) => ({
                      iter: h.iter,
                      cur: h.value,
                      best: h.best,
                    }))
              }
              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis
                dataKey="iter"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(v) => Number(v).toLocaleString()}
                label={{
                  value: "iter",
                  position: "insideBottom",
                  offset: -2,
                }}
              />
              <YAxis
                tickFormatter={(v) => Number(v).toFixed(2)}
                width={60}
              />
              <Tooltip
                formatter={(v) => Number(v).toFixed(4)}
                labelFormatter={(v) => `iter = ${Number(v).toLocaleString()}`}
              />
              <Line
                type="monotone"
                dataKey="cur"
                stroke={colors.cur}
                strokeWidth={1.5}
                dot={false}
                name={mode === "tsp" ? "panjang" : "nilai"}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="best"
                stroke={colors.best}
                strokeWidth={2}
                dot={false}
                name="best so far"
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Garis tipis = trajektori chain (boleh naik karena Metropolis); garis
          tebal = nilai terbaik sepanjang sejarah. Konvergensi tidak monoton
          karena chain sengaja "ngintip" ke solusi yang lebih buruk untuk
          keluar dari local optimum.
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
