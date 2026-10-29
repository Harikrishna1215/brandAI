import { useState } from 'react'
import { Sparkles, RotateCcw, Wand2, Loader2 } from 'lucide-react'
import { BrandForm, INDUSTRIES, LANGUAGES, OBJECTIVES, PRESETS, TONES, emptyForm } from '../types'

interface Props { form: BrandForm; setForm: (f: BrandForm) => void; onSubmit: () => void; loading: boolean; serverErrors: Record<string, string> }

const Field = ({ id, label, req, hint, count, max, error, children }: { id: string; label: string; req?: boolean; hint?: string; count?: number; max?: number; error?: string; children: React.ReactNode }) => (
  <div>
    <div className="mb-1 flex items-baseline justify-between"><label htmlFor={id} className="text-sm font-medium">{label}{req && <span className="text-rose-600" aria-hidden> *</span>}</label>
      {max !== undefined && <span className="text-xs text-slate-500">{count}/{max}</span>}</div>
    {hint && <p id={`${id}-h`} className="mb-1 text-xs text-slate-500">{hint}</p>}
    {children}
    {error && <p role="alert" className="mt-1 text-xs text-rose-600">{error}</p>}
  </div>
)

export default function Form({ form, setForm, onSubmit, loading, serverErrors }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const set = <K extends keyof BrandForm>(k: K, v: BrandForm[K]) => setForm({ ...form, [k]: v })
  const err = (k: string) => errors[k] ?? serverErrors[k]
  const toggleTone = (t: string) => set('tones', form.tones.includes(t) ? form.tones.filter((x) => x !== t) : [...form.tones, t])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const v: Record<string, string> = {}
    if (!form.objective) v.objective = 'Please choose a campaign objective.'
    if (form.products.trim().length < 10) v.products = 'Describe your products or services (at least 10 characters).'
    setErrors(v)
    if (!Object.keys(v).length) onSubmit()
  }

  return (
    <form onSubmit={submit} noValidate aria-label="Brand configuration" className="space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-500">Try an example:</span>
        {Object.keys(PRESETS).map((n) => <button key={n} type="button" className="btn-ghost !py-1 text-xs" onClick={() => { setForm(PRESETS[n]); setErrors({}) }}><Wand2 size={14} />{n}</button>)}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="brand_name" label="Brand name" error={err('brand_name')}><input id="brand_name" className="input" placeholder="e.g. UrbanVibe" maxLength={80} value={form.brand_name} onChange={(e) => set('brand_name', e.target.value)} /></Field>
        <Field id="industry" label="Industry / category"><input id="industry" list="industries" className="input" placeholder="e.g. Fashion" maxLength={80} value={form.industry} onChange={(e) => set('industry', e.target.value)} /><datalist id="industries">{INDUSTRIES.map((i) => <option key={i} value={i} />)}</datalist></Field>
      </div>
      <Field id="objective" label="Campaign objective" req error={err('objective')}>
        <select id="objective" className="input" value={form.objective} aria-required onChange={(e) => set('objective', e.target.value)}><option value="">Select an objective…</option>{OBJECTIVES.map((o) => <option key={o}>{o}</option>)}</select>
      </Field>
      <Field id="products" label="Products or services" req hint="Features, offers and value proposition. Only facts you provide will be used." count={form.products.length} max={1500} error={err('products')}>
        <textarea id="products" rows={3} maxLength={1500} className="input" placeholder="e.g. Oversized cotton tees, heavyweight hoodies and limited-run sneakers…" value={form.products} onChange={(e) => set('products', e.target.value)} />
      </Field>
      <Field id="audience" label="Target audience"><input id="audience" className="input" placeholder="e.g. Young professionals interested in sustainable fashion" maxLength={300} value={form.audience} onChange={(e) => set('audience', e.target.value)} /></Field>
      <fieldset>
        <legend className="mb-1 text-sm font-medium">Preferred tone</legend>
        <div className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={form.tones.length === 0} onClick={() => set('tones', [])} className={`rounded-full border px-3 py-1 text-xs ${form.tones.length === 0 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>AI decides</button>
          {TONES.map((t) => <button key={t} type="button" aria-pressed={form.tones.includes(t)} onClick={() => toggleTone(t)} className={`rounded-full border px-3 py-1 text-xs ${form.tones.includes(t) ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white hover:bg-slate-50'}`}>{t}</button>)}
        </div>
      </fieldset>
      <Field id="guidelines" label="Brand personality / additional instructions" hint="Words to use or avoid, brand guidelines, communication preferences." count={form.guidelines.length} max={1500}>
        <textarea id="guidelines" rows={2} maxLength={1500} className="input" value={form.guidelines} onChange={(e) => set('guidelines', e.target.value)} />
      </Field>
      <Field id="reference_posts" label="Reference posts (optional)" hint="Paste a few existing posts from X, Instagram, LinkedIn… The AI analyses only what you paste; it does not fetch live accounts." count={form.reference_posts.length} max={5000}>
        <textarea id="reference_posts" rows={3} maxLength={5000} className="input" value={form.reference_posts} onChange={(e) => set('reference_posts', e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="language" label="Output language"><select id="language" className="input" value={form.language} onChange={(e) => set('language', e.target.value)}>{LANGUAGES.map((l) => <option key={l}>{l}</option>)}</select></Field>
        <Field id="hashtags" label="Hashtags"><select id="hashtags" className="input" value={form.hashtags} onChange={(e) => set('hashtags', e.target.value as BrandForm['hashtags'])}><option value="none">No hashtags</option><option value="few">A few relevant hashtags</option><option value="ai">Let AI decide</option></select></Field>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <button type="submit" disabled={loading} className="btn-primary flex-1 sm:flex-none">{loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}Generate 10 Tweets</button>
        <button type="button" className="btn-ghost" disabled={loading} onClick={() => { setForm(emptyForm); setErrors({}) }}><RotateCcw size={16} />Reset form</button>
      </div>
    </form>
  )
}
