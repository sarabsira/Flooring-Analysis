import { useState } from 'react'
import { MapPin, Search, Navigation, ExternalLink, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { geocodeAddress, getCurrentPosition, reverseGeocode, getFloorPlanSearchUrls } from '../utils/geocode'

export default function AddressSearch({ value, coords, onAddressChange, onCoordsChange }) {
  const [query, setQuery] = useState(value || '')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showFloorPlanLinks, setShowFloorPlanLinks] = useState(false)
  const [manualMode, setManualMode] = useState(false)
  const [manualAddress, setManualAddress] = useState(value || '')

  const searchAddress = async () => {
    if (!query.trim()) return
    setSearching(true)
    setError(null)
    try {
      const res = await geocodeAddress(query)
      if (res.length === 0) {
        setError('No results found. Try a more specific address or enter manually.')
        setResults([])
      } else {
        setResults(res)
      }
    } catch {
      setError('Address search unavailable. Enter manually below.')
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  const selectResult = (r) => {
    onAddressChange(r.displayName)
    onCoordsChange({ lat: r.lat, lng: r.lng })
    setQuery(r.displayName)
    setResults([])
    setShowFloorPlanLinks(true)
  }

  const useGPS = async () => {
    setGpsLoading(true)
    setError(null)
    try {
      const pos = await getCurrentPosition()
      const rev = await reverseGeocode(pos.lat, pos.lng)
      if (rev) {
        onAddressChange(rev.displayName)
        onCoordsChange({ lat: pos.lat, lng: pos.lng })
        setQuery(rev.displayName)
        setShowFloorPlanLinks(true)
      }
    } catch (err) {
      setError(`GPS unavailable: ${err.message}. Please enter address manually.`)
    } finally {
      setGpsLoading(false)
    }
  }

  const saveManual = () => {
    if (!manualAddress.trim()) return
    onAddressChange(manualAddress)
    setQuery(manualAddress)
    setShowFloorPlanLinks(true)
  }

  const floorPlanLinks = getFloorPlanSearchUrls(value || query)

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div>
        <label className="label">Property Address</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              className="input pr-10"
              placeholder="e.g. 12 Pohutukawa Drive, Tauranga"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchAddress()}
            />
            {value && <CheckCircle size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-500" />}
          </div>
          <button
            onClick={searchAddress}
            disabled={searching}
            className="btn-secondary flex items-center gap-2 flex-shrink-0"
          >
            {searching ? <Loader size={14} className="animate-spin" /> : <Search size={14} />}
            Search
          </button>
          <button
            onClick={useGPS}
            disabled={gpsLoading}
            title="Use my current location"
            className="btn-ghost flex items-center gap-2 flex-shrink-0"
          >
            {gpsLoading ? <Loader size={14} className="animate-spin" /> : <Navigation size={14} />}
            GPS
          </button>
        </div>
      </div>

      {/* Search results */}
      {results.length > 0 && (
        <div className="border border-stone-200 rounded-sm bg-white shadow-md overflow-hidden">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => selectResult(r)}
              className="w-full text-left px-4 py-3 text-sm hover:bg-forest-50 border-b border-stone-100 last:border-0 flex items-start gap-2 transition-colors"
            >
              <MapPin size={14} className="text-timber-400 mt-0.5 flex-shrink-0" />
              <span className="font-body text-forest-800">{r.displayName}</span>
            </button>
          ))}
        </div>
      )}

      {/* Error / manual fallback */}
      {error && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-sm p-3">
          <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs font-body text-amber-800">
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Manual address entry fallback */}
      <div>
        <button
          onClick={() => setManualMode(!manualMode)}
          className="text-xs font-mono text-timber-500 hover:text-timber-600 underline"
        >
          {manualMode ? '▲ Hide manual entry' : '▼ Enter address manually'}
        </button>
        {manualMode && (
          <div className="mt-2 flex gap-2">
            <input
              className="input flex-1"
              placeholder="Full street address, suburb, city"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
            />
            <button onClick={saveManual} className="btn-primary flex-shrink-0">Save</button>
          </div>
        )}
      </div>

      {/* Confirmed address + coords */}
      {value && coords && (
        <div className="bg-forest-50 border border-forest-200 rounded-sm p-3 text-xs font-mono space-y-1">
          <div className="flex items-center gap-1.5 text-forest-600">
            <MapPin size={12} />
            <span className="font-semibold">Confirmed:</span>
            <span className="text-forest-700">{value}</span>
          </div>
          <div className="text-stone-500 pl-4">
            Lat: {coords.lat.toFixed(5)} · Lng: {coords.lng.toFixed(5)}
          </div>
        </div>
      )}

      {/* Floor plan links */}
      {showFloorPlanLinks && value && (
        <div className="border border-stone-200 rounded-sm overflow-hidden">
          <button
            onClick={() => setShowFloorPlanLinks(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-stone-50 text-sm font-body font-semibold text-forest-700 hover:bg-stone-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Search size={14} className="text-timber-400" />
              Search for Floor Plans & Listing History
            </span>
            <span className="text-xs font-mono text-stone-400">manual lookup</span>
          </button>
          <div className="divide-y divide-stone-100">
            {floorPlanLinks.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between px-4 py-3 hover:bg-stone-50 transition-colors group"
              >
                <div>
                  <div className="text-sm font-body font-medium text-forest-700 group-hover:text-timber-500 transition-colors">
                    {link.label}
                  </div>
                  <div className="text-xs font-body text-stone-400 mt-0.5">{link.note}</div>
                </div>
                <ExternalLink size={13} className="text-stone-400 mt-1 flex-shrink-0" />
              </a>
            ))}
          </div>
          <div className="px-4 py-2 bg-amber-50 border-t border-amber-100">
            <p className="text-xs font-body text-amber-700">
              <strong>Note:</strong> Floor plan availability varies. If found, treat as reference only and verify against your measurements. 
              Auto-import is not available — data must be entered manually.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
