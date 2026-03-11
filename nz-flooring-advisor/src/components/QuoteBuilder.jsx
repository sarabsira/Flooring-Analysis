import { useState } from 'react'
import { Plus, Trash2, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore } from '../store/store'
import { downloadReport } from '../utils/pdfExport'

function calcLine(area, wastage, pricePerM2) {
  const effectiveArea = area * (1 + wastage / 100)
  return { effectiveArea, cost: effectiveArea * pricePerM2 }
}

export default function QuoteBuilder({ project }) {
  const { settings, addQuote, updateQuote, deleteQuote } = useStore()
  const [activeQuoteId, setActiveQuoteId] = useState(null)
  const [building, setBuilding] = useState(false)
  const [draft, setDraft] = useState(null)
  const [expandedVersions, setExpandedVersions] = useState({})

  const rooms = project.rooms || []
  const quotes = project.quotes || []

  const startNewQuote = () => {
    const wastage = settings.defaultWastagePct
    const lineItems = rooms.flatMap(room => {
      const area = room.manualArea ?? room.estimatedArea ?? 0
      const layers = room.flooringLayers || {}
      return Object.entries(layers)
        .filter(([, v]) => v && (v.pricePerM2 || v.manualPricePerM2))
        .map(([layerKey, v]) => ({
          id: crypto.randomUUID(),
          roomId: room.id,
          roomName: room.name,
          layer: layerKey,
          description: `${room.name} — ${v.productName || v.typeName || layerKey}`,
          area,
          wastage,
          pricePerM2: v.manualPricePerM2 || v.pricePerM2 || 0,
          ...calcLine(area, wastage, v.manualPricePerM2 || v.pricePerM2 || 0),
        }))
    })

    // Labour line items
    const labourLines = rooms.map(room => {
      const area = room.manualArea ?? room.estimatedArea ?? 0
      const isWet = ['bathroom', 'kitchen', 'laundry'].includes(room.type)
      const rate = isWet ? settings.labourRates.wetArea : settings.labourRates.standard
      return {
        id: crypto.randomUUID(),
        roomId: room.id,
        roomName: room.name,
        layer: 'labour',
        description: `${room.name} — Labour (${isWet ? 'wet area' : 'standard'})`,
        area,
        wastage: 0,
        pricePerM2: rate,
        effectiveArea: area,
        cost: area * rate,
      }
    })

    const allLines = [...lineItems, ...labourLines]
    const subtotal = allLines.reduce((sum, l) => sum + (l.cost || 0), 0)
    const margin = subtotal * (settings.defaultMarginPct / 100)
    const subtotalWithMargin = subtotal + margin
    const gst = subtotalWithMargin * settings.gstRate
    const total = subtotalWithMargin + gst

    setDraft({
      lineItems: allLines,
      margin: settings.defaultMarginPct,
      marginAmount: margin,
      subtotal: subtotalWithMargin,
      gst,
      total,
      notes: '',
    })
    setBuilding(true)
  }

  const updateLine = (id, field, value) => {
    const updated = draft.lineItems.map(l => {
      if (l.id !== id) return l
      const newL = { ...l, [field]: value }
      if (field === 'area' || field === 'wastage' || field === 'pricePerM2') {
        const { effectiveArea, cost } = calcLine(
          field === 'area' ? value : newL.area,
          field === 'wastage' ? value : newL.wastage,
          field === 'pricePerM2' ? value : newL.pricePerM2,
        )
        return { ...newL, effectiveArea, cost }
      }
      return newL
    })
    recalc(updated, draft.margin)
  }

  const removeLine = (id) => {
    recalc(draft.lineItems.filter(l => l.id !== id), draft.margin)
  }

  const addLine = () => {
    recalc([...draft.lineItems, {
      id: crypto.randomUUID(), roomName: 'Manual', layer: 'other',
      description: '', area: 0, wastage: 0, pricePerM2: 0, effectiveArea: 0, cost: 0
    }], draft.margin)
  }

  const recalc = (lineItems, margin) => {
    const subtotal = lineItems.reduce((s, l) => s + (l.cost || 0), 0)
    const marginAmount = subtotal * (margin / 100)
    const subtotalWithMargin = subtotal + marginAmount
    const gst = subtotalWithMargin * settings.gstRate
    setDraft({ ...draft, lineItems, margin, marginAmount, subtotal: subtotalWithMargin, gst, total: subtotalWithMargin + gst })
  }

  const saveQuote = () => {
    addQuote(project.id, draft)
    setBuilding(false)
    setDraft(null)
  }

  const toggleVersion = (id) => setExpandedVersions(e => ({ ...e, [id]: !e[id] }))

  const LAYER_LABELS = { subfloor: 'Subfloor', underlay: 'Underlay', surface: 'Surface', labour: 'Labour', other: 'Other' }
  const LAYER_COLORS = { subfloor: 'badge-stone', underlay: 'badge-green', surface: 'badge-amber', labour: 'bg-blue-100 text-blue-700 border border-blue-200 inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-mono', other: 'badge-stone' }

  return (
    <div className="space-y-4">
      {/* Existing quotes */}
      {quotes.map(q => (
        <div key={q.id} className="card overflow-hidden">
          <button
            onClick={() => toggleVersion(q.id)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText size={14} className="text-stone-400" />
              <div className="text-left">
                <div className="text-sm font-body font-semibold text-forest-700">
                  Quote v{q.version}
                </div>
                <div className="text-xs font-mono text-stone-400">
                  {new Date(q.date).toLocaleDateString('en-NZ')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-lg font-semibold text-forest-700">
                ${q.total?.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-stone-400">incl. GST</span>
              {expandedVersions[q.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </button>

          {expandedVersions[q.id] && (
            <div className="border-t border-stone-100 px-4 pb-4 space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono mt-3">
                  <thead>
                    <tr className="text-stone-400 border-b border-stone-200">
                      <th className="text-left pb-2 font-medium">Description</th>
                      <th className="text-right pb-2 font-medium">Area</th>
                      <th className="text-right pb-2 font-medium">Rate</th>
                      <th className="text-right pb-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {q.lineItems?.map(l => (
                      <tr key={l.id}>
                        <td className="py-1.5 pr-2">
                          <span className={LAYER_COLORS[l.layer] || 'badge-stone'}>{LAYER_LABELS[l.layer]}</span>
                          <span className="ml-2 text-forest-700">{l.description}</span>
                        </td>
                        <td className="text-right text-stone-500">{l.effectiveArea?.toFixed(2)}m²</td>
                        <td className="text-right text-stone-500">${l.pricePerM2?.toFixed(2)}</td>
                        <td className="text-right font-semibold text-forest-700">${l.cost?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-stone-200 pt-3 space-y-1 text-xs font-mono">
                {q.marginAmount > 0 && (
                  <div className="flex justify-between text-stone-500">
                    <span>Margin ({q.margin}%)</span><span>${q.marginAmount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span><span>${(q.subtotal - q.gst)?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>GST (15%)</span><span>${q.gst?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-forest-700 font-bold text-sm pt-1 border-t border-stone-200">
                  <span>TOTAL INC GST</span><span>${q.total?.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => downloadReport(project, settings)}
                  className="btn-secondary text-xs flex items-center gap-1.5"
                >
                  <FileText size={12} /> Export PDF
                </button>
                <button
                  onClick={() => deleteQuote(project.id, q.id)}
                  className="btn-danger text-xs flex items-center gap-1.5"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* New quote builder */}
      {building && draft ? (
        <div className="card p-4 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-forest-700 font-semibold">New Quote — v{quotes.length + 1}</h3>
            <button onClick={() => setBuilding(false)} className="text-xs font-mono text-stone-400 hover:text-stone-600">✕ Cancel</button>
          </div>

          {/* Line items */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-stone-400 font-mono border-b border-stone-200">
                  <th className="text-left pb-2">Description</th>
                  <th className="text-right pb-2">Area m²</th>
                  <th className="text-right pb-2">Waste %</th>
                  <th className="text-right pb-2">$/m²</th>
                  <th className="text-right pb-2">Total</th>
                  <th className="pb-2 w-6"></th>
                </tr>
              </thead>
              <tbody>
                {draft.lineItems.map(l => (
                  <tr key={l.id} className="border-b border-stone-100">
                    <td className="py-1.5 pr-2">
                      <input
                        className="w-full border border-stone-200 rounded-sm px-2 py-1 text-xs font-body bg-white focus:outline-none focus:border-timber-400"
                        value={l.description}
                        onChange={(e) => updateLine(l.id, 'description', e.target.value)}
                      />
                    </td>
                    <td className="pr-1">
                      <input
                        type="number" step="0.01" min="0"
                        className="w-20 border border-stone-200 rounded-sm px-2 py-1 text-xs text-right font-mono bg-white focus:outline-none focus:border-timber-400"
                        value={l.area}
                        onChange={(e) => updateLine(l.id, 'area', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="pr-1">
                      <input
                        type="number" step="1" min="0" max="50"
                        className="w-16 border border-stone-200 rounded-sm px-2 py-1 text-xs text-right font-mono bg-white focus:outline-none focus:border-timber-400"
                        value={l.wastage}
                        onChange={(e) => updateLine(l.id, 'wastage', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="pr-1">
                      <input
                        type="number" step="0.01" min="0"
                        className="w-20 border border-stone-200 rounded-sm px-2 py-1 text-xs text-right font-mono bg-white focus:outline-none focus:border-timber-400"
                        value={l.pricePerM2}
                        onChange={(e) => updateLine(l.id, 'pricePerM2', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="text-right font-mono font-semibold text-forest-700 pr-1">
                      ${l.cost?.toFixed(2)}
                    </td>
                    <td>
                      <button onClick={() => removeLine(l.id)} className="text-red-400 hover:text-red-600 p-0.5">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={addLine} className="btn-ghost text-xs flex items-center gap-1.5">
            <Plus size={12} /> Add Line Item
          </button>

          {/* Margin + Totals */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className="label">Margin %</label>
              <input
                type="number" step="0.5" min="0" max="100"
                className="input font-mono"
                value={draft.margin}
                onChange={(e) => recalc(draft.lineItems, parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1 text-right font-mono text-xs text-stone-500">
              {draft.margin > 0 && <div>Margin: ${draft.marginAmount?.toFixed(2)}</div>}
              <div>Subtotal: ${(draft.subtotal - draft.gst)?.toFixed(2)}</div>
              <div>GST (15%): ${draft.gst?.toFixed(2)}</div>
              <div className="text-forest-700 font-bold text-base">TOTAL: ${draft.total?.toFixed(2)}</div>
            </div>
          </div>

          <div>
            <label className="label">Quote Notes</label>
            <textarea
              className="input min-h-[60px] resize-y text-sm"
              placeholder="Terms, inclusions, exclusions, validity period…"
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            />
          </div>

          <button onClick={saveQuote} className="btn-primary w-full">Save Quote</button>
        </div>
      ) : (
        <button onClick={startNewQuote} className="btn-primary flex items-center gap-2">
          <Plus size={14} /> Build New Quote
        </button>
      )}
    </div>
  )
}
