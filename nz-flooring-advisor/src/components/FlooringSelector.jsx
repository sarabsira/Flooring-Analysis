import { useState } from 'react'
import { Layers, Loader, Zap, ChevronDown, ChevronUp, Edit3 } from 'lucide-react'
import { useClaude } from '../hooks/useClaude'
import { FLOORING_CATEGORIES, UFH_COMPATIBLE } from '../data/flooringTypes'
import { ROOM_REQUIREMENTS } from '../data/nzStandards'
import { useStore } from '../store/store'

export default function FlooringSelector({ room, projectYearBuilt, onUpdateRoom }) {
  const { products } = useStore()
  const { getFlooringRecommendation, loading } = useClaude()
  const [aiRec, setAiRec] = useState(room.aiFlooringRec || null)
  const [expanded, setExpanded] = useState({ subfloor: true, underlay: true, surface: true })
  const [loadingRec, setLoadingRec] = useState(false)

  const roomReqs = ROOM_REQUIREMENTS[room.type] || ROOM_REQUIREMENTS.other
  const area = room.manualArea ?? room.estimatedArea
  const layers = room.flooringLayers || {}

  const getAiRec = async () => {
    setLoadingRec(true)
    try {
      const raw = await getFlooringRecommendation(room.type, area, 'unknown', roomReqs.wetArea, projectYearBuilt)
      if (!raw) throw new Error('No response')
      const clean = raw.replace(/```json|```/g, '').trim()
      const result = JSON.parse(clean)
      setAiRec(result)
      onUpdateRoom({ aiFlooringRec: result })
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingRec(false)
    }
  }

  const setLayer = (layerKey, value) => {
    onUpdateRoom({ flooringLayers: { ...layers, [layerKey]: value } })
  }

  const toggle = (key) => setExpanded(e => ({ ...e, [key]: !e[key] }))

  // Products filtered by category
  const productsByCategory = (cat) => products.filter(p => p.category === cat)

  const renderLayerSection = (layerKey, label, color, description) => {
    const layerProducts = productsByCategory(layerKey)
    const selected = layers[layerKey]
    const types = FLOORING_CATEGORIES[layerKey]?.types || []

    return (
      <div key={layerKey} className="card overflow-hidden">
        <button
          onClick={() => toggle(layerKey)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition-colors"
          style={{ borderLeft: `3px solid ${color}` }}
        >
          <div className="flex items-center gap-3">
            <Layers size={15} style={{ color }} />
            <div className="text-left">
              <div className="text-sm font-body font-semibold text-forest-700">{label}</div>
              <div className="text-xs font-body text-stone-400">{description}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selected && (
              <span className="text-xs font-mono text-timber-500 max-w-[120px] truncate">
                {selected.productName || selected.typeName || 'Selected'}
              </span>
            )}
            {expanded[layerKey] ? <ChevronUp size={14} className="text-stone-400" /> : <ChevronDown size={14} className="text-stone-400" />}
          </div>
        </button>

        {expanded[layerKey] && (
          <div className="px-4 pb-4 pt-2 space-y-3 border-t border-stone-100">
            {/* AI recommendation for this layer */}
            {aiRec?.[layerKey] && (
              <div className="bg-forest-50 border border-forest-200 rounded-sm p-3 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-forest-700 mb-1">
                  <Zap size={11} className="text-timber-400" /> AI Recommendation
                </div>
                <p className="text-forest-600 font-body">{aiRec[layerKey].recommendation}</p>
                {aiRec[layerKey].notes && <p className="text-stone-500 mt-1">{aiRec[layerKey].notes}</p>}
                {aiRec[layerKey].compliance?.length > 0 && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {aiRec[layerKey].compliance.map(c => (
                      <span key={c} className="badge-green">{c}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* User products from database */}
            {layerProducts.length > 0 && (
              <div>
                <p className="text-xs font-mono text-stone-400 mb-1.5">Your Products</p>
                <div className="space-y-1">
                  {layerProducts.map(p => {
                    const isSelected = selected?.productId === p.id
                    const isStale = p.lastUpdated && (Date.now() - new Date(p.lastUpdated).getTime()) > 90 * 24 * 60 * 60 * 1000
                    return (
                      <button
                        key={p.id}
                        onClick={() => setLayer(layerKey, { productId: p.id, productName: p.name, pricePerM2: p.pricePerM2 })}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-left text-sm border transition-colors ${
                          isSelected
                            ? 'border-timber-400 bg-timber-50'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div>
                          <span className="font-body font-medium text-forest-800">{p.name}</span>
                          <span className="text-xs text-stone-400 ml-2 font-mono">{p.brand}</span>
                          {isStale && <span className="ml-2 badge-amber">Price may be outdated</span>}
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-sm font-semibold text-forest-700">
                            ${p.pricePerM2?.toFixed(2)}/m²
                          </span>
                          {p.suitable?.wetArea && roomReqs.wetArea && (
                            <span className="ml-1 badge-green">✓ Wet Area</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Generic type selector (from built-in types) */}
            <div>
              <p className="text-xs font-mono text-stone-400 mb-1.5">
                {layerProducts.length > 0 ? 'Or select generic type' : 'Select type (add to Products for pricing)'}
              </p>
              <div className="grid grid-cols-1 gap-1">
                {types.map(t => {
                  const isSelected = selected?.typeId === t.id && !selected?.productId
                  const notRecommended = roomReqs.notRecommended?.includes(t.id)
                  return (
                    <button
                      key={t.id}
                      onClick={() => !notRecommended && setLayer(layerKey, { typeId: t.id, typeName: t.label })}
                      disabled={notRecommended}
                      className={`flex items-center justify-between px-3 py-2 rounded-sm text-left text-xs border transition-colors ${
                        notRecommended
                          ? 'border-red-100 bg-red-50 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'border-timber-400 bg-timber-50'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div>
                        <span className="font-body text-forest-800">{t.label}</span>
                        <span className="text-stone-400 ml-2">{t.description}</span>
                        {notRecommended && <span className="ml-2 badge-red">Not recommended for {room.type}</span>}
                      </div>
                      <span className="font-mono text-stone-400">{t.pricePlaceholder}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Manual note override */}
            <div>
              <label className="label">Custom Note / Override</label>
              <input
                className="input text-xs"
                placeholder="e.g. Customer to supply — use existing"
                value={selected?.customNote || ''}
                onChange={(e) => setLayer(layerKey, { ...(selected || {}), customNote: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Room compliance summary */}
      {roomReqs.wetArea && (
        <div className="badge-amber flex items-center gap-1.5 w-fit">
          <span>⚠</span> Wet Area — E3 compliance required
        </div>
      )}

      {/* AI Recommendation button */}
      <button
        onClick={getAiRec}
        disabled={loadingRec || loading}
        className="btn-ghost w-full flex items-center justify-center gap-2 text-sm"
      >
        {(loadingRec || loading)
          ? <><Loader size={13} className="animate-spin" /> Getting AI recommendation…</>
          : <><Zap size={13} className="text-timber-400" /> Get AI Flooring Recommendation</>
        }
      </button>

      {aiRec?.warnings?.length > 0 && (
        <div className="space-y-1">
          {aiRec.warnings.map((w, i) => (
            <div key={i} className="text-xs font-body text-amber-700 bg-amber-50 border border-amber-200 rounded-sm px-3 py-2">
              ⚠ {w}
            </div>
          ))}
        </div>
      )}

      {/* Surface options from AI */}
      {aiRec?.surface?.length > 0 && (
        <div className="card p-3">
          <p className="text-xs font-mono text-stone-400 mb-2">AI Surface Options</p>
          <div className="space-y-2">
            {aiRec.surface.slice(0, 3).map((opt, i) => (
              <div key={i} className={`rounded-sm p-2.5 border text-xs ${
                opt.suitability === 'excellent' ? 'border-forest-300 bg-forest-50' : 'border-stone-200 bg-stone-50'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-forest-700">{opt.option}</span>
                  <div className="flex items-center gap-1">
                    <span className={opt.suitability === 'excellent' ? 'badge-green' : 'badge-stone'}>{opt.suitability}</span>
                    <span className="font-mono text-stone-500">{opt.estimatedCostRange}</span>
                  </div>
                </div>
                {opt.notes && <p className="text-stone-500">{opt.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layer sections */}
      {renderLayerSection('subfloor', 'Subfloor / Base', '#8B8B7A', 'Structural base layer — NZS 3604')}
      {renderLayerSection('underlay', 'Underlay', '#5a875f', 'Acoustic, thermal & moisture barrier')}
      {renderLayerSection('surface', 'Surface Finish', '#D4832A', 'Visible top layer')}

      {/* NZ compliance notes */}
      {roomReqs.subfloorNote && (
        <div className="bg-stone-50 border border-stone-200 rounded-sm p-3 text-xs font-body text-stone-600">
          <strong className="text-stone-700">NZ Note:</strong> {roomReqs.subfloorNote}
        </div>
      )}
    </div>
  )
}
