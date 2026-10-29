import type { Result } from './types'
export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true } catch {
    try { const t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; document.body.appendChild(t); t.select(); const ok = document.execCommand('copy'); t.remove(); return ok } catch { return false }
  }
}
export const toTxt = (r: Result) => r.tweets.map((t) => `${t.id}. [${t.category}] ${t.text}`).join('\n\n')
export function download(name: string, content: string, mime: string) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type: mime })); a.download = name; a.click(); URL.revokeObjectURL(a.href)
}
