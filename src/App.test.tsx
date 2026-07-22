/**
 * Core workflow test:
 *   User creates a new task via the form and sees it appear on the board.
 *
 * This exercises the primary happy path through the app:
 *   App → Modal → TaskForm → useTasks → BoardView → Column → TaskCard
 * The whole tree is rendered (no mocks) so the test also validates that the
 * storage layer, reducer, and URL sync all cooperate correctly for this flow.
 */
import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App: core workflow — creating a task', () => {
  it('creates a task from the form and shows it as a card on the Backlog column', async () => {
    const user = userEvent.setup()
    render(<App />)

    // The board is empty on first render — the board-level "No tasks yet"
    // heading (an <h2>) proves we're in the empty state. Column-level empty
    // states use <p> tags, so filtering by heading role disambiguates.
    expect(
      screen.getByRole('heading', { level: 2, name: /no tasks yet/i })
    ).toBeInTheDocument()

    // Open the create-task modal
    await user.click(screen.getByRole('button', { name: /\+ New Task/i }))

    // The modal is a dialog labelled by its title
    const dialog = await screen.findByRole('dialog', { name: /create new task/i })

    // Only the title is required to submit — leave the rest at defaults
    await user.type(within(dialog).getByLabelText(/title/i), 'Write unit tests')

    // Submit the form
    await user.click(within(dialog).getByRole('button', { name: /^create$/i }))

    // Modal is dismissed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // The board-level empty state is gone…
    expect(
      screen.queryByRole('heading', { level: 2, name: /no tasks yet/i })
    ).not.toBeInTheDocument()

    // …and the task card is now on the board. TaskCard renders the title
    // as an <h3>, which uniquely identifies task cards.
    expect(
      screen.getByRole('heading', { level: 3, name: /write unit tests/i })
    ).toBeInTheDocument()

    // The Backlog column header is now visible (columns only render when
    // the board is non-empty), confirming the new task defaulted to Backlog.
    expect(
      screen.getByRole('heading', { level: 2, name: 'Backlog' })
    ).toBeInTheDocument()
  })
})
