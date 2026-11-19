import Plot from '../components/Plot'
import { simulateVasicekExact } from '../models/vasicek/vasicek'
import { simulateHeston } from '../models/heston/heston'

export function Comparison() {
  const v = simulateVasicekExact({ r0: 0.04, a: 0.8, b: 0.045, sigma: 0.012, T: 5, nSteps: 150, nPaths: 12, seed: 7 })
  const h = simulateHeston({ S0: 100, v0: 0.04, mu: 0.04, kappa: 1.5, theta: 0.045, xi: 0.35, rho: -0.6, T: 2, nSteps: 100, nPaths: 10, seed: 7 })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-200">Vasicek vs Heston</h1>
        <p className="mt-2 text-slate-400">Different state variables, different financial purposes, shared mathematical structure of mean-reverting SDEs.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-cyan-400 mb-4">Vasicek Short Rates</h3>
          <Plot
            data={v.rates.slice(0, 8).map(p => ({ x: v.times, y: p, type: 'scatter', mode: 'lines', line: { width: 1.2 }, showlegend: false }))}
            layout={{ paper_bgcolor: 'transparent', plot_bgcolor: 'rgba(15,23,42,0.5)', font: { color: '#94a3b8' }, margin: { t: 10, r: 10, b: 40, l: 50 }, height: 280, xaxis: { gridcolor: '#1e293b' }, yaxis: { gridcolor: '#1e293b', tickformat: '.1%' } }}
            config={{ displayModeBar: false, responsive: true }}
          />
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-teal-400 mb-4">Heston Stock Prices</h3>
          <Plot
            data={h.stocks.slice(0, 8).map(p => ({ x: h.times, y: p, type: 'scatter', mode: 'lines', line: { width: 1.2 }, showlegend: false }))}
            layout={{ paper_bgcolor: 'transparent', plot_bgcolor: 'rgba(15,23,42,0.5)', font: { color: '#94a3b8' }, margin: { t: 10, r: 10, b: 40, l: 50 }, height: 280, xaxis: { gridcolor: '#1e293b' }, yaxis: { gridcolor: '#1e293b' } }}
            config={{ displayModeBar: false, responsive: true }}
          />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="text-left py-3 pr-4">Feature</th>
              <th className="text-left py-3 pr-4">Vasicek (1977)</th>
              <th className="text-left py-3">Heston (1993)</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            <tr className="border-b border-slate-800"><td className="py-2">State variable</td><td>Instantaneous short rate r_t</td><td>Asset price S_t and variance v_t</td></tr>
            <tr className="border-b border-slate-800"><td className="py-2">Mean reversion</td><td>Linear in rate</td><td>Linear in variance (CIR)</td></tr>
            <tr className="border-b border-slate-800"><td className="py-2">Diffusion</td><td>Constant volatility</td><td>Square-root volatility of variance</td></tr>
            <tr className="border-b border-slate-800"><td className="py-2">Primary use</td><td>Term structure of interest rates</td><td>Equity option pricing, volatility surface</td></tr>
            <tr className="border-b border-slate-800"><td className="py-2">Analytical tractability</td><td>Affine bond prices</td><td>Characteristic function for options</td></tr>
            <tr><td className="py-2">Main limitation</td><td>Can produce negative rates</td><td>Single volatility factor; calibration can be delicate</td></tr>
          </tbody>
        </table>
      </div>

      <div className="card text-sm text-slate-400 space-y-2">
        <p>Both models are examples of affine term-structure or affine jump-diffusion frameworks. Vasicek is the simplest Gaussian short-rate model. Heston is the canonical stochastic-volatility equity model.</p>
        <p>The square-root diffusion in Heston’s variance process is crucial for keeping variance non-negative in the continuous setting (under the Feller condition), whereas Vasicek’s arithmetic Brownian motion allows negative rates.</p>
      </div>
    </div>
  )
}
