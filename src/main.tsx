import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootEl = document.getElementById('root')
if (!rootEl) {
  document.body.innerHTML = '<p style="color:#f87171;padding:2rem">Root element missing.</p>'
} else {
  try {
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    rootEl.innerHTML = `<div style="padding:2rem;color:#e2e8f0;font-family:system-ui">
      <h1 style="color:#22d3ee">STOCHLAB</h1>
      <p>Failed to start the application.</p>
      <pre style="color:#fbbf24;white-space:pre-wrap">${msg}</pre>
    </div>`
  }
}
