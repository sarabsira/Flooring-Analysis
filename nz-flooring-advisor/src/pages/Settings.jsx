import { useState } from 'react'
import { useStore } from '../store/store'
import { Save, Info } from 'lucide-react'

export default function Settings() {
  const { settings, updateSettings, updateLabourRate } = useStore()
  const [saved, setSaved] = useState(false)

  const set = (k, v) => updateSettings({ [k]: v })

  const markSaved = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-forest-700 font-semibold">Settings</h1>
          <p className="text-stone-500 font-body text-sm mt-1">Company details, rates and defaults</p>
        </div>
        <button onClick={markSaved} className={`flex items-center gap-2 transition-colors ${saved ? 'btn-secondary' : 'btn-primary'}`}>
          <Save size={14} /> {saved ? 'Saved ✓' : 'Save'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Company */}
        <div className="card p-5 space-y-4">
          <h2 className="font-display text-forest-700 font-semibold text-base">Company Details</h2>
          <p className="text-xs font-body text-stone-400">Appears on PDF job reports and quotes</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Company Name</label>
              <input className="input" placeholder="Your Flooring Company Ltd" value={settings.companyName} onChange={e => set('companyName', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="label">Address</label>
              <input className="input" placeholder="Street, Suburb, City" value={settings.companyAddress} onChange={e => set('companyAddress', e.target.value)} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="021 000 0000" value={settings.companyPhone} onChange={e => set('companyPhone', e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="info@yourcompany.co.nz" value={settings.companyEmail} onChange={e => set('companyEmail', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Quote defaults */}
        <div className="card p-5 space-y-4">
          <h2 className="font-display text-forest-700 font-semibold text-base">Quote Defaults</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Default Wastage %</label>
              <input
                className="input font-mono"
                type="number" step="1" min="0" max="50"
                value={settings.defaultWastagePct}
                onChange={e => set('defaultWastagePct', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-stone-400 mt-1 font-body">Applied to material quantities. Typically 10–15%</p>
            </div>
            <div>
              <label className="label">Default Margin %</label>
              <input
                className="input font-mono"
                type="number" step="0.5" min="0" max="100"
                value={settings.defaultMarginPct}
                onChange={e => set('defaultMarginPct', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-stone-400 mt-1 font-body">Markup on total before GST. Set 0 for no markup</p>
            </div>
            <div>
              <label className="label">GST Rate</label>
              <div className="input font-mono bg-stone-50 text-stone-500 flex items-center">
                {(settings.gstRate * 100).toFixed(0)}% — NZ standard (fixed)
              </div>
            </div>
          </div>
        </div>

        {/* Labour rates */}
        <div className="card p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-forest-700 font-semibold text-base">Labour Rates (per m²)</h2>
              <p className="text-xs font-body text-stone-400 mt-0.5">Edit to match your actual rates or regional pricing</p>
            </div>
            <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-sm px-3 py-2 text-xs font-body text-amber-700 max-w-xs">
              <Info size={12} className="mt-0.5 flex-shrink-0" />
              Labour rates vary significantly by region. Auckland rates typically 20–30% higher than regional NZ.
            </div>
          </div>
          <div className="space-y-3">
            {[
              ['standard', 'Standard Install (LVP, laminate, carpet)'],
              ['wetArea', 'Wet Area Install (tile, vinyl sheet)'],
              ['carpet', 'Carpet Lay'],
              ['tile', 'Tile Lay (porcelain / ceramic)'],
              ['stairs', 'Stairs (per tread, approx $/m²)'],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <label className="text-sm font-body text-stone-600 flex-1">{label}</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono text-stone-400">$</span>
                  <input
                    className="input w-24 text-right font-mono text-sm"
                    type="number" step="0.50" min="0"
                    value={settings.labourRates[key] ?? ''}
                    onChange={e => updateLabourRate(key, parseFloat(e.target.value) || 0)}
                  />
                  <span className="text-xs font-mono text-stone-400">/m²</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI / API info */}
        <div className="card p-5 space-y-3">
          <h2 className="font-display text-forest-700 font-semibold text-base">AI Configuration</h2>
          <p className="text-sm font-body text-stone-500">
            AI features use the Anthropic Claude API via a Netlify serverless function.
            The API key is stored as a Netlify environment variable — never in your code.
          </p>
          <div className="bg-stone-50 border border-stone-200 rounded-sm p-3 font-mono text-xs space-y-1 text-stone-600">
            <div>1. Go to your Netlify project → Site Settings → Environment Variables</div>
            <div>2. Add: <strong className="text-forest-700">ANTHROPIC_API_KEY</strong> = your API key</div>
            <div>3. Redeploy — AI features will activate automatically</div>
          </div>
          <p className="text-xs font-body text-stone-400">
            Without an API key, all AI features (photo analysis, area estimation, subfloor assessment, flooring recommendations) 
            are disabled. Manual entry overrides work for all features regardless of API status.
          </p>
        </div>

        {/* Data */}
        <div className="card p-5 space-y-3">
          <h2 className="font-display text-forest-700 font-semibold text-base">Data Storage</h2>
          <p className="text-sm font-body text-stone-500">
            All data (projects, products, settings) is stored locally in your browser using localStorage. 
            Nothing is sent to any server except photos sent for AI analysis.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                const data = JSON.stringify(localStorage.getItem('nz-flooring-store'), null, 2)
                const blob = new Blob([data], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a'); a.href = url; a.download = 'flooring-backup.json'; a.click()
              }}
              className="btn-ghost text-sm"
            >
              Export Backup
            </button>
            <button
              onClick={() => {
                if (confirm('⚠ This will delete ALL projects, products, and settings. Are you sure?')) {
                  localStorage.clear(); window.location.reload()
                }
              }}
              className="btn-danger text-sm"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
