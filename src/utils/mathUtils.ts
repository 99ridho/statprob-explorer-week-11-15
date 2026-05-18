// Lanczos log-gamma approximation. Copied verbatim from FRD §3 Module 11.3 —
// do not deviate.
export function lnGamma(z: number): number {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5)
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return (
    0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x)
  );
}

export function betaPDF(x: number, alpha: number, beta: number): number {
  if (x <= 0 || x >= 1) return 0;
  const lnB = lnGamma(alpha) + lnGamma(beta) - lnGamma(alpha + beta);
  return Math.exp(
    (alpha - 1) * Math.log(x) + (beta - 1) * Math.log(1 - x) - lnB,
  );
}

export function bernoulliLikelihood(theta: number, k: number, n: number): number {
  return Math.pow(theta, k) * Math.pow(1 - theta, n - k);
}

export function poissonLogLikelihood(theta: number, n: number, sumX: number): number {
  return -n * theta + sumX * Math.log(theta);
}

export function lnMultiBeta(alphas: number[]): number {
  let sumAlpha = 0;
  let sumLnGamma = 0;
  for (const a of alphas) {
    sumAlpha += a;
    sumLnGamma += lnGamma(a);
  }
  return sumLnGamma - lnGamma(sumAlpha);
}

export function dirichletPDF(xs: number[], alphas: number[]): number {
  if (xs.length !== alphas.length) return 0;
  let logTerm = 0;
  for (let i = 0; i < xs.length; i++) {
    if (xs[i] <= 0 || xs[i] >= 1) return 0;
    logTerm += (alphas[i] - 1) * Math.log(xs[i]);
  }
  return Math.exp(logTerm - lnMultiBeta(alphas));
}

// Abramowitz & Stegun 7.1.26 — max abs error ≈ 1.5e-7.
export function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y =
    1 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}

// Standard normal CDF Φ(z) = 0.5·(1 + erf(z/√2)).
export function normalCDF(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

// Beasley–Springer–Moro inverse normal Φ⁻¹(p). Accurate to ~7 dp; the
// standard 1.645 / 1.96 / 2.576 critical values match the textbook table.
export function normalInverseCDF(p: number): number {
  if (p <= 0 || p >= 1) {
    if (p === 0) return -Infinity;
    if (p === 1) return Infinity;
    return NaN;
  }
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number;
  let r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
        q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return (
    -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  );
}

// Regularized incomplete beta I_x(α, β) via Lentz's continued fraction
// (Numerical Recipes §6.4). Tail symmetry handles x > (α+1)/(α+β+2).
export function betaCDF(x: number, alpha: number, beta: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lnFront =
    lnGamma(alpha + beta) -
    lnGamma(alpha) -
    lnGamma(beta) +
    alpha * Math.log(x) +
    beta * Math.log(1 - x);
  const front = Math.exp(lnFront);
  if (x < (alpha + 1) / (alpha + beta + 2)) {
    return (front * betacf(x, alpha, beta)) / alpha;
  }
  return 1 - (front * betacf(1 - x, beta, alpha)) / beta;
}

function betacf(x: number, a: number, b: number): number {
  const maxIter = 200;
  const eps = 3e-12;
  const fpmin = 1e-300;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < fpmin) d = fpmin;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= maxIter; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin) d = fpmin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin) c = fpmin;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin) d = fpmin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin) c = fpmin;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < eps) break;
  }
  return h;
}

// Bisection on betaCDF — tolerance 1e-7, ≤ 60 iters.
export function betaInverseCDF(p: number, alpha: number, beta: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 60; i++) {
    const mid = 0.5 * (lo + hi);
    const cdf = betaCDF(mid, alpha, beta);
    if (cdf < p) lo = mid;
    else hi = mid;
    if (hi - lo < 1e-7) break;
  }
  return 0.5 * (lo + hi);
}

// Z-based proportion CI half-width and bounds (slide 9 / FRD §9).
// Clamps final bounds to [0, 1] for proportions.
export function bernoulliCI(
  k: number,
  n: number,
  z: number,
): { thetaHat: number; sigmaHat: number; halfWidth: number; lower: number; upper: number } {
  const thetaHat = n === 0 ? 0 : k / n;
  const sigmaHat = Math.sqrt(thetaHat * (1 - thetaHat));
  const halfWidth = n === 0 ? 0 : (z * sigmaHat) / Math.sqrt(n);
  const lower = Math.max(0, thetaHat - halfWidth);
  const upper = Math.min(1, thetaHat + halfWidth);
  return { thetaHat, sigmaHat, halfWidth, lower, upper };
}

// mulberry32 — seeded PRNG. One factory call per simulation run.
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
