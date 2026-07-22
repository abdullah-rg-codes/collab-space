/**
 * Global test setup for Vitest + React Testing Library.
 *
 * - Registers @testing-library/jest-dom matchers on Vitest's `expect`
 *   so we can use assertions like `toBeInTheDocument`, `toHaveTextContent`, etc.
 * - Resets browser-ish state (localStorage, URL) before each test so tests
 *   don't leak state through the storage layer or `useUrlFilters` hook.
 *
 * NOTE: We do NOT call cleanup() here. React 19's concurrent renderer
 * causes cleanup/unmount to hang indefinitely in jsdom when components
 * have active effects (timers, event listeners). Instead, each test file
 * runs in its own isolated worker (Vitest's default), so DOM state doesn't
 * leak between files.
 */
import '@testing-library/jest-dom/vitest'
import { beforeEach } from 'vitest'

beforeEach(() => {
  window.localStorage.clear()
  window.history.replaceState(null, '', '/')
})
