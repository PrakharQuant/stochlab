import { BlockMath } from 'react-katex'

export function Foundations() {
  const concepts = [
    {
      title: 'Brownian Motion',
      math: 'W_t \\sim \\mathcal{N}(0, t), \\quad \\mathrm{Cov}(W_s, W_t) = \\min(s,t)',
      text: 'A continuous-time stochastic process with independent Gaussian increments. The fundamental building block of continuous-path financial models.',
    },
    {
      title: 'Stochastic Differential Equations',
      math: 'dX_t = \\mu(X_t, t)\\, dt + \\sigma(X_t, t)\\, dW_t',
      text: 'An SDE describes the instantaneous evolution of a random process. The drift μ is the expected change; the diffusion σ scales the random shock.',
    },
    {
      title: 'Itô’s Lemma',
      math: 'df = \\left( f_t + \\mu f_x + \\tfrac12 \\sigma^2 f_{xx} \\right) dt + \\sigma f_x dW',
      text: 'The chain rule for stochastic processes. The extra second-order term arises because (dW)² = dt.',
    },
    {
      title: 'Mean-Reverting Processes',
      math: 'dX_t = a(b - X_t)dt + \\sigma dW_t',
      text: 'Ornstein-Uhlenbeck (Vasicek) and CIR processes pull the state variable toward a long-run level. Used for interest rates and variance.',
    },
    {
      title: 'Geometric Brownian Motion',
      math: 'dS_t = \\mu S_t dt + \\sigma S_t dW_t',
      text: 'The classic Black-Scholes asset price process. Log-price is arithmetic Brownian motion, guaranteeing positivity.',
    },
    {
      title: 'Risk-Neutral Valuation',
      math: 'V_0 = e^{-rT} \\mathbb{E}^\\mathbb{Q}[\\mathrm{payoff}]',
      text: 'Under the risk-neutral measure Q, the discounted asset price is a martingale. Option prices become discounted expected payoffs under this measure.',
    },
    {
      title: 'Characteristic Functions',
      math: '\\phi(u) = \\mathbb{E}[e^{iu X}]',
      text: 'The Fourier transform of a probability density. Heston’s closed-form option price is obtained by integrating the characteristic function of log(S_T).',
    },
  ]

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-200">Mathematical Foundations</h1>
        <p className="mt-2 text-slate-400">Core concepts underlying the Vasicek and Heston models. Assumes basic calculus and probability.</p>
      </div>

      {concepts.map(c => (
        <div key={c.title} className="card">
          <h2 className="text-xl font-semibold text-cyan-400">{c.title}</h2>
          <div className="my-4">
            <BlockMath math={c.math} />
          </div>
          <p className="text-slate-300">{c.text}</p>
        </div>
      ))}

      <div className="card text-sm text-slate-500">
        <p>These foundations appear throughout STOCHLAB. The Vasicek exact transition and Heston characteristic function are direct applications of the tools above.</p>
      </div>
    </div>
  )
}
