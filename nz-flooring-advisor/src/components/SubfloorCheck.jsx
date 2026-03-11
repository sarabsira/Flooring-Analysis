import { useState, useRef } from 'react'
import { Upload, Loader, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'
import { useClaude } from '../hooks/useClaude'
import { ASBESTOS_WARNING, ASBESTOS_THRESHOLD_YEAR } from '../data/nzStandards'

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const CONDITION_CONFIG = {
  good: { color: 'text-forest-600', bg: 'bg-forest-50 border-forest-200', icon: CheckCircle, label: 'Good' },
  fair: { color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: AlertTriangle, label: 'Fair' },
  poor: { color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', icon: AlertTriangle, label: 'Poor — Remediation Needed' },
  critical: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: XCircle, label: 'Critical — Do Not Proceed' },
}

export default function SubfloorCheck({ room, yearBuilt, onUpdateRoom }) {
  const fileRef = useRef()
  const { analyseSubfloor, loading } = useClaude()
  const [analysing, setAnalysing] = useState(false)
  const [manualNotes, setManualNotes] = useState(room.subfloorManualNotes || '')

  const showAsbestosWarning = !yearBuilt || yearBuilt < ASBESTOS_THRESHOLD_YEAR

  const addPhotos = async (files) => {
    const newPhotos = await Promise.all(
      Array.from(files).map(async (file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        mimeType: file.type || 'image/jpeg',
        dataUrl: await new Promise((res) => {
          const r = new FileReader()
          r.onload = () => res(r.result)
          r.readAsDataURL(file)
        }),
        base64: await fileToBase64(file),
      }))
    )
    onUpdateRoom({ subfloorPhotos: [...(room.subfloorPhotos || []), ...newPhotos] })
  }

  const removePhoto = (id) => {
    onUpdateRoom({ subfloorPhotos: room.subfloorPhotos.filter((p) => p.id !== id) })
  }

  const runAnalysis = async () => {
    if (!room.subfloorPhotos?.length) return
    setAnalysing(true)
    const photo = room.subfloorPhotos[0]
    try {
      const raw = await analyseSubfloor(photo.base64, photo.mimeType, yearBuilt)
      if (!raw) throw new Error('No response from AI')
      const clean = raw.replace(/```json|```/g, '').trim()
      const result = JSON.parse(clean)
      onUpdateRoom({ subfloorAnalysis: result })
    } catch (err) {
      onUpdateRoom({ subfloorAnalysis: { error: err.message } })
    } finally {
      setAnalysing(false)
    }
  }

  const analysis = room.subfloorAnalysis
  const conditionCfg = analysis?.condition ? CONDITION_CONFIG[analysis.condition] : null

  return (
    <div className="space-y-4">
      {/* Mandatory asbestos warning */}
      {showAsbestosWarning && (
        <div className="bg-red-50 border border-red-300 rounded-sm p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700 mb-1">Asbestos Risk Warning</p>
              <p className="text-xs font-body text-red-700 leading-relaxed">{ASBESTOS_WARNING}</p>
            </div>
          </div>
        </div>
      )}

      {/* Photo upload */}
      <div>
        <label className="label">Subfloor Photos</label>
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); addPhotos(e.dataTransfer.files) }}
          className="border-2 border-dashed border-stone-300 rounded-sm p-5 text-center cursor-pointer hover:border-timber-400 transition-colors"
        >
          <Upload size={20} className="mx-auto text-stone-400 mb-1.5" />
          <p className="text-sm font-body text-stone-500">Upload subfloor photos</p>
          <p className="text-xs font-mono text-stone-400 mt-0.5">
            Photograph joists, existing materials, moisture, visible damage
          </p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addPhotos(e.target.files)} />
      </div>

      {/* Thumbnails */}
      {room.subfloorPhotos?.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {room.subfloorPhotos.map((photo) => (
            <div key={photo.id} className="relative group aspect-video bg-stone-100 rounded-sm overflow-hidden">
              <img src={photo.dataUrl} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removePhoto(photo.id)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-sm p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Analyse */}
      {room.subfloorPhotos?.length > 0 && (
        <button
          onClick={runAnalysis}
          disabled={analysing || loading}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          {(analysing || loading)
            ? <><Loader size={14} className="animate-spin" /> Analysing subfloor…</>
            : 'Run Subfloor Assessment'
          }
        </button>
      )}

      {/* Analysis result */}
      {analysis && !analysis.error && conditionCfg && (
        <div className={`rounded-sm border p-4 space-y-3 animate-fadeIn ${conditionCfg.bg}`}>
          <div className="flex items-center gap-2">
            <conditionCfg.icon size={16} className={conditionCfg.color} />
            <span className={`font-semibold text-sm ${conditionCfg.color}`}>{conditionCfg.label}</span>
            <span className="text-xs font-mono text-stone-500 ml-auto">{analysis.material}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {[
              { label: 'Moisture visible', val: analysis.moistureVisible },
              { label: 'Rot / damage', val: analysis.rotOrDamage },
              { label: 'Levelling required', val: analysis.levelingRequired },
              { label: 'Existing underlay', val: analysis.existingUnderlay },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={val ? 'text-red-500' : 'text-forest-500'}>{val ? '✗' : '✓'}</span>
                <span className="text-stone-600">{label}</span>
              </div>
            ))}
          </div>

          {/* Asbestos risk from AI */}
          <div className={`rounded-sm p-2 border text-xs font-body ${
            analysis.asbestosRisk === 'high' ? 'bg-red-50 border-red-200 text-red-700' :
            analysis.asbestosRisk === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-700' :
            'bg-stone-50 border-stone-200 text-stone-600'
          }`}>
            <strong>Asbestos risk ({analysis.asbestosRisk}):</strong> {analysis.asbestosRiskReason}
            {analysis.asbestosRisk !== 'low' && (
              <p className="mt-1 font-semibold">⚠ Professional testing required before work commences.</p>
            )}
          </div>

          {analysis.issues?.length > 0 && (
            <div>
              <p className="text-xs font-mono text-stone-500 mb-1">Issues identified:</p>
              <ul className="space-y-1">
                {analysis.issues.map((iss, i) => (
                  <li key={i} className="text-xs font-body text-stone-700 flex items-start gap-1.5">
                    <span className="text-red-400 mt-0.5">•</span>{iss}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.recommendations?.length > 0 && (
            <div>
              <p className="text-xs font-mono text-stone-500 mb-1">Recommendations:</p>
              <ul className="space-y-1">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs font-body text-forest-700 flex items-start gap-1.5">
                    <span className="text-forest-400 mt-0.5">→</span>{rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.remedialCostEstimate && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-stone-600">
              <Info size={12} />
              Remedial cost estimate: <strong>{analysis.remedialCostEstimate}</strong>
            </div>
          )}

          {!analysis.suitableForFlooring && (
            <div className="bg-red-100 border border-red-300 rounded-sm p-2 text-xs font-body text-red-800 font-semibold">
              ⚠ Subfloor not suitable for new flooring until remediation is complete.
            </div>
          )}
        </div>
      )}

      {analysis?.error && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-3 text-xs text-red-700">
          Analysis failed: {analysis.error}
        </div>
      )}

      {/* Manual notes override */}
      <div>
        <label className="label">Manual Subfloor Notes (Override)</label>
        <textarea
          className="input min-h-[80px] resize-y"
          placeholder="Enter your own subfloor observations — these will appear on the job report"
          value={manualNotes}
          onChange={(e) => {
            setManualNotes(e.target.value)
            onUpdateRoom({ subfloorManualNotes: e.target.value })
          }}
        />
      </div>
    </div>
  )
}
