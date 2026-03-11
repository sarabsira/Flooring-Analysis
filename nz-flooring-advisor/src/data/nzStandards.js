// NZ Standard reference object sizes used for AI photo analysis
export const NZ_REFERENCE_OBJECTS = {
  door: { height: 2040, width: 810, unit: 'mm', label: 'Standard door' },
  door_wide: { height: 2040, width: 910, unit: 'mm', label: 'Wide door' },
  powerpoint: { width: 115, height: 70, unit: 'mm', label: 'Power outlet' },
  lightswitch: { width: 85, height: 85, unit: 'mm', label: 'Light switch' },
  brick: { length: 230, height: 76, unit: 'mm', label: 'NZ standard brick' },
  skirting: { height: 90, unit: 'mm', label: 'Standard skirting board' },
  ceiling_height: { value: 2400, unit: 'mm', label: 'Standard ceiling height' },
  ceiling_high: { value: 2700, unit: 'mm', label: 'High ceiling' },
  a4_paper: { width: 210, height: 297, unit: 'mm', label: 'A4 paper' },
  kitchen_bench: { height: 900, depth: 600, unit: 'mm', label: 'Kitchen bench' },
  toilet: { length: 700, width: 380, unit: 'mm', label: 'Standard toilet' },
  bath: { length: 1700, width: 750, unit: 'mm', label: 'Standard bath' },
}

// NZ Building Code compliance requirements
export const NZ_COMPLIANCE = {
  E3: {
    code: 'E3',
    title: 'Internal Moisture',
    description: 'Wet area floors must be waterproofed. Grout lines not sufficient — membrane required.',
    affectedRooms: ['bathroom', 'laundry', 'kitchen'],
    requiredFor: ['tile', 'vinyl_sheet'],
  },
  G6: {
    code: 'G6',
    title: 'Airborne & Impact Sound',
    description: 'Acoustic underlay required for multi-storey buildings. STC/IIC ratings apply.',
    affectedRooms: ['all'],
    requiredFor: ['hard_surface'],
  },
  NZS3604: {
    code: 'NZS 3604',
    title: 'Timber-Framed Buildings',
    description: 'Subfloor timber must be appropriately treated. H1.2 minimum for interior, H3.1+ for subfloor.',
    affectedRooms: ['all'],
    requiredFor: ['subfloor'],
  },
  H1: {
    code: 'H1',
    title: 'Energy Efficiency',
    description: 'Underfloor insulation R-values: R1.3 min (North Island), R1.8 min (South Island, above 600m).',
    affectedRooms: ['all'],
    requiredFor: ['insulation'],
  },
}

// Flooring suitability by room type
export const ROOM_REQUIREMENTS = {
  bathroom: {
    label: 'Bathroom / Ensuite',
    wetArea: true,
    compliance: ['E3'],
    recommended: ['porcelain_tile', 'ceramic_tile', 'lvp', 'vinyl_sheet'],
    notRecommended: ['solid_timber', 'bamboo', 'carpet'],
    subfloorNote: 'Wet area membrane required. Check joist spacing for tile weight loading.',
  },
  kitchen: {
    label: 'Kitchen',
    wetArea: true,
    compliance: ['E3'],
    recommended: ['porcelain_tile', 'lvp', 'vinyl_sheet', 'engineered_timber'],
    notRecommended: ['carpet', 'solid_timber'],
    subfloorNote: 'Splashback and sink areas require waterproofing under E3.',
  },
  lounge: {
    label: 'Lounge / Living',
    wetArea: false,
    compliance: ['G6'],
    recommended: ['engineered_timber', 'solid_timber', 'lvp', 'carpet', 'laminate'],
    notRecommended: [],
    subfloorNote: 'Check for bounce or movement. Level to within 3mm over 1.8m.',
  },
  bedroom: {
    label: 'Bedroom',
    wetArea: false,
    compliance: ['G6'],
    recommended: ['carpet', 'engineered_timber', 'lvp', 'laminate'],
    notRecommended: [],
    subfloorNote: 'Standard requirements. Acoustic underlay recommended for upper floors.',
  },
  laundry: {
    label: 'Laundry',
    wetArea: true,
    compliance: ['E3'],
    recommended: ['porcelain_tile', 'vinyl_sheet', 'lvp'],
    notRecommended: ['carpet', 'timber'],
    subfloorNote: 'Full wet area treatment required. Consider drain placement.',
  },
  hallway: {
    label: 'Hallway / Entry',
    wetArea: false,
    compliance: [],
    recommended: ['lvp', 'porcelain_tile', 'engineered_timber', 'vinyl_sheet'],
    notRecommended: [],
    subfloorNote: 'High traffic — select wear layer 0.5mm+ for LVP/vinyl products.',
  },
  dining: {
    label: 'Dining',
    wetArea: false,
    compliance: ['G6'],
    recommended: ['engineered_timber', 'lvp', 'porcelain_tile', 'laminate'],
    notRecommended: [],
    subfloorNote: 'Chair leg damage risk — avoid very soft surface products.',
  },
  garage: {
    label: 'Garage / Utility',
    wetArea: false,
    compliance: [],
    recommended: ['concrete_sealer', 'epoxy', 'vinyl_sheet'],
    notRecommended: ['carpet', 'timber'],
    subfloorNote: 'Concrete slab typical. Check moisture barrier before any floating floor.',
  },
  other: {
    label: 'Other',
    wetArea: false,
    compliance: [],
    recommended: [],
    notRecommended: [],
    subfloorNote: '',
  },
}

// Pre-1990 asbestos warning — mandatory
export const ASBESTOS_THRESHOLD_YEAR = 1990

export const ASBESTOS_WARNING = `⚠️ ASBESTOS RISK: This property was likely built before 1990. Many NZ homes of this era contain asbestos-containing materials (ACMs) in floor underlays, adhesives, vinyl tiles, and backing materials. DO NOT disturb any existing flooring materials before a qualified asbestos assessor has inspected and cleared the work area. This is a legal requirement under the Health and Safety at Work (Asbestos) Regulations 2016.`

// NZ regions for labour rate guidance
export const NZ_REGIONS = [
  'Auckland', 'Wellington', 'Canterbury', 'Waikato', 'Bay of Plenty',
  'Manawatū-Whanganui', 'Otago', 'Hawke\'s Bay', 'Taranaki', 'Northland',
  'Marlborough', 'Southland', 'Nelson-Tasman', 'West Coast', 'Gisborne'
]

// Council GIS portal availability (best-effort)
export const COUNCIL_GIS_PORTALS = {
  'Auckland': { available: true, url: 'https://geomapspublic.aucklandcouncil.govt.nz/', note: 'Auckland GeoMaps — good coverage' },
  'Wellington': { available: true, url: 'https://wellington.govt.nz/maps', note: 'WCC GIS — moderate coverage' },
  'Canterbury': { available: true, url: 'https://maps.ccc.govt.nz/', note: 'CCC Maps — moderate coverage' },
  'default': { available: false, url: null, note: 'Council GIS portal not indexed — check your local council website manually' }
}
