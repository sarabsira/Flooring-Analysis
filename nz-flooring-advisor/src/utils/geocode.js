// Free geocoding via OpenStreetMap Nominatim — no API key required
// Rate limit: max 1 request/second — do not call in tight loops

const NOMINATIM = 'https://nominatim.openstreetmap.org'
const LINZ_ADDR = 'https://api.linz.govt.nz/v1/search?q='

export async function geocodeAddress(address) {
  try {
    const query = encodeURIComponent(`${address}, New Zealand`)
    const res = await fetch(
      `${NOMINATIM}/search?q=${query}&format=json&limit=5&countrycodes=nz&addressdetails=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'NZFlooringAdvisor/1.0' } }
    )
    if (!res.ok) throw new Error('Geocode request failed')
    const data = await res.json()
    return data.map(r => ({
      displayName: r.display_name,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      type: r.type,
      addressDetails: r.address,
      raw: r
    }))
  } catch (err) {
    console.error('Geocode error:', err)
    return []
  }
}

export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `${NOMINATIM}/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'NZFlooringAdvisor/1.0' } }
    )
    const data = await res.json()
    return {
      displayName: data.display_name,
      addressDetails: data.address,
      lat, lng
    }
  } catch (err) {
    console.error('Reverse geocode error:', err)
    return null
  }
}

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by this browser'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      (err) => reject(new Error(err.message)),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    )
  })
}

// Search for floor plans / listing data via free web search (no scraping — returns search URLs)
// Users can follow links to check sites manually if auto-data isn't available
export function getFloorPlanSearchUrls(address) {
  const q = encodeURIComponent(address)
  return [
    { label: 'Trade Me Property', url: `https://www.trademe.co.nz/a/property/search?search_string=${q}`, note: 'May have listing photos/floor plans' },
    { label: 'OneRoof', url: `https://www.oneroof.co.nz/search?q=${q}`, note: 'Historical listings sometimes have floor plans' },
    { label: 'realestate.co.nz', url: `https://www.realestate.co.nz/residential/sale/search?q=${q}`, note: 'Agent listing archives' },
    { label: 'Auckland Council (GeoMaps)', url: `https://geomapspublic.aucklandcouncil.govt.nz/viewer/index.html`, note: 'Building consent records — Auckland only' },
    { label: 'LINZ Property Search', url: `https://www.linz.govt.nz/tools/landonline`, note: 'Title and boundary data' },
    { label: 'Google Street View', url: `https://www.google.com/maps/search/${q}`, note: 'Exterior reference photos' },
  ]
}

// Parse suburb/city from nominatim result
export function extractRegion(addressDetails) {
  if (!addressDetails) return null
  return (
    addressDetails.city ||
    addressDetails.town ||
    addressDetails.county ||
    addressDetails.state_district ||
    addressDetails.state ||
    null
  )
}
