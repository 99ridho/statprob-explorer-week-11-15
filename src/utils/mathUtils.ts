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
