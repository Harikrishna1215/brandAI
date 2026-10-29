import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App'

const sample = { brand_voice: { summary: ['a', 'b', 'c'], tone: ['Bold'], target_audience: 'Streetwear fans', content_themes: ['Drops'], writing_style: 's', analysis_basis: 'x' }, basis: 'inference', warnings: [],
  tweets: Array.from({ length: 10 }, (_, i) => ({ id: i + 1, category: 'Engagement', text: `Tweet ${i + 1}`, rationale: 'r', character_count: 7 })) }

afterEach(() => vi.restoreAllMocks())

test('renders form and validates required fields', async () => {
  render(<App />)
  await userEvent.click(screen.getByRole('button', { name: /generate 10 tweets/i }))
  expect(screen.getByText(/choose a campaign objective/i)).toBeInTheDocument()
  expect(screen.getByText(/describe your products/i)).toBeInTheDocument()
})

test('preset fills form and tone chips toggle', async () => {
  render(<App />)
  await userEvent.click(screen.getByRole('button', { name: /urbanvibe/i }))
  expect(screen.getByLabelText(/brand name/i)).toHaveValue('UrbanVibe')
  const witty = screen.getByRole('button', { name: 'Witty' })
  await userEvent.click(witty)
  expect(witty).toHaveAttribute('aria-pressed', 'true')
})

test('generates, shows 10 tweets, copies, and handles errors', async () => {
  Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
  const f = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify(sample), { status: 200 }))
  render(<App />)
  await userEvent.click(screen.getByRole('button', { name: /urbanvibe/i }))
  await userEvent.click(screen.getByRole('button', { name: /generate 10 tweets/i }))
  expect(await screen.findAllByRole('listitem')).not.toHaveLength(0)
  expect(await screen.findByText('Tweet 10')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /copy tweet 1$/i }))
  expect(await screen.findByText(/tweet 1 copied/i)).toBeInTheDocument()
  f.mockRejectedValueOnce(new TypeError('net'))
  await userEvent.click(screen.getByRole('button', { name: /generate another/i }))
  expect(await screen.findByText(/could not reach the server/i)).toBeInTheDocument()
  await userEvent.click(screen.getAllByRole('button', { name: /new generation/i })[0])
  expect(screen.getByText(/your tweets will appear here/i)).toBeInTheDocument()
})
