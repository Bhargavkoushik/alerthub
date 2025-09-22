import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const INITIAL_CENTER = [20.5937, 78.9629]
const INITIAL_ZOOM = 5
const GDACS_URL = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/0'
const SAMPLE_URL = '/alerts-sample.json'

const TYPE_LABELS = {
  EQ: 'Earthquake',
  FL: 'Flood',
  TC: 'Cyclone',
  WF: 'Wildfire',
  VO: 'Volcano',
  TO: 'Tornado',
  TS: 'Tsunami',
  HU: 'Hurricane',
  DR: 'Drought',
  LS: 'Landslide',
}

const ICON_PATHS = {
  Earthquake: '/icons/earthquake.svg',
  Volcano: '/icons/volcano.svg',
  Tornado: '/icons/tornado.svg',
  Tsunami: '/icons/tsunami.svg',
  Hurricane: '/icons/hurricane.svg',
  Drought: '/icons/drought.svg',
  Wildfire: '/icons/wildfire.svg',
  Landslide: '/icons/landslide.svg',
  Flood: '/icons/flood.svg',
  Cyclone: '/icons/hurricane.svg', // reuse hurricane icon for cyclones
}

function makeIcon(url) {
  return L.icon({
    iconUrl: url,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -10],
    className: 'transition-transform duration-150 ease-out',
  })
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function isInOrNearIndia(lat, lon) {
  // Rough bounding box around India with small padding
  // India approx lat 6.0 to 37.0, lon 68.0 to 97.5
  return lat >= 5.0 && lat <= 38.0 && lon >= 66.0 && lon <= 100.0
}

function getSourceFromUrl() {
  const usp = new URLSearchParams(window.location.search)
  const src = (usp.get('source') || 'auto').toLowerCase()
  return src === 'gdacs' || src === 'sample' ? src : 'auto'
}

async function fetchSource(src, controller) {
  if (src === 'sample') {
    const res = await fetch(SAMPLE_URL, { signal: controller.signal, headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`Sample ${res.status}`)
    return res.json()
  }
  // default gdacs
  const res = await fetch(GDACS_URL, { signal: controller.signal, headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`GDACS ${res.status}`)
  return res.json()
}

function useDisasters({ withinKmOf } = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const sourceRef = useRef(getSourceFromUrl())

  useEffect(() => {
    let mounted = true
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        setError(null)
        let json
        try {
          const chosen = sourceRef.current === 'auto' ? 'gdacs' : sourceRef.current
          json = await fetchSource(chosen, controller)
        } catch (e) {
          // fallback to sample if gdacs fails or when auto
          if (sourceRef.current === 'gdacs') throw e
          json = await fetchSource('sample', controller)
        }
        // Normalize items
        const items = Array.isArray(json) ? json : json?.features || []
        const normalized = items
          .map((it) => {
            const typeCode = it.eventtype || it.type || it.eventType
            const name = it.eventname || it.name || it.title || TYPE_LABELS[typeCode] || 'Disaster'
            const lat = Number(it.lat ?? it.latitude ?? it.Latitude)
            const lon = Number(it.lon ?? it.longitude ?? it.Longitude)
            const startDate = it.fromdate || it.startdate || it.date || it.pubdate
            const severity = it.alertlevel || it.severity || it.level || 'Unknown'
            const magnitude = it.magnitude ?? it.mag ?? undefined
            const type = TYPE_LABELS[typeCode]
            return { typeCode, type, name, lat, lon, startDate, severity, magnitude }
          })
          .filter((d) =>
            Number.isFinite(d.lat) && Number.isFinite(d.lon) && d.type && isInOrNearIndia(d.lat, d.lon),
          )

        const filtered = withinKmOf
          ? normalized.filter((d) => haversineKm(d.lat, d.lon, withinKmOf.lat, withinKmOf.lon) <= withinKmOf.km)
          : normalized

        if (mounted) setData(filtered)
      } catch (e) {
        if (e.name === 'AbortError') return
        if (mounted) setError(e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
  const id = setInterval(load, 60_000) // auto-refresh every 60s
    return () => {
      mounted = false
      controller.abort()
      clearInterval(id)
    }
  }, [withinKmOf])

  return { data, loading, error }
}

function FlyTo({ center, zoom }) {
  const map = useMap()
  const prev = useRef({ center, zoom })
  useEffect(() => {
    const changed =
      prev.current.center[0] !== center[0] || prev.current.center[1] !== center[1] || prev.current.zoom !== zoom
    if (changed) {
      map.flyTo(center, zoom, { animate: true, duration: 1.0 })
      prev.current = { center, zoom }
    }
  }, [center, zoom, map])
  return null
}

function InvalidateSizeOnMount() {
  const map = useMap()
  useEffect(() => {
    // Invalidate size shortly after mount to ensure proper tile rendering
    const t = setTimeout(() => map.invalidateSize(), 50)
    function onResize() {
      map.invalidateSize()
    }
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', onResize)
    }
  }, [map])
  return null
}

function Legend() {
  const items = [
    { label: 'Earthquake', icon: ICON_PATHS.Earthquake },
    { label: 'Flood', icon: ICON_PATHS.Flood },
    { label: 'Cyclone', icon: ICON_PATHS.Cyclone },
    { label: 'Wildfire', icon: ICON_PATHS.Wildfire },
    { label: 'Volcano', icon: ICON_PATHS.Volcano },
    { label: 'Tornado', icon: ICON_PATHS.Tornado },
    { label: 'Tsunami', icon: ICON_PATHS.Tsunami },
    { label: 'Hurricane', icon: ICON_PATHS.Hurricane },
    { label: 'Drought', icon: ICON_PATHS.Drought },
    { label: 'Landslide', icon: ICON_PATHS.Landslide },
  ]
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-2">
          <img src={i.icon} alt={i.label} className="h-4 w-4" />
          <span className="text-neutral-300">{i.label}</span>
        </div>
      ))}
    </div>
  )
}

