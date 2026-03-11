import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const defaultSettings = {
  companyName: '',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  companyLogo: null,
  defaultWastagePct: 10,
  defaultMarginPct: 0,
  gstRate: 0.15,
  labourRates: {
    standard: 25,
    wetArea: 35,
    carpet: 18,
    tile: 40,
    stairs: 55,
  }
}

export const useStore = create(
  persist(
    (set, get) => ({
      projects: [],
      products: [],
      settings: defaultSettings,

      // ── Projects ──────────────────────────────────────────────────────────
      addProject: (project) => set((s) => ({
        projects: [...s.projects, { ...project, id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'quoted', rooms: [], quotes: [] }]
      })),

      updateProject: (id, updates) => set((s) => ({
        projects: s.projects.map((p) => p.id === id ? { ...p, ...updates } : p)
      })),

      deleteProject: (id) => set((s) => ({
        projects: s.projects.filter((p) => p.id !== id)
      })),

      getProject: (id) => get().projects.find((p) => p.id === id),

      // ── Rooms ─────────────────────────────────────────────────────────────
      addRoom: (projectId, room) => set((s) => ({
        projects: s.projects.map((p) =>
          p.id === projectId
            ? { ...p, rooms: [...p.rooms, { ...room, id: crypto.randomUUID(), photos: [], subfloorPhotos: [], flooringLayers: { subfloor: null, underlay: null, surface: null }, notes: '' }] }
            : p
        )
      })),

      updateRoom: (projectId, roomId, updates) => set((s) => ({
        projects: s.projects.map((p) =>
          p.id === projectId
            ? { ...p, rooms: p.rooms.map((r) => r.id === roomId ? { ...r, ...updates } : r) }
            : p
        )
      })),

      deleteRoom: (projectId, roomId) => set((s) => ({
        projects: s.projects.map((p) =>
          p.id === projectId ? { ...p, rooms: p.rooms.filter((r) => r.id !== roomId) } : p
        )
      })),

      // ── Quotes ────────────────────────────────────────────────────────────
      addQuote: (projectId, quote) => set((s) => {
        const project = s.projects.find((p) => p.id === projectId)
        const version = (project?.quotes?.length || 0) + 1
        return {
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, quotes: [...(p.quotes || []), { ...quote, id: crypto.randomUUID(), version, date: new Date().toISOString() }] }
              : p
          )
        }
      }),

      updateQuote: (projectId, quoteId, updates) => set((s) => ({
        projects: s.projects.map((p) =>
          p.id === projectId
            ? { ...p, quotes: p.quotes.map((q) => q.id === quoteId ? { ...q, ...updates } : q) }
            : p
        )
      })),

      deleteQuote: (projectId, quoteId) => set((s) => ({
        projects: s.projects.map((p) =>
          p.id === projectId ? { ...p, quotes: p.quotes.filter((q) => q.id !== quoteId) } : p
        )
      })),

      // ── Products ──────────────────────────────────────────────────────────
      addProduct: (product) => set((s) => ({
        products: [...s.products, { ...product, id: crypto.randomUUID(), lastUpdated: new Date().toISOString() }]
      })),

      updateProduct: (id, updates) => set((s) => ({
        products: s.products.map((p) => p.id === id ? { ...p, ...updates, lastUpdated: new Date().toISOString() } : p)
      })),

      deleteProduct: (id) => set((s) => ({
        products: s.products.filter((p) => p.id !== id)
      })),

      // ── Settings ──────────────────────────────────────────────────────────
      updateSettings: (updates) => set((s) => ({
        settings: { ...s.settings, ...updates }
      })),

      updateLabourRate: (key, value) => set((s) => ({
        settings: { ...s.settings, labourRates: { ...s.settings.labourRates, [key]: value } }
      })),
    }),
    {
      name: 'nz-flooring-store',
      version: 1,
    }
  )
)
