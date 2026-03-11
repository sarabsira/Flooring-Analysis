import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MapPin, Home, FileText, CheckCircle, Clock, Hammer, Archive, Trash2 } from 'lucide-react'
import { useStore } from '../store/store'
import Modal from '../components/ui/Modal'
import { NZ_REGIONS } from '../data/nzStandards'

const STATUS_CONFIG = {
  quoted: { label: 'Quoted', color: 'badge-stone', icon: FileText },
  confirmed: { label: 'Confirmed', color: 'badge-amber', icon: CheckCircle },
  in_progress: { label: 'In Progress', color: 'badge-amber', icon: Hammer },
  completed: { label: 'Completed', color: 'badge-green', icon: CheckCircle },
}

export default function Dashboard() {
  const { projects, addProject, deleteProject, updateProject } = useStore()
  const navigate = useNavigate()
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ name: '', address: '', yearBuilt: '', region: '', notes: '' })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const create = () => {
    if (!form.name.trim()) return
    const id = crypto.randomUUID()
    addProject({
      id, ...form,
      yearBuilt: form.yearBuilt ? parseInt(form.yearBuilt) : null,
      rooms: [], quotes: [], status: 'quoted', createdAt: new Date().toISOString()
    })
    setShowNew(false)
    setForm({ name: '', address: '', yearBuilt: '', region: '', notes: '' })
    navigate(`/project/${id}`)
  }

  const statusGroups = {
    in_progress: projects.filter(p => p.status === 'in_progress'),
    confirmed: projects.filter(p => p.status === 'confirmed'),
    quoted: projects.filter(p => p.status === 'quoted'),
    completed: projects.filter(p => p.status === 'completed'),
  }

  const totalArea = projects.flatMap(p => p.rooms || [])
    .reduce((s, r) => s + (r.manualArea ?? r.estimatedArea ?? 0), 0)

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-forest-700 font-semibold">Projects</h1>
          <p className="text-stone-500 font-body text-sm mt-1">
            {projects.length} job{projects.length !== 1 ? 's' : ''} · {totalArea.toFixed(0)} m² total
          </p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {Object.entries(STATUS_CONFIG).map(([key, { label, icon: Icon }]) => (
          <div key={key} className="card px-4 py-3">
            <div className="flex items-center gap-2 text-stone-400 mb-1">
              <Icon size={13} />
              <span className="text-xs font-mono uppercase tracking-wide">{label}</span>
            </div>
            <div className="text-2xl font-mono font-semibold text-forest-700">
              {statusGroups[key]?.length || 0}
            </div>
          </div>
        ))}
      </div>

      {/* Project list */}
      {projects.length === 0 ? (
        <div className="text-center py-20">
          <Home size={40} className="mx-auto text-stone-300 mb-3" />
          <p className="font-display text-stone-400 text-xl">No projects yet</p>
          <p className="text-sm font-body text-stone-400 mt-1">Create your first job to get started</p>
          <button onClick={() => setShowNew(true)} className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus size={14} /> New Project
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(statusGroups).map(([status, group]) => {
            if (!group.length) return null
            const { label, color } = STATUS_CONFIG[status]
            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={color}>{label}</span>
                  <span className="text-xs font-mono text-stone-400">{group.length}</span>
                </div>
                <div className="space-y-2">
                  {group.map(project => {
                    const roomCount = project.rooms?.length || 0
                    const totalM2 = (project.rooms || []).reduce((s, r) => s + (r.manualArea ?? r.estimatedArea ?? 0), 0)
                    const latestQuote = project.quotes?.slice(-1)[0]
                    return (
                      <div
                        key={project.id}
                        onClick={() => navigate(`/project/${project.id}`)}
                        className="card px-4 py-4 cursor-pointer hover:border-timber-300 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h2 className="font-body font-semibold text-forest-800 group-hover:text-timber-500 transition-colors">
                                {project.name}
                              </h2>
                              {project.yearBuilt && project.yearBuilt < 1990 && (
                                <span className="badge-red">Pre-1990</span>
                              )}
                            </div>
                            {project.address && (
                              <div className="flex items-center gap-1.5 text-xs font-body text-stone-400 mt-1">
                                <MapPin size={11} className="flex-shrink-0" />
                                <span className="truncate">{project.address}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                            <div className="text-right">
                              <div className="text-xs font-mono text-stone-400">{roomCount} room{roomCount !== 1 ? 's' : ''}</div>
                              <div className="text-sm font-mono font-semibold text-forest-700">{totalM2.toFixed(1)} m²</div>
                            </div>
                            {latestQuote && (
                              <div className="text-right">
                                <div className="text-xs font-mono text-stone-400">Latest quote</div>
                                <div className="text-sm font-mono font-semibold text-timber-500">
                                  ${latestQuote.total?.toFixed(0)}
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.stopPropagation(); if (confirm('Delete project?')) deleteProject(project.id) }}
                                className="text-stone-300 hover:text-red-500 p-1 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* New project modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Project">
        <div className="space-y-4">
          <div>
            <label className="label">Project / Job Name *</label>
            <input className="input" placeholder="e.g. Smith Residence — Full Reno" value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
          </div>
          <div>
            <label className="label">Address</label>
            <input className="input" placeholder="Street address, suburb, city" value={form.address} onChange={e => set('address', e.target.value)} />
            <p className="text-xs font-body text-stone-400 mt-1">You can search and geo-tag after creating the project</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Year Built</label>
              <input className="input" type="number" placeholder="e.g. 1985" min="1800" max={new Date().getFullYear()} value={form.yearBuilt} onChange={e => set('yearBuilt', e.target.value)} />
            </div>
            <div>
              <label className="label">Region</label>
              <select className="input" value={form.region} onChange={e => set('region', e.target.value)}>
                <option value="">— Select —</option>
                {NZ_REGIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input min-h-[60px] resize-y" placeholder="Initial observations, access notes, scope…" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={create} disabled={!form.name.trim()} className="btn-primary flex-1">Create Project</button>
            <button onClick={() => setShowNew(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
