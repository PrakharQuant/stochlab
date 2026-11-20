import PlotlyModule from 'plotly.js-dist-min'
import createPlotlyComponentModule from 'react-plotly.js/factory'

// Vite/ESM interop: CJS packages can arrive as { default: fn } or as the fn itself.
const Plotly = (PlotlyModule as any).default ?? PlotlyModule
const factoryFn =
  typeof createPlotlyComponentModule === 'function'
    ? createPlotlyComponentModule
    : (createPlotlyComponentModule as any).default

if (typeof factoryFn !== 'function') {
  throw new Error('react-plotly.js/factory did not export a function')
}

const Plot = factoryFn(Plotly)

export default Plot
