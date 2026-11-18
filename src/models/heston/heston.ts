/**
 * Heston Model — Stochastic Volatility
 * 
 * dS_t = μ S_t dt + √v_t S_t dW^S
 * dv_t = κ (θ - v_t) dt + ξ √v_t dW^v
 * dW^S dW^v = ρ dt
 * 
 * Full-truncation Euler scheme for positivity of variance.
 */

export interface HestonParams {
  S0: number;
  v0: number;
  mu: number;      // or r under risk-neutral
  kappa: number;
  theta: number;
  xi: number;      // vol of vol
  rho: number;
  T: number;
  nSteps: number;
  nPaths: number;
  seed?: number;
}

export interface HestonPath {
  times: number[];
  stocks: number[][];
  variances: number[][];
  volatilities: number[][];
}

function mulberry32(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function randomNormal(rng: () => number): number {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/** Full-truncation Euler scheme */
export function simulateHeston(params: HestonParams): HestonPath {
  const { S0, v0, mu, kappa, theta, xi, rho, T, nSteps, nPaths, seed = 42 } = params;
  const dt = T / nSteps;
  const times = Array.from({ length: nSteps + 1 }, (_, i) => i * dt);
  const stocks: number[][] = [];
  const variances: number[][] = [];
  const volatilities: number[][] = [];

  const rng = mulberry32(seed);
  const sqrt_1_rho2 = Math.sqrt(1 - rho * rho);

  for (let p = 0; p < nPaths; p++) {
    const Spath = [S0];
    const vpath = [v0];
    const volpath = [Math.sqrt(Math.max(v0, 0))];
    let S = S0;
    let v = v0;

    for (let i = 0; i < nSteps; i++) {
      const Z1 = randomNormal(rng);
      const Z2 = randomNormal(rng);
      const ZS = Z1;
      const Zv = rho * Z1 + sqrt_1_rho2 * Z2;

      const v_pos = Math.max(v, 0);
      const sqrt_v = Math.sqrt(v_pos);

      // Stock
      S = S * Math.exp((mu - 0.5 * v_pos) * dt + sqrt_v * Math.sqrt(dt) * ZS);

      // Variance (full truncation)
      v = v + kappa * (theta - v_pos) * dt + xi * sqrt_v * Math.sqrt(dt) * Zv;
      // v can go negative; next step will truncate

      Spath.push(S);
      vpath.push(v);
      volpath.push(Math.sqrt(Math.max(v, 0)));
    }
    stocks.push(Spath);
    variances.push(vpath);
    volatilities.push(volpath);
  }

  return { times, stocks, variances, volatilities };
}

/** Feller condition: 2 κ θ ≥ ξ² */
export function fellerCondition(kappa: number, theta: number, xi: number): boolean {
  return 2 * kappa * theta >= xi * xi;
}

/** Simple Complex number class for CF pricing */
export class Complex {
  constructor(public re: number, public im: number) {}

  static from(re: number, im = 0) { return new Complex(re, im); }

  add(o: Complex) { return new Complex(this.re + o.re, this.im + o.im); }
  sub(o: Complex) { return new Complex(this.re - o.re, this.im - o.im); }
  mul(o: Complex | number) {
    if (typeof o === 'number') return new Complex(this.re * o, this.im * o);
    return new Complex(
      this.re * o.re - this.im * o.im,
      this.re * o.im + this.im * o.re
    );
  }
  div(o: Complex) {
    const den = o.re * o.re + o.im * o.im;
    return new Complex(
      (this.re * o.re + this.im * o.im) / den,
      (this.im * o.re - this.re * o.im) / den
    );
  }
  exp() {
    const e = Math.exp(this.re);
    return new Complex(e * Math.cos(this.im), e * Math.sin(this.im));
  }
  log() {
    return new Complex(Math.log(Math.hypot(this.re, this.im)), Math.atan2(this.im, this.re));
  }
  sqrt() {
    const r = Math.hypot(this.re, this.im);
    const theta = Math.atan2(this.im, this.re);
    return new Complex(Math.sqrt(r) * Math.cos(theta / 2), Math.sqrt(r) * Math.sin(theta / 2));
  }
}

/**
 * Heston characteristic function of log(S_T) under risk-neutral measure.
 * Uses a standard formulation; numerical stability depends on parameter regime.
 */
export function hestonCharFunc(
  u: Complex,
  S0: number,
  v0: number,
  r: number,
  kappa: number,
  theta: number,
  sigma: number,
  rho: number,
  T: number
): Complex {
  const i = new Complex(0, 1);
  const xi = sigma;

  const b = new Complex(kappa, 0);
  const rho_xi_i_u = i.mul(u).mul(rho * xi);
  const d = b.sub(rho_xi_i_u).mul(b.sub(rho_xi_i_u))
    .sub(i.mul(u).mul(i.mul(u).add(new Complex(1))).mul(new Complex(-xi * xi / 2))).sqrt();

  const g = b.sub(rho_xi_i_u).sub(d).div(b.sub(rho_xi_i_u).add(d));

  const exp_minus_dT = d.mul(new Complex(-T)).exp();
  const one = new Complex(1, 0);
  const G = one.sub(g.mul(exp_minus_dT)).div(one.sub(g));

  const C = i.mul(u).mul(new Complex(r * T))
    .add(
      b.sub(rho_xi_i_u).sub(d).mul(new Complex(T))
        .sub(G.mul(new Complex(2)).log())
        .mul(new Complex(kappa * theta / (xi * xi)))
    );

  const D = b.sub(rho_xi_i_u).sub(d).div(new Complex(xi * xi))
    .mul(one.sub(exp_minus_dT).div(one.sub(g.mul(exp_minus_dT))));

  return C.add(D.mul(new Complex(v0))).add(i.mul(u).mul(new Complex(Math.log(S0)))).exp();
}

/** Black-Scholes call for benchmark and IV inversion */
export function blackScholesCall(S: number, K: number, r: number, sigma: number, T: number): number {
  if (T <= 0) return Math.max(S - K, 0);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  const Nd1 = 0.5 * (1 + erf(d1 / Math.SQRT2));
  const Nd2 = 0.5 * (1 + erf(d2 / Math.SQRT2));
  return S * Nd1 - K * Math.exp(-r * T) * Nd2;
}

function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

/** Numerical integration for Heston call price */
export function hestonCallPrice(
  S0: number,
  K: number,
  r: number,
  v0: number,
  kappa: number,
  theta: number,
  xi: number,
  rho: number,
  T: number,
  nIntegrations = 200
): number {
  const phiMax = 100;
  const dphi = phiMax / nIntegrations;

  let integral1 = 0;
  let integral2 = 0;

  for (let j = 1; j < nIntegrations; j++) {
    const phi = j * dphi;
    const phiC = new Complex(phi, 0);

    const cf1 = hestonCharFunc(phiC.sub(new Complex(0, 1)), S0, v0, r, kappa, theta, xi, rho, T);
    const cf2 = hestonCharFunc(phiC, S0, v0, r, kappa, theta, xi, rho, T);

    const exp_i = new Complex(0, -phi * Math.log(K)).exp();

    const re1 = cf1.div(phiC.mul(new Complex(0, 1))).mul(exp_i).re;
    const re2 = cf2.div(phiC.mul(new Complex(0, 1))).mul(exp_i).re;

    integral1 += re1;
    integral2 += re2;
  }

  integral1 *= dphi / Math.PI;
  integral2 *= dphi / Math.PI;

  const P1 = 0.5 + integral1;
  const P2 = 0.5 + integral2;

  const call = S0 * P1 - K * Math.exp(-r * T) * P2;
  return Math.max(call, 0);
}

/** Put via put-call parity */
export function hestonPutPrice(
  S0: number, K: number, r: number, v0: number, kappa: number, theta: number, xi: number, rho: number, T: number
): number {
  const call = hestonCallPrice(S0, K, r, v0, kappa, theta, xi, rho, T);
  return call - S0 + K * Math.exp(-r * T);
}
