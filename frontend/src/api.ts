import type { BrandForm, Result } from './types'
const API = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000'
export class ApiError extends Error { constructor(msg: string, public fieldErrors: Record<string, string> = {}) { super(msg) } }

export async function generate(form: BrandForm, variation = 0): Promise<Result> {
  let res: Response
  try {
    res = await fetch(`${API}/api/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, variation }) })
  } catch {
    throw new ApiError('Could not reach the server. Check your connection and try again.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const fe: Record<string, string> = {}
    for (const e of data.errors ?? []) fe[e.field] = e.message
    throw new ApiError(data.detail ?? 'Something went wrong. Please try again.', fe)
  }
  return data as Result
}
