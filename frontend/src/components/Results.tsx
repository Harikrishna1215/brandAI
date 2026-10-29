import { Copy, Download, RefreshCw, Plus, Info } from 'lucide-react'
import type { BrandForm, Result } from '../types'
import { download, toTxt } from '../export'

const BASIS: Record<string, string> = { reference_posts: 'Based on your reference posts + inputs', preferences: 'Based on your tone/guideline preferences (AI-inferred)', inference: 'Inferred by AI from your inputs, not verified' }

interface Props { result: Result; form: BrandForm; loading: boolean; onCopy: (text: string, label: string) => void; onRegenerate: () => void; onNew: () => void }

export default function Results({ result, form, loading, onCopy, onRegenerate, onNew }: Props) {
  const v = result.brand_voice
  return (
    <section aria-label="Results" className="space-y-4">
      <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div><h2 className="text-lg font-semibold">{form.brand_name || 'Your brand'} voice</h2>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-indigo-700"><Info size={12} />{BASIS[result.basis] ?? ''}</p></div>
          <div className="flex flex-wrap gap-1">{v.tone.map((t) => <span key={t} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">{t}</span>)}</div>
        </div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">{v.summary.map((s, i) => <li key={i}>{s}</li>)}</ul>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-xs uppercase text-slate-500">Audience</dt><dd>{v.target_audience}</dd></div>
          <div><dt className="text-xs uppercase text-slate-500">Themes</dt><dd>{v.content_themes.join(' · ')}</dd></div>
        </dl>
      </div>
      {result.warnings.length > 0 && <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{result.warnings.join(' ')}</p>}
      <div className="flex flex-wrap gap-2">
        <button className="btn-ghost" onClick={() => onCopy(toTxt(result), 'All tweets')}><Copy size={16} />Copy all</button>
        <button className="btn-ghost" onClick={() => download('tweets.txt', toTxt(result), 'text/plain')}><Download size={16} />.txt</button>
        <button className="btn-ghost" onClick={() => download('tweets.json', JSON.stringify(result, null, 2), 'application/json')}><Download size={16} />.json</button>
        <button className="btn-primary" disabled={loading} onClick={onRegenerate}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />Generate another 10</button>
        <button className="btn-ghost" onClick={onNew}><Plus size={16} />New generation</button>
      </div>
      <ol className="grid gap-3 sm:grid-cols-2">
        {result.tweets.map((t) => (
          <li key={t.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold text-slate-500">#{t.id}</span><span className="rounded-full bg-violet-50 px-2 py-0.5 font-medium text-violet-700">{t.category}</span></div>
            <p className="flex-1 whitespace-pre-wrap text-[15px] leading-relaxed">{t.text}</p>
            <p className="mt-2 text-xs text-slate-500">{t.rationale}</p>
            <div className="mt-3 flex items-center justify-between"><span className={`text-xs ${t.character_count > 280 ? 'font-semibold text-rose-600' : 'text-slate-500'}`}>{t.character_count}/280</span>
              <button className="btn-ghost !py-1 text-xs" aria-label={`Copy tweet ${t.id}`} onClick={() => onCopy(t.text, `Tweet ${t.id}`)}><Copy size={14} />Copy</button></div>
          </li>
        ))}
      </ol>
    </section>
  )
}
