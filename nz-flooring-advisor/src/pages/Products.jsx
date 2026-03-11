import { useState } from 'react'
import { Plus, Trash2, Edit2, Package, AlertCircle, Search, Filter } from 'lucide-react'
import { useStore } from '../store/store'
import Modal from '../components/ui/Modal'
import { FLOORING_CATEGORIES, NZ_SUPPLIERS } from '../data/flooringTypes'

const EMPTY = {
  name: '', brand: '', category: 'surface', type: '',
  pricePerM2: '', unit: 'm2', supplier: '',
  productCode: '', specSheetUrl: '',
  suitable: { wetArea: false, underfloorHeating: false, acoustic: false },
  compliance: [], notes: ''
}

const COMPLIANCE_OPTIONS = ['E3', 'G6', 'NZS 3604', 'H1']

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setSuitable = (k, v) => setForm(f => ({ ...f, suitable: { ...f.suitable, [k]: v } }))
  const toggleCompliance = (c) => setForm(f => ({
    ...f,
    compliance: f.compliance.includes(c) ? f.compliance.filter(x => x !== c) : [...f.compliance, c]
  }))

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowModal(true) }
  const openEdit = (p) => { setEditing(p.id); setForm({ ...p, pricePerM2: p.pricePerM2?.toString() || '' }); setShowModal(true) }

  const save = () => {
    const data = { ...form, pricePerM2: parseFloat(form.pricePerM2) || 0 }
    if (!data.name.trim()) return
    if (editing) {
      updateProduct(editing, data)
    } else {
      addProduct(data)
    }
    setShowModal(false)
  }

  const isStale = (p) => p.lastUpdated && (Date.now() - new Date(p.lastUpdated).getTime()) > 90 * 24 * 60 * 60 * 1000

  const filtered = products
    .filter(p => filterCat === 'all' || p.category === filterCat)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-forest-700 font-semibold">Products</h1>
          <p className="text-stone-500 font-body text-sm mt-1">
            {products.length} product{products.length !== 1 ? 's' : ''} in database
          </p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus size={14} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            className="input pl-9 w-56"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1">
          {['all', ...Object.keys(FLOORING_CATEGORIES)].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-2 text-xs font-mono rounded-sm border transition-colors ${
                filterCat === cat
                  ? 'bg-forest-700 text-cream border-forest-700'
                  : 'border-stone-300 text-stone-500 hover:border-stone-400 bg-white'
              }`}
            >
              {cat === 'all' ? 'All' : FLOORING_CATEGORIES[cat]?.label}
            </button>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 card">
          <Package size={36} className="mx-auto text-stone-300 mb-3" />
          <p className="font-display text-stone-400 text-xl">No products yet</p>
          <p className="text-sm font-body text-stone-400 mt-1">Add your first product to enable pricing in quotes</p>
          <button onClick={openNew} className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus size={14} /> Add Product
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.keys(FLOORING_CATEGORIES).map(cat => {
            const catProducts = filtered.filter(p => p.category === cat)
            if (!catProducts.length) return null
            const catConfig = FLOORING_CATEGORIES[cat]
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-semibold uppercase tracking-widest" style={{ color: catConfig.color }}>
                    {catConfig.label}
                  </span>
                  <span className="text-xs font-mono text-stone-400">{catProducts.length}</span>
                </div>
                <div className="card divide-y divide-stone-100 overflow-hidden">
                  {catProducts.map(p => (
                    <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-stone-50 group transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-body font-semibold text-forest-800 text-sm">{p.name}</span>
                          {p.brand && <span className="text-xs font-mono text-stone-400">{p.brand}</span>}
                          {p.suitable?.wetArea && <span className="badge-green">Wet Area</span>}
                          {p.suitable?.acoustic && <span className="badge-stone">Acoustic</span>}
                          {p.suitable?.underfloorHeating && <span className="badge-stone">UFH</span>}
                          {isStale(p) && (
                            <span className="badge-amber flex items-center gap-1">
                              <AlertCircle size={10} /> Price outdated
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs font-body text-stone-400">
                          {p.supplier && <span>{p.supplier}</span>}
                          {p.productCode && <span className="font-mono">{p.productCode}</span>}
                          {p.compliance?.length > 0 && <span>{p.compliance.join(', ')}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                        <div className="text-right">
                          <div className="font-mono font-semibold text-forest-700">
                            ${p.pricePerM2?.toFixed(2)}/m²
                          </div>
                          <div className="text-xs font-mono text-stone-400">
                            {p.lastUpdated ? new Date(p.lastUpdated).toLocaleDateString('en-NZ') : 'No date'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(p)} className="text-stone-400 hover:text-forest-600 p-1 transition-colors">
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => { if (confirm(`Delete ${p.name}?`)) deleteProduct(p.id) }}
                            className="text-stone-400 hover:text-red-500 p-1 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Product modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Product' : 'Add Product'} wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Product Name *</label>
              <input className="input" placeholder="e.g. Moduleo LayRed 55 Click" value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
            </div>
            <div>
              <label className="label">Brand</label>
              <input className="input" placeholder="e.g. Moduleo" value={form.brand} onChange={e => set('brand', e.target.value)} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                {Object.entries(FLOORING_CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Price per m² (NZD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-mono">$</span>
                <input className="input pl-7 font-mono" type="number" step="0.01" min="0" placeholder="0.00" value={form.pricePerM2} onChange={e => set('pricePerM2', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Supplier</label>
              <select className="input" value={form.supplier} onChange={e => set('supplier', e.target.value)}>
                <option value="">— Select —</option>
                {NZ_SUPPLIERS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Product Code</label>
              <input className="input font-mono" placeholder="e.g. MOD-55-001" value={form.productCode} onChange={e => set('productCode', e.target.value)} />
            </div>
            <div>
              <label className="label">Spec Sheet URL</label>
              <input className="input" type="url" placeholder="https://…" value={form.specSheetUrl} onChange={e => set('specSheetUrl', e.target.value)} />
            </div>
          </div>

          {/* Suitability */}
          <div>
            <label className="label">Suitability</label>
            <div className="flex flex-wrap gap-3">
              {[['wetArea', 'Wet Area (E3)'], ['underfloorHeating', 'Underfloor Heating'], ['acoustic', 'Acoustic Rated']].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm font-body cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-forest-500"
                    checked={form.suitable[key] || false}
                    onChange={e => setSuitable(key, e.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Compliance */}
          <div>
            <label className="label">NZ Compliance Tags</label>
            <div className="flex flex-wrap gap-2">
              {COMPLIANCE_OPTIONS.map(c => (
                <button
                  key={c}
                  onClick={() => toggleCompliance(c)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-sm border transition-colors ${
                    form.compliance?.includes(c)
                      ? 'bg-forest-700 text-cream border-forest-700'
                      : 'border-stone-300 text-stone-500 hover:border-stone-400 bg-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input min-h-[60px] resize-y" placeholder="Install notes, limitations, warranty…" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={!form.name.trim()} className="btn-primary flex-1">
              {editing ? 'Save Changes' : 'Add Product'}
            </button>
            <button onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
