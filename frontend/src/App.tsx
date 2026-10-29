import { useState } from 'react'
import { AlertTriangle, Loader2, PenLine, Sparkles } from 'lucide-react'
import Form from './components/Form'
import Results from './components/Results'
import { ApiError, generate } from './api'
import { copyText } from './export'
import { BrandForm, Result, emptyForm } from './types'

export default function App() {
  const [form, setForm] = useState<BrandForm>(emptyForm)
  const [result, setResult] = useState<Result | null>(null)
  const [variation, setVariation] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState('')

  const run = async (v: number) => {
    if (loading) return
    setLoading(true); setError(''); setFieldErrors({})
    try { setResult(await generate(form, v)); setVariation(v) }
    catch (e) { const a = e as ApiError; setError(a.message); setFieldErrors(a.fieldErrors ?? {}) }
    finally { setLoading(false) }
  }
  const onCopy = async (text: string, label: string) => {
    setToast((await copyText(text)) ? `${label} copied` : 'Copy failed. Select the text manually.')
    setTimeout(() => setToast(''), 2500)
  }
  const reset = () => { setResult(null); setForm(emptyForm); setError(''); setVariation(0); window.scrollTo({ top: 0 }) }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3" aria-label="Main">
          <div className="flex items-center gap-2"><PenLine className="text-indigo-600" size={20} /><span className="font-bold">BrandVoice AI</span><span className="hidden text-xs text-slate-500 sm:inline">AI-powered content studio</span></div>
          <div className="flex items-center gap-3 text-sm"><a href="#how" className="text-slate-600 hover:text-indigo-700">How it works</a>
            {result && <button className="btn-ghost !py-1" onClick={reset}>New generation</button>}</div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-16">
        <section className="py-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Every brand has a voice.<br /><span className="text-indigo-600">Let's make it heard.</span></h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">Generate 10 brand-aligned tweets in seconds. Define your brand, choose your campaign goal, and let AI do the creative work.</p>
          <p className="mt-1 text-sm italic text-slate-500">Your brand's voice. Ten tweets. One click.</p>
        </section>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <Form form={form} setForm={setForm} onSubmit={() => run(0)} loading={loading} serverErrors={fieldErrors} />
          <div aria-live="polite">
            {loading && <div role="status" className="mb-4 flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white p-4 text-sm"><Loader2 className="animate-spin text-indigo-600" size={18} />Analyzing your brand voice and crafting your tweets...</div>}
            {error && <div role="alert" className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><p className="flex items-center gap-2 font-medium"><AlertTriangle size={16} />{error}</p>
              <button className="btn-ghost mt-3" onClick={() => run(variation)}>Try again</button></div>}
            {result ? <Results result={result} form={form} loading={loading} onCopy={onCopy} onRegenerate={() => run(variation + 1)} onNew={reset} />
              : !loading && <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-slate-600"><Sparkles className="mx-auto mb-2 text-indigo-500" /><p className="font-medium">Your tweets will appear here</p><p className="mt-1 text-sm">Fill in the brand details (or try an example) and press Generate.</p></div>}
          </div>
        </div>
        <section id="how" className="mt-16 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">How it works</h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-700">
            <li>Describe your brand, products, objective and (optionally) paste reference posts.</li>
            <li>The backend sends your inputs, as data, to an LLM that analyses the voice and writes 10 tweets.</li>
            <li>Output is validated (exactly 10 distinct tweets, character counts computed in code) before display.</li>
            <li>Without reference posts the voice is <b>inferred</b>, not verified. Live social accounts are never fetched.</li>
          </ol>
        </section>
      </main>
      <div role="status" aria-live="polite" className="fixed bottom-4 left-1/2 -translate-x-1/2">{toast && <div className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">{toast}</div>}</div>
    </div>
  )
}
