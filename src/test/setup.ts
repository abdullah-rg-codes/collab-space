/**
 * Global test setup for Vitest + React Testing Library.
 *
 * - Registers @testing-library/jest-dom matchers on Vitest's `expect`
 *   so we can use assertions like `toBeInTheDocument`, `toHaveTextContent`, etc.
 * - Unmounts rendered React trees after every test.
 * - Resets browser-ish state (localStorage, URL) before each test so tests
 *   don't leak state through the storage layer or `useUrlFilters` hook.
 */
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'

afterEach(() => {
  cleanup()
})

beforeEach(() => {
  window.localStorage.clear()
  window.history.replaceState(null, '', '/')
})
