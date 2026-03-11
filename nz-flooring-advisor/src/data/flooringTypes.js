// Flooring product categories and types
// NOTE: Prices are placeholder ranges only — override with your own pricing data via Products page

export const FLOORING_CATEGORIES = {
  subfloor: {
    label: 'Subfloor / Base',
    description: 'The structural layer — must comply with NZS 3604',
    color: '#8B8B7A',
    types: [
      { id: 'ply_flooring', label: 'Structural Plywood', description: 'H3.1 treated, 17mm or 19mm', pricePlaceholder: '28–45 per m²' },
      { id: 'particle_board', label: 'Particle Board', description: '19mm or 22mm', pricePlaceholder: '18–28 per m²' },
      { id: 'concrete_slab', label: 'Concrete Slab', description: 'Existing — check moisture DPM', pricePlaceholder: 'Existing' },
      { id: 'levelling_compound', label: 'Self-Levelling Compound', description: 'For uneven subfloors', pricePlaceholder: '15–30 per m²' },
      { id: 'wet_area_membrane', label: 'Wet Area Membrane', description: 'Required under E3', pricePlaceholder: '20–40 per m²' },
    ]
  },
  underlay: {
    label: 'Underlay',
    description: 'Acoustic, thermal, and moisture protection layer',
    color: '#5a875f',
    types: [
      { id: 'standard_foam', label: 'Standard Foam Underlay', description: '8mm foam — basic', pricePlaceholder: '4–8 per m²' },
      { id: 'acoustic_underlay', label: 'Acoustic Underlay', description: 'STC/IIC rated for G6 compliance', pricePlaceholder: '12–22 per m²' },
      { id: 'cork_underlay', label: 'Cork Underlay', description: 'Natural, acoustic, thermal', pricePlaceholder: '10–18 per m²' },
      { id: 'dpm_underlay', label: 'DPM Underlay (Moisture Barrier)', description: 'Damp-proof — use over concrete', pricePlaceholder: '6–14 per m²' },
      { id: 'carpet_underlay', label: 'Carpet Underlay', description: 'Dense foam or rubber for carpet', pricePlaceholder: '8–16 per m²' },
      { id: 'no_underlay', label: 'No Underlay Required', description: 'Glue-down or tile direct-fix', pricePlaceholder: '0' },
    ]
  },
  surface: {
    label: 'Surface / Finish',
    description: 'The visible top layer',
    color: '#D4832A',
    types: [
      { id: 'lvp', label: 'LVP (Luxury Vinyl Plank)', description: 'Waterproof, durable — popular NZ choice', pricePlaceholder: '35–75 per m²' },
      { id: 'vinyl_sheet', label: 'Vinyl Sheet', description: 'Seamless wet area option', pricePlaceholder: '20–45 per m²' },
      { id: 'vinyl_tile', label: 'Vinyl Tile / SPC', description: 'Stone Plastic Composite', pricePlaceholder: '30–65 per m²' },
      { id: 'engineered_timber', label: 'Engineered Timber', description: 'Real timber veneer, more stable', pricePlaceholder: '65–150 per m²' },
      { id: 'solid_timber', label: 'Solid Timber', description: 'NZ native or imported hardwood', pricePlaceholder: '90–200 per m²' },
      { id: 'laminate', label: 'Laminate', description: 'AC3–AC5 wear rating', pricePlaceholder: '25–55 per m²' },
      { id: 'carpet', label: 'Carpet', description: 'Wool, nylon, or polypropylene blends', pricePlaceholder: '30–90 per m²' },
      { id: 'porcelain_tile', label: 'Porcelain Tile', description: 'Rectified for wet areas, durable', pricePlaceholder: '40–120 per m²' },
      { id: 'ceramic_tile', label: 'Ceramic Tile', description: 'Cost-effective tile option', pricePlaceholder: '25–60 per m²' },
      { id: 'bamboo', label: 'Bamboo Flooring', description: 'Eco option — not wet area', pricePlaceholder: '40–80 per m²' },
      { id: 'polished_concrete', label: 'Polished Concrete', description: 'Grind and seal existing slab', pricePlaceholder: '50–120 per m²' },
      { id: 'epoxy_coating', label: 'Epoxy Coating', description: 'Garage / utility floors', pricePlaceholder: '20–50 per m²' },
    ]
  }
}

// Underfloor heating compatibility
export const UFH_COMPATIBLE = ['lvp', 'vinyl_tile', 'porcelain_tile', 'ceramic_tile', 'polished_concrete', 'engineered_timber']

// Typical install difficulty for quoting
export const INSTALL_DIFFICULTY = {
  lvp: 'medium',
  vinyl_sheet: 'medium',
  vinyl_tile: 'medium',
  engineered_timber: 'medium',
  solid_timber: 'hard',
  laminate: 'easy',
  carpet: 'easy',
  porcelain_tile: 'hard',
  ceramic_tile: 'hard',
  bamboo: 'medium',
  polished_concrete: 'hard',
  epoxy_coating: 'medium',
}

// NZ suppliers (reference only — editable in products)
export const NZ_SUPPLIERS = [
  'Bunnings Warehouse',
  'Placemakers',
  'ITM',
  'Carpet Court',
  'Flooring Xtra',
  'Harvey Furnishings',
  'The Flooring Room',
  'Jacobsen Creative Surfaces',
  'Forbo Flooring',
  'Interface',
  'Cavalier Bremworth',
  'Godfrey Hirst',
  'Moduleo NZ',
  'Quick-Step NZ',
  'Independent / Trade Supply',
  'Other',
]
