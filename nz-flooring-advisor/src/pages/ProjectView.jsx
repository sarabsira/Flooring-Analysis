import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, MapPin, Camera, Layers, DollarSign, AlertTriangle, Home, ChevronDown, ChevronUp, FileText, Edit2, Check, X } from 'lucide-react'
import { useStore } from '../store/store'
import Modal from '../components/ui/Modal'
import AddressSearch from '../components/AddressSearch'
import RoomAnalyzer from '../components/RoomAnalyzer'
import SubfloorCheck from '../components/SubfloorCheck'
import FlooringSelector from '../components/FlooringSelector'
import QuoteBuilder from '../components/QuoteBuilder'
import { ROOM_REQUIREMENTS } from '../data/nzStandards'
import { downloadReport } from '../utils/pdfExport'

const TABS = [
  { id: 'area', label: 'Area', icon: Camera },
  { id: 'subfloor', label: 'Subfloor', icon: Home },
  { id: 'flooring', label: 'Flooring', icon: Layers },
]

const STATUS_OPTIONS = ['quoted', 'confirmed', 'in_progress', 'completed']

export default function ProjectView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProject, updateProject, addRoom, updateRoom, deleteRoom, settings } = useStore()

  const project = getProject(id)
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [roomForm, setRoomForm] = useState({ name: '', type: 'lounge' })
  const [activeRoom, setActiveRoom] = useState(null)
  const [activeTab, setActiveTab] = useState('area')
  const [activeSection, setActiveSection] = useState('rooms') // rooms | address | quotes
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState('')

  if (!project) return (
    <div className="px-6 py-8 text-center">
      <p className="text-stone-400 font-body">Project not found.</p>
      <button onClick={() => navigate('/')} className="btn-ghost mt-4">← Back to Dashboard</button>
    </div>
  )

  const handleUpdateRoom = (roomId, updates) => {
    updateRoom(id, roomId, updates)
  }

  const createRoom = () => {
    if (!roomForm.name.trim()) return
    addRoom(id, { ...roomForm })
    setShowAddRoom(false)
    setRoomForm({ name: '', type: 'lounge' })
  }

  const saveName = () => {
    if (nameVal.trim()) updateProject(id, { name: nameVal })
    setEditingName(false)
  }

  const totalArea = project.rooms.reduce((s, r) => s + (r.manualArea ?? r.estimatedArea ?? 0), 0)
  const latestQuote = project.quotes?.slice(-1)[0]

  const SECTION_ICONS = { rooms: Home, address: MapPin, quotes: DollarSign }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="bg-forest-700 text-cream px-6 py-4 flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-forest-300 hover:text-cream text-xs font-mono mb-2 transition-colors">
            <ArrowLeft size={12} /> Dashboard
          </button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    className="bg-forest-600 text-cream border border-forest-400 rounded-sm px-2 py-1 font-display text-xl font-semibold focus:outline-none focus:border-timber-400"
                    value={nameVal}
                    onChange={e => setNameVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveName()}
                    autoFocus
                  />
                  <button onClick={saveName} className="text-timber-300 hover:text-timber-200"><Check size={16} /></button>
                  <button onClick={() => setEditingName(false)} className="text-forest-400 hover:text-forest-200"><X size={16} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1 className="font-display text-2xl font-semibold">{project.name}</h1>
                  <button
                    onClick={() => { setNameVal(project.name); setEditingName(true) }}
                    className="opacity-0 group-hover:opacity-100 text-forest-400 hover:text-cream transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
              {project.address && (
                <div className="flex items-center gap-1.5 text-forest-300 text-xs font-body mt-0.5">
                  <MapPin size={11} /> {project.address.slice(0, 60)}{project.address.length > 60 ? '…' : ''}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 ml-4">
              {project.yearBuilt && project.yearBuilt < 1990 && (
                <div className="flex items-center gap-1 badge-red">
                  <AlertTriangle size={11} /> Pre-1990
                </div>
              )}
              <select
                value={project.status}
                onChange={e => updateProject(id, { status: e.target.value })}
                className="bg-forest-600 text-cream text-xs font-mono border border-forest-500 rounded-sm px-2 py-1.5 focus:outline-none focus:border-timber-400"
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
              </select>
              <button
                onClick={() => downloadReport(project, settings)}
                className="btn-ghost text-xs flex items-center gap-1.5 border-forest-500 text-forest-200 hover:bg-forest-600"
              >
                <FileText size={12} /> PDF
              </button>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-3 text-xs font-mono text-forest-300">
            <span>{project.rooms.length} room{project.rooms.length !== 1 ? 's' : ''}</span>
            <span>{totalArea.toFixed(2)} m² total</span>
            {latestQuote && <span className="text-timber-300">Quote: ${latestQuote.total?.toFixed(0)} incl. GST</span>}
            {project.yearBuilt && <span>Built {project.yearBuilt}</span>}
          </div>
        </div>
      </div>

      {/* Section nav */}
      <div className="bg-white border-b border-stone-200 flex-shrink-0">
        <div className="max-w-5xl mx-auto px-6 flex gap-0">
          {[['rooms', 'Rooms', Home], ['address', 'Address', MapPin], ['quotes', 'Quotes', DollarSign]].map(([sec, label, Icon]) => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-body border-b-2 transition-colors ${
                activeSection === sec
                  ? 'border-timber-400 text-timber-500 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-forest-700'
              }`}
            >
              <Icon size={14} />{label}
              {sec === 'rooms' && project.rooms.length > 0 && (
                <span className="text-xs font-mono bg-stone-100 text-stone-500 rounded-full w-5 h-5 flex items-center justify-center">
                  {project.rooms.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6">

          {/* ── ROOMS SECTION ─────────────────────────────────────── */}
          {activeSection === 'rooms' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="section-title">Rooms</h2>
                <button onClick={() => setShowAddRoom(true)} className="btn-primary flex items-center gap-2 text-sm">
                  <Plus size={13} /> Add Room
                </button>
              </div>

              {project.rooms.length === 0 && (
                <div className="text-center py-12 card">
                  <Home size={32} className="mx-auto text-stone-300 mb-2" />
                  <p className="font-body text-stone-400">No rooms yet. Add your first room to begin.</p>
                </div>
              )}

              {project.rooms.map(room => {
                const isActive = activeRoom === room.id
                const area = room.manualArea ?? room.estimatedArea
                const roomReqs = ROOM_REQUIREMENTS[room.type] || ROOM_REQUIREMENTS.other

                return (
                  <div key={room.id} className="card overflow-hidden">
                    {/* Room header */}
                    <div
                      className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-stone-50 transition-colors"
                      onClick={() => setActiveRoom(isActive ? null : room.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${area ? 'bg-forest-400' : 'bg-stone-300'}`} />
                        <div>
                          <span className="font-body font-semibold text-forest-800">{room.name}</span>
                          <span className="text-xs font-mono text-stone-400 ml-2">{roomReqs.label}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {roomReqs.wetArea && <span className="badge-amber">Wet</span>}
                        {room.manualArea && <span className="badge-stone">Manual</span>}
                        {area && (
                          <span className="font-mono text-sm font-semibold text-forest-700">
                            {area.toFixed(2)} m²
                          </span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); if (confirm(`Delete ${room.name}?`)) deleteRoom(id, room.id) }}
                          className="text-stone-300 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                        {isActive ? <ChevronUp size={14} className="text-stone-400" /> : <ChevronDown size={14} className="text-stone-400" />}
                      </div>
                    </div>

                    {/* Room detail */}
                    {isActive && (
                      <div className="border-t border-stone-100 animate-fadeIn">
                        {/* Sub-tabs */}
                        <div className="flex border-b border-stone-100 bg-stone-50">
                          {TABS.map(({ id: tabId, label, icon: Icon }) => (
                            <button
                              key={tabId}
                              onClick={() => setActiveTab(tabId)}
                              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-body border-b-2 transition-colors ${
                                activeTab === tabId
                                  ? 'border-timber-400 text-timber-500 font-semibold'
                                  : 'border-transparent text-stone-400 hover:text-forest-700'
                              }`}
                            >
                              <Icon size={12} />{label}
                            </button>
                          ))}
                        </div>

                        <div className="p-4">
                          {activeTab === 'area' && (
                            <RoomAnalyzer
                              room={room}
                              projectId={id}
                              onUpdateRoom={(updates) => handleUpdateRoom(room.id, updates)}
                            />
                          )}
                          {activeTab === 'subfloor' && (
                            <SubfloorCheck
                              room={room}
                              yearBuilt={project.yearBuilt}
                              onUpdateRoom={(updates) => handleUpdateRoom(room.id, updates)}
                            />
                          )}
                          {activeTab === 'flooring' && (
                            <FlooringSelector
                              room={room}
                              projectYearBuilt={project.yearBuilt}
                              onUpdateRoom={(updates) => handleUpdateRoom(room.id, updates)}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── ADDRESS SECTION ───────────────────────────────────── */}
          {activeSection === 'address' && (
            <div className="space-y-4">
              <h2 className="section-title">Address & Property</h2>
              <div className="card p-5">
                <AddressSearch
                  value={project.address}
                  coords={project.geoCoords}
                  onAddressChange={(addr) => updateProject(id, { address: addr })}
                  onCoordsChange={(coords) => updateProject(id, { geoCoords: coords })}
                />
              </div>
              <div className="card p-5 space-y-4">
                <h3 className="font-display text-forest-700 font-semibold text-base">Property Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Year Built</label>
                    <input
                      className="input"
                      type="number"
                      placeholder="e.g. 1985"
                      value={project.yearBuilt || ''}
                      onChange={e => updateProject(id, { yearBuilt: e.target.value ? parseInt(e.target.value) : null })}
                    />
                    {project.yearBuilt && project.yearBuilt < 1990 && (
                      <p className="text-xs text-red-600 mt-1 font-body">⚠ Pre-1990 — asbestos risk. See Subfloor tab for each room.</p>
                    )}
                  </div>
                  <div>
                    <label className="label">Building Type</label>
                    <select
                      className="input"
                      value={project.buildingType || ''}
                      onChange={e => updateProject(id, { buildingType: e.target.value })}
                    >
                      <option value="">— Select —</option>
                      <option value="standalone">Standalone house</option>
                      <option value="unit">Unit / Townhouse</option>
                      <option value="apartment">Apartment</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Number of Levels</label>
                    <input
                      className="input"
                      type="number" min="1" max="20"
                      value={project.levels || ''}
                      onChange={e => updateProject(id, { levels: parseInt(e.target.value) || null })}
                    />
                    {project.levels > 1 && (
                      <p className="text-xs text-amber-600 mt-1 font-body">Multi-storey — G6 acoustic compliance applies.</p>
                    )}
                  </div>
                  <div>
                    <label className="label">Floor Plan Available</label>
                    <select
                      className="input"
                      value={project.floorPlanStatus || ''}
                      onChange={e => updateProject(id, { floorPlanStatus: e.target.value })}
                    >
                      <option value="">— Unknown —</option>
                      <option value="found_online">Found online (reference only)</option>
                      <option value="council_supplied">Council / consent supplied</option>
                      <option value="manual_entry">Manual measurements only</option>
                      <option value="not_available">Not available</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Floor Plan URL (if found)</label>
                  <input
                    className="input"
                    type="url"
                    placeholder="https://..."
                    value={project.floorPlanUrl || ''}
                    onChange={e => updateProject(id, { floorPlanUrl: e.target.value })}
                  />
                  <p className="text-xs text-stone-400 mt-1 font-body">
                    Floor plans found online are for reference only. Always verify with on-site measurements.
                  </p>
                </div>
                <div>
                  <label className="label">Project Notes</label>
                  <textarea
                    className="input min-h-[80px] resize-y"
                    placeholder="Site access, parking, special conditions, scope of work…"
                    value={project.notes || ''}
                    onChange={e => updateProject(id, { notes: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── QUOTES SECTION ────────────────────────────────────── */}
          {activeSection === 'quotes' && (
            <div className="space-y-4">
              <h2 className="section-title">Quotes</h2>
              {project.rooms.some(r => !(r.manualArea ?? r.estimatedArea)) && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-sm p-3">
                  <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-body text-amber-800">
                    Some rooms are missing area measurements. Quotes will show $0 for those rooms. Measure or enter areas first.
                  </p>
                </div>
              )}
              <QuoteBuilder project={project} />
            </div>
          )}
        </div>
      </div>

      {/* Add room modal */}
      <Modal open={showAddRoom} onClose={() => setShowAddRoom(false)} title="Add Room">
        <div className="space-y-4">
          <div>
            <label className="label">Room Name *</label>
            <input
              className="input"
              placeholder="e.g. Main Bedroom, Open Plan Living"
              value={roomForm.name}
              onChange={e => setRoomForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && createRoom()}
              autoFocus
            />
          </div>
          <div>
            <label className="label">Room Type</label>
            <select
              className="input"
              value={roomForm.type}
              onChange={e => setRoomForm(f => ({ ...f, type: e.target.value }))}
            >
              {Object.entries(ROOM_REQUIREMENTS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={createRoom} disabled={!roomForm.name.trim()} className="btn-primary flex-1">Add Room</button>
            <button onClick={() => setShowAddRoom(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
