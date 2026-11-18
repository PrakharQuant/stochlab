import { useState, useMemo } from 'react'
import { hestonCallPrice, hestonPutPrice, blackScholesCall } from '../models/heston/heston'
import { InlineMath } from 'react-katex'

export function PricingLab() {
  const [S, setS] = useState(100)
  const [K, setK] = useState(100)
  const [r, setR] = useState(0.03)
  const [T, setT] = useState(1)
  const [v0, setV0] = useState(0.04)
  const [kappa, setKappa] = useState(2)
  const [theta, setTheta] = useState(0.04)
  const [xi, setXi] = useState(0.3)
  const [rho, setRho] = useState(-0.7)
  const [bsSigma, setBsSigma] = useState(0.2)

  const hestonCall = useMemo(() => 
    hestonCallPrice(S, K, r, v0, kappa, theta, xi, rho, T), 
    [S, K, r, v0, kappa, theta, xi, rho, T]
  )
  const hestonPut = useMemo(() => 
    hestonPutPrice(S, K, r, v0, kappa, theta, xi, rho, T), 
    [S, K, r, v0, kappa, theta, xi, rho, T]
  )
  const bsCall = useMemo(() => blackScholesCall(S, K, r, bsSigma, T), [S, K, r, bsSigma, T])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400">Heston European Option Pricing</h1>
        <p className="mt-2 text-slate-400">Characteristic-function pricing via numerical integration. Risk-neutral dynamics with constant risk-free rate.</p>
      </div>

      <div className="card text-sm text-slate-400">
        <p>Under the risk-neutral measure:</p>
        <p className="mt-2 font-mono text-xs"><InlineMath math="dS_t = r S_t dt + \\sqrt{v_t} S_t dW_t^S" /></p>
        <p className="mt-1 font-mono text-xs"><InlineMath math="dv_t = \\kappa(\\theta - v_t)dt + \\xi\\sqrt{v_t}\\, dW_t^v" /></p>
        <p className="mt-3">Prices are computed from the Heston characteristic function using trapezoidal integration. Results may exhibit mild numerical noise for extreme parameters.</p>
      </div>

      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          ['Spot S', S, setS, 50, 200, 1],
          ['Strike K', K, setK, 50, 200, 1],
          ['Rate r', r, setR, 0, 0.1, 0.005],
          ['Maturity T', T, setT, 0.1, 3, 0.1],
          ['v₀', v0, setV0, 0.01, 0.2, 0.005],
          ['κ', kappa, setKappa, 0.5, 5, 0.1],
          ['θ', theta, setTheta, 0.01, 0.2, 0.005],
          ['ξ', xi, setXi, 0.1, 1, 0.05],
          ['ρ', rho, setRho, -0.9, 0.9, 0.05],
          ['BS σ (bench)', bsSigma, setBsSigma, 0.05, 0.8, 0.01],
        ].map(([label, val, setter, min, max, step]) => (
          <div key={label as string} className="card !p-4">
            <label className="text-xs text-slate-400">{label as string}</label>
            <input type="range" min={min as number} max={max as number} step={step as number}
              value={val as number} onChange={e => (setter as any)(parseFloat(e.target.value))}
              className="w-full mt-1 accent-cyan-500" />
            <div className="text-right text-sm font-mono text-cyan-300">{(val as number).toFixed(3)}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-xs text-slate-400">Heston Call</div>
          <div className="text-4xl font-mono text-emerald-400 mt-2">{hestonCall.toFixed(3)}</div>
        </div>
        <div className="card text-center">
          <div className="text-xs text-slate-400">Heston Put</div>
          <div className="text-4xl font-mono text-amber-400 mt-2">{hestonPut.toFixed(3)}</div>
        </div>
        <div className="card text-center">
          <div className="text-xs text-slate-400">Black-Scholes Call</div>
          <div className="text-4xl font-mono text-slate-300 mt-2">{bsCall.toFixed(3)}</div>
          <div className="text-xs text-slate-500 mt-1">Difference: {(hestonCall - bsCall).toFixed(3)}</div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-medium mb-2">Put-Call Parity Check</h3>
        <p className="text-sm text-slate-400">
          Call − Put = S − K e<sup>−rT</sup> → {(hestonCall - hestonPut).toFixed(4)} vs {(S - K * Math.exp(-r * T)).toFixed(4)}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Small discrepancies arise from numerical integration tolerances in the characteristic-function inversion.
        </p>
      </div>
    </div>
  )
}
