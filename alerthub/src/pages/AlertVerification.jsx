import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { toast } from 'react-hot-toast'
import { AlertTriangle } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

export default function AlertVerification() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('community-alerts') || '[]')
    } catch {
      return []
    }
  })

  const alert = useMemo(() => alerts.find((a) => a.id === id), [alerts, id])

  useEffect(() => {
    if (!alert) return
    // Ensure map icons display correctly in Leaflet
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    })
  }, [alert])

  function act(action) {
    const updated = alerts.map((a) =>
      a.id === id ? { ...a, status: action, verifiedAt: Date.now(), verifier: 'NDMA Officer' } : a
    )
    setAlerts(updated)
    localStorage.setItem('community-alerts', JSON.stringify(updated))
    toast.success(`Alert ${action}`)
    navigate('/authority/alerts')
  }

  if (!alert) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
        <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 text-xl"><AlertTriangle className="h-5 w-5" /></div>
              <div className="text-lg font-semibold">Verify Alert</div>
            </div>
            <div className="hidden gap-6 text-sm text-slate-200 sm:flex">
              <Link className="hover:text-white/90" to="/">Home</Link>
              <Link className="hover:text-white/90" to="/authority/alerts">Alerts</Link>
            </div>
          </div>
        </nav>
        <main className="mx-auto w-full max-w-6xl px-4 py-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">Alert not found. <Link to="/authority/alerts" className="text-emerald-400 underline-offset-2 hover:underline">Back</Link></div>
        </main>
      </div>
    )
  }

  const [lat, lng] = alert.coordinates || [20.5937, 78.9629]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 text-xl"><AlertTriangle className="h-5 w-5" /></div>
            <div className="text-lg font-semibold">Verify Alert</div>
          </div>
          <div className="hidden gap-6 text-sm text-slate-200 sm:flex">
            <Link className="hover:text-white/90" to="/">Home</Link>
            <Link className="hover:text-white/90" to="/authority/alerts">Alerts</Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Verify Alert</h2>
            <p className="mt-1 text-sm text-slate-300">ID: {alert.id}</p>
          </div>
          <Link to="/authority/alerts" className="text-sm text-emerald-400 hover:underline">Back to Alerts</Link>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 text-sm font-medium">Details</div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-300">Type</dt>
                <dd className="font-medium text-white">{alert.type}</dd>
              </div>
              <div>
                <dt className="text-slate-300">District</dt>
                <dd className="font-medium text-white">{alert.district}</dd>
              </div>
              <div>
                <dt className="text-slate-300">Severity</dt>
                <dd className="font-medium capitalize text-white">{alert.severity || 'unknown'}</dd>
              </div>
              <div>
                <dt className="text-slate-300">Reported</dt>
                <dd className="font-medium text-white">{new Date(alert.reportedAt).toLocaleString()}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-slate-300">Description</dt>
                <dd className="font-medium text-white/90">{alert.description}</dd>
              </div>
            </dl>
            <div className="mt-4 flex items-center gap-2">
              <button className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300 hover:bg-emerald-600/20" onClick={() => act('verified')}>
                Verify
              </button>
              <button className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300 hover:bg-rose-600/20" onClick={() => act('rejected')}>
                Reject
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
            <div className="mb-2 px-2 pt-2 text-sm font-medium">Location</div>
            <div className="h-80 overflow-hidden rounded-xl">
              <MapContainer center={[lat, lng]} zoom={6} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[lat, lng]}>
                  <Popup>
                    {alert.type} in {alert.district}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