function SearchBox({ onResult, filterEnabled, setFilterEnabled }) {
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  async function onSubmit(e) {
    e.preventDefault()
    const query = q.trim()
    if (!query) return
    try {
      setBusy(true)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=1`,
        { headers: { Accept: 'application/json' } },
      )
      if (!res.ok) throw new Error(`Nominatim ${res.status}`)
      const results = await res.json()
      if (Array.isArray(results) && results.length > 0) {
        const r = results[0]
        const lat = Number(r.lat)
        const lon = Number(r.lon)
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          onResult({ lat, lon })
        }
      }
    } finally {
      setBusy(false)
    }
  }
  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
      <input
        type="text"
        placeholder="Search address, pin code, or area"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-brand focus:outline-none"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {busy ? 'Searching…' : 'Search'}
        </button>
        <label className="flex items-center gap-2 text-xs text-neutral-300">
          <input
            type="checkbox"
            checked={filterEnabled}
            onChange={(e) => setFilterEnabled(e.target.checked)}
          />
          <span>Filter markers within 100 km</span>
        </label>
      </div>
    </form>
  )
}

export default function LiveMap() {
  const [center, setCenter] = useState(INITIAL_CENTER)
  const [zoom, setZoom] = useState(INITIAL_ZOOM)
  const [searchLoc, setSearchLoc] = useState(null)
  const [filterNearby, setFilterNearby] = useState(true)
  const [selected, setSelected] = useState(null)
  const [tileUrl, setTileUrl] = useState('https://tile.openstreetmap.org/{z}/{x}/{y}.png')

  const withinKmOf = useMemo(() => {
    if (filterNearby && searchLoc) return { lat: searchLoc.lat, lon: searchLoc.lon, km: 100 }
    return null
  }, [searchLoc, filterNearby])

  const { data, loading, error } = useDisasters({ withinKmOf })

  function handleSearchResult(loc) {
    setSearchLoc(loc)
    setCenter([loc.lat, loc.lon])
    setZoom(Math.max(8, zoom))
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="mb-4">
        <SearchBox onResult={handleSearchResult} filterEnabled={filterNearby} setFilterEnabled={setFilterNearby} />
        <Legend />
        {selected && (
          <div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-900/50 p-3 text-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-neutral-100">{selected.name}</div>
                <div className="text-xs text-neutral-400">{selected.type}</div>
              </div>
              <button
                className="text-xs text-neutral-400 hover:text-neutral-200"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-neutral-400">Date:</span> {selected.startDate ? new Date(selected.startDate).toLocaleString() : 'N/A'}</div>
              <div><span className="text-neutral-400">Severity:</span> {String(selected.severity ?? 'N/A')}</div>
              {selected.magnitude !== undefined && (
                <div><span className="text-neutral-400">Magnitude:</span> {String(selected.magnitude)}</div>
              )}
              <div>
                <span className="text-neutral-400">Coords:</span> {selected.lat.toFixed(2)}, {selected.lon.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40 shadow">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={true}
          dragging={true}
          doubleClickZoom={true}
          style={{ height: '70vh', width: '100%' }}
        >
          <FlyTo center={center} zoom={zoom} />
          <InvalidateSizeOnMount />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | © <a href="https://carto.com/attributions">CARTO</a>'
            url={tileUrl}
            eventHandlers={{
              tileerror: () => {
                // Fallback to Carto light tiles if OSM is blocked
                setTileUrl('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png')
              },
            }}
          />
          {data.map((d, idx) => {
            const iconUrl = ICON_PATHS[d.type] || '/icons/earthquake.svg'
            const icon = makeIcon(iconUrl)
            return (
              <Marker
                key={`${d.type}-${idx}-${d.lat}-${d.lon}`}
                position={[d.lat, d.lon]}
                icon={icon}
                eventHandlers={{
                  click: (e) => {
                    setSelected(d)
                    e?.target?.openPopup?.()
                  },
                }}
              >
                <Popup>
                  <div className="min-w-52 text-sm">
                    <div className="font-semibold">{d.name}</div>
                    <div className="text-xs text-neutral-400">{d.type}</div>
                    <div className="mt-1 text-xs">
                      <div>Date: {d.startDate ? new Date(d.startDate).toLocaleString() : 'N/A'}</div>
                      <div>Severity: {String(d.severity)}</div>
                      {d.magnitude !== undefined && (
                        <div>Magnitude: {String(d.magnitude)}</div>
                      )}
                      <div>
                        Coords: {d.lat.toFixed(2)}, {d.lon.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>
      <div className="mt-2 text-xs text-neutral-400">
        {loading && <span>Loading events…</span>}
        {error && <span>Error loading data. Try again later.</span>}
        {!loading && !error && <span>Showing {data.length} events</span>}
      </div>
    </section>
  )
}
