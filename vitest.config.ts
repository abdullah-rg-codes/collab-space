/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

/**
 * Vitest configuration
 *
 * We use Vitest (rather than Jest) because the project is Vite-based:
 * it uses the same transform pipeline (esbuild + Vite plugins), avoiding a
 * separate ts-jest/babel-jest chain and staying in sync with build behavior.
 * Vitest exposes a Jest-compatible API (describe/it/expect/vi.fn), so tests
 * read the same as they would under Jest + React Testing Library.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // Reset spies/mocks between tests for isolation
    restoreMocks: true,
    clearMocks: true,
  },
})
