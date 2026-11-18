import { useState, useMemo } from 'react'
import Plot from 'react-plotly.js'
import { InlineMath, BlockMath } from 'react-katex'
import { simulateHeston, fellerCondition, type HestonParams } from '../models/heston/heston'

export function HestonLab() {
  const [params, setParams] = useState<HestonParams>({
    S0: 100, v0: 0.04, mu: 0.05, kappa: 2.0, theta: 0.04, xi: 0.3, rho: -0.7,
    T: 1, nSteps: 100, nPaths: 40, seed: 42
  })

  const result = useMemo(() => simulateHeston(params), [params])
  const terminalS = result.stocks.map(p => p[p.length - 1])
  const terminalV = result.variances.map(p => Math.max(p[p.length - 1], 0))
  const feller = fellerCondition(params.kappa, params.theta, params.xi)

  const update = (key: keyof HestonParams, value: number) => setParams(p => ({ ...p, [key]: value }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-teal-400">Heston Stochastic Volatility Laboratory</h1>
        <p className="mt-2 text-slate-400">Two-factor model with correlated price and variance shocks. Full-truncation Euler scheme.</p>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Mathematical Foundation</h2>
        <BlockMath math="dS_t = \\mu S_t dt + \\sqrt{v_t} S_t dW_t^S" />
        <BlockMath math="dv_t = \\kappa(\\theta - v_t)dt + \\xi\\sqrt{v_t}\\, dW_t^v, \\quad d\\langle W^S, W^v\\rangle_t = \\rho\\, dt" />
        <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm text-slate-300">
          <div>
            <p><strong>Variance process</strong> is CIR (Cox-Ingersoll-Ross). Mean-reverting with square-root diffusion.</p>
            <p className="mt-2">Negative ρ produces the leverage effect: falling prices tend to coincide with rising volatility.</p>
          </div>
          <div>
            <p>Feller condition <InlineMath math="2\\kappa\\theta \\ge \\xi^2" />: {feller ? <span className="text-emerald-400">satisfied</span> : <span className="text-amber-400">violated</span>}</p>
            <p className="mt-2 text-slate-500">The condition ensures the continuous process stays non-negative almost surely. Numerical schemes still require careful treatment.</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {([
          ['S0', 'S₀', 50, 200, 1],
          ['v0', 'v₀', 0.01, 0.2, 0.005],
          ['kappa', 'κ', 0.5, 5, 0.1],
          ['theta', 'θ', 0.01, 0.2, 0.005],
          ['xi', 'ξ (vol-of-vol)', 0.1, 1.5, 0.05],
          ['rho', 'ρ', -0.95, 0.95, 0.05],
          ['T', 'Horizon', 0.25, 5, 0.25],
          ['nPaths', 'Paths', 10, 100, 5],
          ['seed', 'Seed', 1, 9999, 1],
        ] as const).map(([key, label, min, max, step]) => (
          <div key={key} className="card !p-4">
            <label className="text-xs text-slate-400">{label}</label>
            <input
              type="range" min={min} max={max} step={step}
              value={params[key as keyof HestonParams] as number}
              onChange={e => update(key as any, parseFloat(e.target.value))}
              className="w-full mt-1 accent-teal-500"
            />
            <div className="text-right text-sm font-mono text-teal-300">
              {(params[key as keyof HestonParams] as number).toFixed(key === 'rho' || key === 'v0' || key === 'theta' || key === 'xi' ? 3 : 0)}
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card !p-4 text-center">
          <div className="text-xs text-slate-400">Terminal mean S</div>
          <div className="text-2xl font-mono text-teal-400">{(terminalS.reduce((a,b)=>a+b,0)/terminalS.length).toFixed(1)}</div>
        </div>
        <div className="card !p-4 text-center">
          <div className="text-xs text-slate-400">Terminal mean √v</div>
          <div className="text-2xl font-mono text-cyan-400">{(Math.sqrt(terminalV.reduce((a,b)=>a+b,0)/terminalV.length)*100).toFixed(1)}%</div>
        </div>
        <div className="card !p-4 text-center">
          <div className="text-xs text-slate-400">Feller</div>
          <div className={`text-2xl font-mono ${feller ? 'text-emerald-400' : 'text-amber-400'}`}>{feller ? 'OK' : 'Violated'}</div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-medium mb-4">Stock Price Paths</h3>
        <Plot
          data={result.stocks.slice(0, 25).map((path, i) => ({
            x: result.times, y: path, type: 'scatter', mode: 'lines',
            line: { width: 1, color: `rgba(45,212,191,${0.3 + (i%8)*0.07})` }, showlegend: false,
          }))}
          layout={{
            paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(15,23,42,0.6)',
            font: { color: '#94a3b8' }, margin: { t: 20, r: 20, b: 50, l: 60 },
            xaxis: { title: 'Time', gridcolor: '#1e293b' },
            yaxis: { title: 'Price', gridcolor: '#1e293b' }, height: 380,
          }}
          config={{ responsive: true }}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Variance Paths</h3>
          <Plot
            data={result.variances.slice(0, 15).map((path, i) => ({
              x: result.times, y: path.map(v => Math.max(v, 0)), type: 'scatter', mode: 'lines',
              line: { width: 1, color: `rgba(251,191,36,${0.4})` }, showlegend: false,
            }))}
            layout={{
              paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(15,23,42,0.6)',
              font: { color: '#94a3b8' }, margin: { t: 20, r: 20, b: 40, l: 50 },
              xaxis: { title: 'Time', gridcolor: '#1e293b' },
              yaxis: { title: 'Variance', gridcolor: '#1e293b' }, height: 300,
            }}
            config={{ displayModeBar: false, responsive: true }}
          />
        </div>
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Terminal Price Distribution</h3>
          <Plot
            data={[{ x: terminalS, type: 'histogram', nbinsx: 25, marker: { color: '#2dd4bf' } }]}
            layout={{
              paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(15,23,42,0.6)',
              font: { color: '#94a3b8' }, margin: { t: 20, r: 20, b: 40, l: 50 },
              xaxis: { title: 'Terminal S', gridcolor: '#1e293b' },
              yaxis: { title: 'Count', gridcolor: '#1e293b' }, height: 300,
            }}
            config={{ displayModeBar: false, responsive: true }}
          />
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-medium mb-2">Correlation Effect</h3>
        <p className="text-sm text-slate-400 mb-4">
          Current ρ = {params.rho.toFixed(2)}. Strongly negative correlation produces the equity leverage effect and downward implied-volatility skew.
          Adjust ρ and regenerate to observe the change in path co-movement.
        </p>
        <button onClick={() => setParams(p => ({ ...p, seed: Math.floor(Math.random()*10000) }))} className="btn btn-primary">
          Regenerate paths
        </button>
      </div>
    </div>
  )
}
