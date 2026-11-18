/**
 * Vasicek Model — Mean-Reverting Interest Rates
 * 
 * SDE: dr_t = a(b - r_t)dt + σ dW_t
 * 
 * Exact transition:
 * r(t+Δt) = b + (r(t) - b) exp(-a Δt) + σ √[(1 - exp(-2a Δt))/(2a)] Z
 * (with limiting case a → 0 handled)
 */

export interface VasicekParams {
  r0: number;      // initial rate
  a: number;       // mean reversion speed
  b: number;       // long-run mean
  sigma: number;   // volatility
  T: number;       // horizon
  nSteps: number;  // time steps
  nPaths: number;  // number of paths
  seed?: number;   // random seed for reproducibility
}

export interface VasicekPath {
  times: number[];
  rates: number[][];  // [path][step]
}

/** Seeded random number generator (mulberry32) */
function mulberry32(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/** Box-Muller for standard normal from uniform */
function randomNormal(rng: () => number): number {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/** Exact Vasicek discretization */
export function simulateVasicekExact(params: VasicekParams): VasicekPath {
  const { r0, a, b, sigma, T, nSteps, nPaths, seed = 42 } = params;
  const dt = T / nSteps;
  const times = Array.from({ length: nSteps + 1 }, (_, i) => i * dt);
  const rates: number[][] = [];

  const rng = mulberry32(seed);

  const exp_a_dt = Math.exp(-a * dt);
  const varFactor = a === 0 
    ? sigma * Math.sqrt(dt) 
    : sigma * Math.sqrt((1 - Math.exp(-2 * a * dt)) / (2 * a));

  for (let p = 0; p < nPaths; p++) {
    const path = [r0];
    let r = r0;
    for (let i = 0; i < nSteps; i++) {
      const Z = randomNormal(rng);
      r = b + (r - b) * exp_a_dt + varFactor * Z;
      path.push(r);
    }
    rates.push(path);
  }

  return { times, rates };
}

/** Conditional expectation E[r_t | r0] */
export function vasicekExpectation(r0: number, a: number, b: number, t: number): number {
  return b + (r0 - b) * Math.exp(-a * t);
}

/** Conditional variance Var(r_t | r0) */
export function vasicekVariance(a: number, sigma: number, t: number): number {
  if (a === 0) return sigma * sigma * t;
  return (sigma * sigma / (2 * a)) * (1 - Math.exp(-2 * a * t));
}

/** Mean-reversion half-life */
export function halfLife(a: number): number {
  if (a <= 0) return Infinity;
  return Math.log(2) / a;
}

/** Zero-coupon bond price P(t,T) = A(t,T) exp(-B(t,T) r_t) */
export function vasicekBondPrice(
  r: number,
  a: number,
  b: number,
  sigma: number,
  tau: number  // T - t
): number {
  if (tau <= 0) return 1;
  
  const B = a === 0 ? tau : (1 - Math.exp(-a * tau)) / a;
  
  let A_log: number;
  if (a === 0) {
    A_log = -b * tau + (sigma * sigma * tau * tau * tau) / 6;
  } else {
    const sigma2_2a2 = (sigma * sigma) / (2 * a * a);
    A_log = (b - sigma2_2a2) * (B - tau) - (sigma * sigma * B * B) / (4 * a);
  }
  
  return Math.exp(A_log - B * r);
}

/** Continuously compounded yield y(t,T) = -ln(P)/tau */
export function vasicekYield(r: number, a: number, b: number, sigma: number, tau: number): number {
  if (tau <= 0) return r;
  const P = vasicekBondPrice(r, a, b, sigma, tau);
  return -Math.log(P) / tau;
}
