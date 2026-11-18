import { describe, it, expect } from 'vitest'
import { vasicekExpectation, vasicekVariance, halfLife, vasicekBondPrice, simulateVasicekExact } from '../models/vasicek/vasicek'
import { fellerCondition, simulateHeston, blackScholesCall } from '../models/heston/heston'

describe('Vasicek', () => {
  it('expectation converges to long-run mean', () => {
    expect(vasicekExpectation(0.1, 1, 0.04, 100)).toBeCloseTo(0.04, 4)
  })

  it('half-life formula', () => {
    expect(halfLife(Math.log(2))).toBeCloseTo(1, 6)
  })

  it('variance formula for a=0', () => {
    expect(vasicekVariance(0, 0.1, 4)).toBeCloseTo(0.04, 6)
  })

  it('bond price decreases with rate', () => {
    const pLow = vasicekBondPrice(0.02, 0.5, 0.04, 0.01, 10)
    const pHigh = vasicekBondPrice(0.08, 0.5, 0.04, 0.01, 10)
    expect(pLow).toBeGreaterThan(pHigh)
  })

  it('exact simulation is reproducible', () => {
    const p = { r0: 0.03, a: 0.5, b: 0.04, sigma: 0.01, T: 1, nSteps: 10, nPaths: 5, seed: 123 }
    const a = simulateVasicekExact(p)
    const b = simulateVasicekExact(p)
    expect(a.rates[0][5]).toBeCloseTo(b.rates[0][5], 10)
  })
})

describe('Heston', () => {
  it('Feller condition', () => {
    expect(fellerCondition(2, 0.04, 0.3)).toBe(true)
    expect(fellerCondition(0.5, 0.04, 0.5)).toBe(false)
  })

  it('simulation produces non-negative variance after truncation', () => {
    const res = simulateHeston({ S0: 100, v0: 0.04, mu: 0.05, kappa: 2, theta: 0.04, xi: 0.5, rho: -0.5, T: 1, nSteps: 50, nPaths: 20, seed: 1 })
    const allPositive = res.volatilities.every(path => path.every(v => v >= 0))
    expect(allPositive).toBe(true)
  })

  it('Black-Scholes at-the-money reasonable', () => {
    const price = blackScholesCall(100, 100, 0.05, 0.2, 1)
    expect(price).toBeGreaterThan(5)
    expect(price).toBeLessThan(15)
  })
})
