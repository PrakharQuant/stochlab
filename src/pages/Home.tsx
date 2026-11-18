import { InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import { simulateVasicekExact } from '../models/vasicek/vasicek'
import { simulateHeston } from '../models/heston/heston'
import Plot from 'react-plotly.js'

export function Home({ setPage }: { setPage: (p: any) => void }) {
  const vasicek = simulateVasicekExact({ r0: 0.03, a: 0.5, b: 0.04, sigma: 0.01, T: 5, nSteps: 100, nPaths: 8, seed: 1 })
  const heston = simulateHeston({ S0: 100, v0: 0.04, mu: 0.05, kappa: 2, theta: 0.04, xi: 0.3, rho: -0.7, T: 1, nSteps: 100, nPaths: 6, seed: 1 })

  return (
    <div className="space-y-12">
      <section className="text-center py-12">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
          STOCHLAB
        </h1>
        <p className="mt-4 text-xl md:text-2xl text-slate-300">
          Exploring the Mathematics of Financial Uncertainty
        </p>
        <p className="mt-6 max-w-3xl mx-auto text-slate-400 text-lg">
          An interactive computational laboratory for understanding stochastic interest rates, 
          volatility dynamics and financial derivatives.
        </p>
        <p className="mt-4 max-w-3xl mx-auto text-slate-500">
          Financial markets are governed by uncertainty. Stochastic models provide mathematical 
          frameworks for describing how interest rates, asset prices and volatility evolve over time.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <button onClick={() => setPage('vasicek')} className="card text-left hover:border-cyan-500/50 transition group">
          <h2 className="text-2xl font-semibold text-cyan-400 group-hover:text-cyan-300">Vasicek — Interest Rate Dynamics</h2>
          <p className="mt-2 text-slate-400">
            Mean-reverting short rates. Exact simulation, bond pricing, yield curves.
          </p>
          <p className="mt-3 text-sm text-slate-500 font-mono">
            <InlineMath math="dr_t = a(b - r_t)dt + \\sigma dW_t" />
          </p>
        </button>
        <button onClick={() => setPage('heston')} className="card text-left hover:border-teal-500/50 transition group">
          <h2 className="text-2xl font-semibold text-teal-400 group-hover:text-teal-300">Heston — Stochastic Volatility</h2>
          <p className="mt-2 text-slate-400">
            Correlated price and variance processes. Volatility clustering, leverage effect, smiles.
          </p>
          <p className="mt-3 text-sm text-slate-500 font-mono">
            <InlineMath math="dv_t = \\kappa(\\theta - v_t)dt + \\xi\\sqrt{v_t}\\, dW^v_t" />
          </p>
        </button>
      </section>

      <section className="grid md:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-medium text-slate-200 mb-4">Vasicek Sample Paths</h3>
          <Plot
            data={vasicek.rates.slice(0, 6).map((path, i) => ({
              x: vasicek.times,
              y: path,
              type: 'scatter',
              mode: 'lines',
              name: `Path ${i+1}`,
              line: { width: 1.5 },
            }))}
            layout={{
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(15,23,42,0.5)',
              font: { color: '#94a3b8' },
              margin: { t: 20, r: 20, b: 40, l: 50 },
              xaxis: { title: 'Time', gridcolor: '#1e293b' },
              yaxis: { title: 'Rate', gridcolor: '#1e293b', tickformat: '.1%' },
              showlegend: false,
              height: 280,
            }}
            config={{ displayModeBar: false, responsive: true }}
            className="w-full"
          />
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-slate-200 mb-4">Heston Sample Paths</h3>
          <Plot
            data={heston.stocks.slice(0, 5).map((path, i) => ({
              x: heston.times,
              y: path,
              type: 'scatter',
              mode: 'lines',
              name: `Path ${i+1}`,
              line: { width: 1.5 },
            }))}
            layout={{
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(15,23,42,0.5)',
              font: { color: '#94a3b8' },
              margin: { t: 20, r: 20, b: 40, l: 50 },
              xaxis: { title: 'Time', gridcolor: '#1e293b' },
              yaxis: { title: 'Price', gridcolor: '#1e293b' },
              showlegend: false,
              height: 280,
            }}
            config={{ displayModeBar: false, responsive: true }}
            className="w-full"
          />
        </div>
      </section>

      <section className="card">
        <h3 className="text-xl font-semibold text-slate-200 mb-4">Model Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-2 pr-4">Aspect</th>
                <th className="py-2 pr-4">Vasicek</th>
                <th className="py-2">Heston</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-slate-800"><td className="py-2">State variable</td><td>Short rate r<sub>t</sub></td><td>Price S<sub>t</sub> + variance v<sub>t</sub></td></tr>
              <tr className="border-b border-slate-800"><td className="py-2">Process</td><td>Gaussian mean-reverting</td><td>GBM + CIR variance</td></tr>
              <tr className="border-b border-slate-800"><td className="py-2">Application</td><td>Interest rates, bonds, yield curves</td><td>Equity options, volatility smiles</td></tr>
              <tr><td className="py-2">Key feature</td><td>Mean reversion of rates</td><td>Stochastic volatility & leverage</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-slate-500 text-sm">
          Both models employ stochastic differential equations and mean-reverting processes, yet they model fundamentally different quantities.
        </p>
      </section>
    </div>
  )
}
