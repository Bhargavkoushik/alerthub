import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { toast } from 'react-hot-toast'
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
      <section className="mx-auto w-full max-w-4xl px-4 py-8">
        <p className="text-neutral-400">Alert not found.</p>
        <Link to="/authority/alerts" className="text-emerald-400">Back</Link>
      </section>
    )
  }

  const [lat, lng] = alert.coordinates || [20.5937, 78.9629]

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Verify Alert</h2>
          <p className="text-neutral-400">ID: {alert.id}</p>
        </div>
        <Link to="/authority/alerts" className="text-sm text-emerald-400 hover:underline">
          Back to Alerts
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <div className="mb-2 text-sm font-medium">Details</div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-neutral-400">Type</dt>
              <dd className="font-medium">{alert.type}</dd>
            </div>
            <div>
              <dt className="text-neutral-400">District</dt>
              <dd className="font-medium">{alert.district}</dd>
            </div>
            <div>
              <dt className="text-neutral-400">Severity</dt>
              <dd className="font-medium capitalize">{alert.severity || 'unknown'}</dd>
            </div>
            <div>
              <dt className="text-neutral-400">Reported</dt>
              <dd className="font-medium">{new Date(alert.reportedAt).toLocaleString()}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-neutral-400">Description</dt>
              <dd className="font-medium">{alert.description}</dd>
            </div>
          </dl>

          <div className="mt-4 flex items-center gap-2">
            <button
              className="rounded-md border border-emerald-700/60 px-3 py-2 text-sm text-emerald-300 hover:bg-emerald-900/20"
              onClick={() => act('verified')}
            >
              Verify
            </button>
            <button
              className="rounded-md border border-rose-700/60 px-3 py-2 text-sm text-rose-300 hover:bg-rose-900/20"
              onClick={() => act('rejected')}
            >
              Reject
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-2">
          <div className="mb-2 px-2 pt-2 text-sm font-medium">Location</div>
          <div className="h-80 overflow-hidden rounded-lg">
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
    </section>
  )
}
