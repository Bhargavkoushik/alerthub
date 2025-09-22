import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

const ZONES = [
  { id: 'safe1', name: 'Safe Zone - City Park', lat: 17.385, lng: 78.4867, type: 'Safe Zone' },
  { id: 'shelter1', name: 'Emergency Shelter - School Gym', lat: 17.39, lng: 78.49, type: 'Shelter' },
]

export default function TeacherMaps() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 text-xl">🗺️</div>
            <div className="text-lg font-semibold">Resource Maps</div>
          </div>
          <a className="text-sm text-cyan-300 hover:text-white" href="/teacher">Back to Dashboard</a>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 text-sm font-semibold">Safe Zones & Emergency Shelters</h3>
          <div className="h-[60vh] w-full overflow-hidden rounded-xl">
            <MapContainer center={[17.385, 78.4867]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              {ZONES.map(z => (
                <Marker key={z.id} position={[z.lat, z.lng]}>
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold">{z.name}</div>
                      <div className="text-slate-300">{z.type}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </main>
    </div>
  )
}
