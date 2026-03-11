import { useState, useRef } from 'react'
import { Upload, Camera, Trash2, Loader, CheckCircle, AlertTriangle, Info, Edit3 } from 'lucide-react'
import { useClaude } from '../hooks/useClaude'

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const CONFIDENCE_STYLE = {
  high: 'badge-green',
  medium: 'badge-amber',
  low: 'badge-red',
}

export default function RoomAnalyzer({ room, projectId, onUpdateRoom }) {
  const fileRef = useRef()
  const { analyseRoom, loading, error } = useClaude()
  const [analysing, setAnalysing] = useState(false)
  const [manualArea, setManualArea] = useState(room.manualArea ?? '')
  const [editingManual, setEditingManual] = useState(false)

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
    onUpdateRoom({ photos: [...(room.photos || []), ...newPhotos] })
  }

  const removePhoto = (id) => {
    onUpdateRoom({ photos: room.photos.filter((p) => p.id !== id) })
  }

  const runAnalysis = async () => {
    if (!room.photos?.length) return
    setAnalysing(true)
    // Use the first photo for primary analysis
    const photo = room.photos[0]
    try {
      const raw = await analyseRoom(photo.base64, photo.mimeType, room.type)
      if (!raw) throw new Error('No response from AI')
      // Strip potential markdown fences
      const clean = raw.replace(/```json|```/g, '').trim()
      const result = JSON.parse(clean)
      onUpdateRoom({
        aiAnalysis: result,
        estimatedArea: result.estimatedArea,
        areaConfidence: result.confidence,
      })
    } catch (err) {
      console.error('Analysis error:', err)
      onUpdateRoom({ aiAnalysis: { error: err.message } })
    } finally {
      setAnalysing(false)
    }
  }

  const saveManual = () => {
    const val = parseFloat(manualArea)
    if (!isNaN(val) && val > 0) {
      onUpdateRoom({ manualArea: val })
    }
    setEditingManual(false)
  }

  const clearManual = () => {
    setManualArea('')
    onUpdateRoom({ manualArea: null })
  }

  const displayArea = room.manualArea ?? room.estimatedArea
  const isManualOverride = room.manualArea != null

  return (
    <div className="space-y-4">
      {/* Photo upload */}
      <div>
        <label className="label">Room Photos</label>
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); addPhotos(e.dataTransfer.files) }}
          className="border-2 border-dashed border-stone-300 rounded-sm p-6 text-center cursor-pointer hover:border-timber-400 hover:bg-timber-50/30 transition-colors"
        >
          <Upload size={24} className="mx-auto text-stone-400 mb-2" />
          <p className="text-sm font-body text-stone-500">
            Drop photos here or <span className="text-timber-500 font-semibold">click to upload</span>
          </p>
          <p className="text-xs font-mono text-stone-400 mt-1">
            Multiple photos improve accuracy — include walls, corners, doors
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addPhotos(e.target.files)}
        />
      </div>

      {/* Photo thumbnails */}
      {room.photos?.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {room.photos.map((photo) => (
            <div key={photo.id} className="relative group aspect-video bg-stone-100 rounded-sm overflow-hidden">
              <img src={photo.dataUrl} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removePhoto(photo.id)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-sm p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Analyse button */}
      {room.photos?.length > 0 && (
        <button
          onClick={runAnalysis}
          disabled={analysing || loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {(analysing || loading) ? (
            <><Loader size={14} className="animate-spin" /> Analysing photo…</>
          ) : (
            <><Camera size={14} /> Run AI Area Estimation</>
          )}
        </button>
      )}

      {/* AI result */}
      {room.aiAnalysis && !room.aiAnalysis.error && (
        <div className="card p-4 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-stone-500 uppercase tracking-widest">AI Estimate</span>
            <span className={CONFIDENCE_STYLE[room.areaConfidence || 'low']}>
              {room.areaConfidence || 'low'} confidence
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Length', value: `${room.aiAnalysis.estimatedLength?.toFixed(2)}m` },
              { label: 'Width', value: `${room.aiAnalysis.estimatedWidth?.toFixed(2)}m` },
              { label: 'Area', value: `${room.aiAnalysis.estimatedArea?.toFixed(2)} m²` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-stone-50 rounded-sm p-2 text-center">
                <div className="text-xs font-mono text-stone-500">{label}</div>
                <div className="text-base font-mono font-semibold text-forest-700">{value}</div>
              </div>
            ))}
          </div>

          {room.aiAnalysis.confidenceReason && (
            <p className="text-xs font-body text-stone-500 flex items-start gap-1.5">
              <Info size={12} className="mt-0.5 flex-shrink-0 text-stone-400" />
              {room.aiAnalysis.confidenceReason}
            </p>
          )}

          {room.aiAnalysis.referenceObjects?.length > 0 && (
            <div>
              <p className="text-xs font-mono text-stone-400 mb-1">Reference objects used:</p>
              <div className="flex flex-wrap gap-1">
                {room.aiAnalysis.referenceObjects
                  .filter(o => o.usedForCalculation)
                  .map((o, i) => (
                    <span key={i} className="badge-stone">{o.object}</span>
                  ))}
              </div>
            </div>
          )}

          {room.aiAnalysis.manualMeasurementRecommended && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-sm p-2">
              <AlertTriangle size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-body text-amber-800">
                <strong>Manual measurement recommended:</strong> {room.aiAnalysis.manualMeasurementReason}
              </p>
            </div>
          )}
        </div>
      )}

      {room.aiAnalysis?.error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-sm p-3">
          <AlertTriangle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-red-700">Analysis failed</p>
            <p className="text-xs text-red-600 mt-0.5">{room.aiAnalysis.error}</p>
          </div>
        </div>
      )}

      {/* Manual area override */}
      <div className="border border-stone-200 rounded-sm p-3 space-y-2">
        <div className="flex items-center justify-between">
          <label className="label mb-0">Manual Area Override</label>
          {isManualOverride && (
            <span className="badge-amber flex items-center gap-1">
              <Edit3 size={10} /> Manual
            </span>
          )}
        </div>
        {editingManual ? (
          <div className="flex gap-2 items-center">
            <input
              className="input flex-1"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 15.5"
              value={manualArea}
              onChange={(e) => setManualArea(e.target.value)}
              autoFocus
            />
            <span className="text-sm font-mono text-stone-500">m²</span>
            <button onClick={saveManual} className="btn-primary py-2 px-3">Save</button>
            <button onClick={() => setEditingManual(false)} className="btn-ghost py-2 px-3">Cancel</button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono text-forest-700">
              {displayArea != null
                ? <><strong>{displayArea.toFixed(2)}</strong> m² {isManualOverride ? '(manual)' : '(AI)'}</>
                : <span className="text-stone-400">Not yet measured</span>
              }
            </span>
            <div className="flex gap-2">
              <button onClick={() => setEditingManual(true)} className="text-xs font-mono text-timber-500 hover:text-timber-600 underline">
                {displayArea != null ? 'Edit' : 'Enter manually'}
              </button>
              {isManualOverride && (
                <button onClick={clearManual} className="text-xs font-mono text-red-500 hover:text-red-600 underline">
                  Clear override
                </button>
              )}
            </div>
          </div>
        )}
        <p className="text-xs font-body text-stone-400">
          Manual measurements always override AI estimates for quoting.
        </p>
      </div>
    </div>
  )
}
