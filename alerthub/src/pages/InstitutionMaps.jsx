import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useMemo, useState } from 'react'

export default function InstitutionMaps() {
  const [markers, setMarkers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('inst-markers') || '[]') } catch { return [] }
  })
  const defaultCenter = useMemo(() => [20.5937, 78.9629], [])

  function addMarker(e) {
    const { lat, lng } = e.latlng
    const updated = [...markers, { lat, lng, label: 'Resource' }]
    setMarkers(updated)
    localStorage.setItem('inst-markers', JSON.stringify(updated))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 text-xl">🗺️</div>
            <div className="text-lg font-semibold">Institution Resource Maps</div>
          </div>
          <Link className="text-sm text-cyan-300 hover:text-white" to="/institution">Back to Dashboard</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 text-sm font-semibold">Campus Map</div>
          <div className="h-[520px] overflow-hidden rounded-xl">
            <MapContainer center={defaultCenter} zoom={5} style={{ height: '100%', width: '100%' }} onClick={addMarker}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {markers.map((m, i) => (
                <Marker key={i} position={[m.lat, m.lng]}>
                  <Popup>{m.label}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <p className="mt-2 text-xs text-slate-300">Tip: Click on the map to add a resource marker (e.g., fire extinguisher, first aid).</p>
        </div>
      </main>
    </div>
  )
}
