import { useState, useMemo } from 'react'
import Plot from 'react-plotly.js'
import { InlineMath, BlockMath } from 'react-katex'
import { simulateVasicekExact, vasicekExpectation, vasicekVariance, halfLife, vasicekBondPrice, vasicekYield, type VasicekParams } from '../models/vasicek/vasicek'

export function VasicekLab() {
  const [params, setParams] = useState<VasicekParams>({
    r0: 0.03, a: 0.5, b: 0.04, sigma: 0.015, T: 10, nSteps: 200, nPaths: 50, seed: 42
  })
  const [bondTau, setBondTau] = useState(5)

  const result = useMemo(() => simulateVasicekExact(params), [params])
  const expPath = result.times.map(t => vasicekExpectation(params.r0, params.a, params.b, t))
  const terminalRates = result.rates.map(p => p[p.length - 1])
  const meanTerm = terminalRates.reduce((a, b) => a + b, 0) / terminalRates.length
  const stdTerm = Math.sqrt(terminalRates.reduce((a, b) => a + (b - meanTerm) ** 2, 0) / terminalRates.length)
  const negProb = terminalRates.filter(r => r < 0).length / terminalRates.length
  const hl = halfLife(params.a)
  const bondP = vasicekBondPrice(params.r0, params.a, params.b, params.sigma, bondTau)
  const yieldY = vasicekYield(params.r0, params.a, params.b, params.sigma, bondTau)

  const maturities = Array.from({ length: 20 }, (_, i) => (i + 1) * 0.5)
  const yields = maturities.map(tau => vasicekYield(params.r0, params.a, params.b, params.sigma, tau))

  const update = (key: keyof VasicekParams, value: number) => setParams(p => ({ ...p, [key]: value }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400">Vasicek Model Laboratory</h1>
        <p className="mt-2 text-slate-400">Mean-reverting interest rate dynamics with exact discretisation and analytical bond pricing.</p>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Mathematical Foundation</h2>
        <BlockMath math="dr_t = a(b - r_t)\,dt + \\sigma\\, dW_t" />
        <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm text-slate-300">
          <div>
            <p><strong>Drift:</strong> <InlineMath math="a(b - r_t)dt" /> — pulls the rate toward the long-run level <InlineMath math="b" />.</p>
            <p className="mt-2"><strong>Diffusion:</strong> <InlineMath math="\\sigma dW_t" /> — random Gaussian shocks.</p>
          </div>
          <div>
            <p>When <InlineMath math="r_t > b" />, the drift is negative → rate tends to fall.</p>
            <p>When <InlineMath math="r_t < b" />, the drift is positive → rate tends to rise.</p>
            <p className="mt-2">Half-life of mean reversion: <InlineMath math="t_{1/2} = \\ln 2 / a" /> = {hl === Infinity ? '∞' : hl.toFixed(2)} years.</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {([
          ['r0', 'Initial rate r₀', 0.001, 0.15, 0.001],
          ['b', 'Equilibrium b', 0.001, 0.15, 0.001],
          ['a', 'Speed a', 0.05, 3, 0.05],
          ['sigma', 'Volatility σ', 0.001, 0.05, 0.001],
          ['T', 'Horizon T', 1, 30, 1],
          ['nPaths', 'Paths', 10, 200, 10],
          ['seed', 'Seed', 1, 9999, 1],
        ] as const).map(([key, label, min, max, step]) => (
          <div key={key} className="card !p-4">
            <label className="text-xs text-slate-400">{label}</label>
            <input
              type="range"
              min={min} max={max} step={step}
              value={params[key as keyof VasicekParams] as number}
              onChange={e => update(key as any, parseFloat(e.target.value))}
              className="w-full mt-1 accent-cyan-500"
            />
            <div className="text-right text-sm font-mono text-cyan-300">
              {typeof params[key as keyof VasicekParams] === 'number' ? (params[key as keyof VasicekParams] as number).toFixed(key === 'seed' || key === 'nPaths' || key === 'T' ? 0 : 4) : ''}
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="card !p-4 text-center">
          <div className="text-xs text-slate-400">Terminal mean</div>
          <div className="text-2xl font-mono text-cyan-400">{(meanTerm * 100).toFixed(2)}%</div>
        </div>
        <div className="card !p-4 text-center">
          <div className="text-xs text-slate-400">Terminal std</div>
          <div className="text-2xl font-mono text-teal-400">{(stdTerm * 100).toFixed(2)}%</div>
        </div>
        <div className="card !p-4 text-center">
          <div className="text-xs text-slate-400">P(negative)</div>
          <div className="text-2xl font-mono text-amber-400">{(negProb * 100).toFixed(1)}%</div>
        </div>
        <div className="card !p-4 text-center">
          <div className="text-xs text-slate-400">Half-life</div>
          <div className="text-2xl font-mono text-slate-300">{hl === Infinity ? '∞' : hl.toFixed(1)}y</div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-medium mb-4">Simulated Interest Rate Paths</h3>
        <Plot
          data={[
            ...result.rates.slice(0, 30).map((path, i) => ({
              x: result.times, y: path, type: 'scatter' as const, mode: 'lines' as const,
              name: `Path ${i+1}`, line: { width: 1, color: `rgba(56,189,248,${0.4 + (i%5)*0.1})` }, showlegend: false,
            })),
            { x: result.times, y: expPath, type: 'scatter', mode: 'lines', name: 'Expected path', line: { color: '#22d3ee', width: 3 } },
            { x: result.times, y: Array(result.times.length).fill(params.b), type: 'scatter', mode: 'lines', name: 'Long-run b', line: { color: '#fbbf24', dash: 'dash', width: 2 } },
          ]}
          layout={{
            paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(15,23,42,0.6)',
            font: { color: '#94a3b8', size: 11 },
            margin: { t: 30, r: 20, b: 50, l: 60 },
            xaxis: { title: 'Time (years)', gridcolor: '#1e293b' },
            yaxis: { title: 'Interest rate', gridcolor: '#1e293b', tickformat: '.1%' },
            height: 420, legend: { orientation: 'h', y: -0.15 },
          }}
          config={{ responsive: true, displayModeBar: true }}
          className="w-full"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Terminal Rate Distribution</h3>
          <Plot
            data={[{ x: terminalRates, type: 'histogram', nbinsx: 30, marker: { color: '#22d3ee' } }]}
            layout={{
              paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(15,23,42,0.6)',
              font: { color: '#94a3b8' }, margin: { t: 20, r: 20, b: 40, l: 50 },
              xaxis: { title: 'Rate', tickformat: '.1%', gridcolor: '#1e293b' },
              yaxis: { title: 'Count', gridcolor: '#1e293b' }, height: 300,
            }}
            config={{ displayModeBar: false, responsive: true }}
          />
        </div>
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Analytical Moments</h3>
          <div className="space-y-3 text-sm">
            <p>Conditional expectation at T:</p>
            <BlockMath math={`E[r_T | r_0] = ${vasicekExpectation(params.r0, params.a, params.b, params.T).toFixed(4)}`} />
            <p>Conditional variance at T:</p>
            <BlockMath math={`\\mathrm{Var}(r_T | r_0) = ${vasicekVariance(params.a, params.sigma, params.T).toFixed(6)}`} />
            <p className="text-slate-400">Simulated terminal mean ≈ {(meanTerm).toFixed(4)}, std ≈ {stdTerm.toFixed(4)}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-medium mb-4">Zero-Coupon Bond Pricing</h3>
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <div>
            <label className="text-xs text-slate-400">Maturity τ</label>
            <input type="range" min="0.25" max="30" step="0.25" value={bondTau} onChange={e => setBondTau(parseFloat(e.target.value))} className="w-48 accent-cyan-500" />
            <div className="text-sm font-mono text-cyan-300">{bondTau.toFixed(2)} years</div>
          </div>
          <div className="card !p-4">
            <div className="text-xs text-slate-400">Bond price P(0,τ)</div>
            <div className="text-2xl font-mono text-emerald-400">{bondP.toFixed(4)}</div>
          </div>
          <div className="card !p-4">
            <div className="text-xs text-slate-400">Yield y(0,τ)</div>
            <div className="text-2xl font-mono text-amber-400">{(yieldY * 100).toFixed(3)}%</div>
          </div>
        </div>
        <Plot
          data={[{ x: maturities, y: yields.map(y => y * 100), type: 'scatter', mode: 'lines+markers', name: 'Yield curve', line: { color: '#34d399' } }]}
          layout={{
            paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(15,23,42,0.6)',
            font: { color: '#94a3b8' }, margin: { t: 20, r: 20, b: 50, l: 60 },
            xaxis: { title: 'Maturity (years)', gridcolor: '#1e293b' },
            yaxis: { title: 'Yield (%)', gridcolor: '#1e293b' }, height: 320,
          }}
          config={{ displayModeBar: false, responsive: true }}
        />
        <p className="mt-3 text-sm text-slate-500">
          Bond prices move inversely with interest rates. Higher rates → lower present values of fixed cash flows.
        </p>
      </div>
    </div>
  )
}
