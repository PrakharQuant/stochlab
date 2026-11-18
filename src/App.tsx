import { useState } from 'react'
import { Home } from './pages/Home'
import { VasicekLab } from './pages/VasicekLab'
import { HestonLab } from './pages/HestonLab'
import { PricingLab } from './pages/PricingLab'
import { SmileLab } from './pages/SmileLab'
import { Foundations } from './pages/Foundations'
import { Comparison } from './pages/Comparison'
import { Github, Linkedin, Twitter, Mail } from 'lucide-react'

type Page = 'home' | 'vasicek' | 'heston' | 'pricing' | 'smile' | 'foundations' | 'comparison'

export default function App() {
  const [page, setPage] = useState<Page>('home')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center font-bold text-slate-950 text-sm">
              SL
            </div>
            <button onClick={() => setPage('home')} className="text-xl font-bold tracking-tight text-cyan-400 hover:text-cyan-300">
              STOCHLAB
            </button>
          </div>
          <nav className="hidden md:flex gap-1 text-sm">
            {([
              ['home', 'Home'],
              ['vasicek', 'Vasicek'],
              ['heston', 'Heston'],
              ['pricing', 'Pricing'],
              ['smile', 'Smile'],
              ['comparison', 'Compare'],
              ['foundations', 'Math'],
            ] as [Page, string][]).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setPage(id)}
                className={`px-3 py-1.5 rounded-md transition ${page === id ? 'bg-cyan-600/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-slate-400">
            <a href="mailto:bestofprakhar@gmail.com" className="hover:text-cyan-400" title="Email"><Mail size={18} /></a>
            <a href="https://www.linkedin.com/in/prakhar-gupta" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400" title="LinkedIn"><Linkedin size={18} /></a>
            <a href="https://twitter.com/PrakharQuant" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400" title="Twitter / X"><Twitter size={18} /></a>
            <a href="https://github.com/PrakharQuant/stochlab" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400" title="GitHub"><Github size={18} /></a>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="md:hidden flex overflow-x-auto gap-1 px-4 pb-2 text-xs">
          {([
            ['home', 'Home'],
            ['vasicek', 'Vasicek'],
            ['heston', 'Heston'],
            ['pricing', 'Pricing'],
            ['smile', 'Smile'],
            ['comparison', 'Compare'],
            ['foundations', 'Math'],
          ] as [Page, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`px-3 py-1 rounded whitespace-nowrap ${page === id ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {page === 'home' && <Home setPage={setPage} />}
        {page === 'vasicek' && <VasicekLab />}
        {page === 'heston' && <HestonLab />}
        {page === 'pricing' && <PricingLab />}
        {page === 'smile' && <SmileLab />}
        {page === 'comparison' && <Comparison />}
        {page === 'foundations' && <Foundations />}
      </main>

      <footer className="border-t border-slate-800 mt-16 py-8 text-center text-sm text-slate-500">
        <p className="mb-2">
          STOCHLAB — Exploring the Mathematics of Financial Uncertainty
        </p>
        <p className="mb-3">
          Built by <a href="https://github.com/PrakharQuant" className="text-cyan-400 hover:underline">Prakhar Gupta</a>
        </p>
        <div className="flex justify-center gap-4">
          <a href="mailto:bestofprakhar@gmail.com" className="hover:text-cyan-400"><Mail size={16} /></a>
          <a href="https://www.linkedin.com/in/prakhar-gupta" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400"><Linkedin size={16} /></a>
          <a href="https://twitter.com/PrakharQuant" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400"><Twitter size={16} /></a>
          <a href="https://github.com/PrakharQuant" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400"><Github size={16} /></a>
        </div>
        <p className="mt-4 text-xs">
          This is a research and educational computational laboratory. Not financial advice.
        </p>
      </footer>
    </div>
  )
}
