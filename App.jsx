import React, { useEffect, useMemo, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-4">
    <h2 className="text-xl font-semibold">{title}</h2>
    {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
  </div>
)

const Card = ({ children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">{children}</div>
)

const Rating = ({ value }) => (
  <div className="flex items-center gap-1 text-sm"><span>⭐</span><span className="font-medium">{value}</span></div>
)

const Price = ({ level }) => <span className="text-xs font-medium text-gray-500">{level}</span>

function NavLink({ children, active, onClick }) {
  return (
    <button onClick={onClick} className={"px-3 py-2 rounded-xl text-sm font-medium transition " + (active ? "bg-gray-900 text-white" : "hover:bg-gray-100")}>
      {children}
    </button>
  )
}

const Pill = ({ active, children, onClick }) => (
  <button onClick={onClick} className={"px-3 py-1 rounded-full border text-sm transition " + (active ? "bg-black text-white border-black" : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50")}>{children}</button>
)

function MapView({ bars }) {
  const mapRef = useRef(null)
  const containerRef = useRef(null)
  useEffect(() => {
    if (!containerRef.current) return
    if (mapRef.current) return
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [2.3522, 48.8566],
      zoom: 11
    })
    mapRef.current = map
    bars.forEach((b) => {
      // Demo: fake coordinates by city
      const coords = b.city === 'Paris' ? [2.3522, 48.8566] : [4.8357, 45.7640]
      new mapboxgl.Marker().setLngLat(coords).setPopup(new mapboxgl.Popup().setHTML(`<strong>${b.name}</strong><br/>${b.city}`)).addTo(map)
    })
    return () => map.remove()
  }, [bars])
  return <div ref={containerRef} className="h-72 w-full rounded-2xl border" />
}

export default function App() {
  const [route, setRoute] = useState('home')
  const [bars, setBars] = useState([])
  const [events, setEvents] = useState([])
  const [query, setQuery] = useState('')
  const [ambFilter, setAmbFilter] = useState([])
  const [drinkFilter, setDrinkFilter] = useState([])
  const [onlyAccessible, setOnlyAccessible] = useState(false)

  const go = (r) => setRoute(r)
  const currentBar = route.startsWith('bar:') ? bars.find(b => b.id === route.split(':')[1]) : null

  useEffect(() => {
    fetch('/api/bars').then(r => r.json()).then(setBars).catch(() => setBars([]))
    fetch('/api/events').then(r => r.json()).then(setEvents).catch(() => setEvents([]))
  }, [])

  const AMBIANCES = useMemo(() => Array.from(new Set(bars.flatMap(b => b.ambiances || []))), [bars])
  const DRINKS = useMemo(() => Array.from(new Set(bars.flatMap(b => b.drinks || []))), [bars])

  const results = useMemo(() => {
    return bars.filter((b) => {
      const qOk = !query || b.name.toLowerCase().includes(query.toLowerCase()) || b.city.toLowerCase().includes(query.toLowerCase())
      const ambOk = ambFilter.length === 0 || ambFilter.every(a => (b.ambiances || []).includes(a))
      const drinkOk = drinkFilter.length === 0 || drinkFilter.every(d => (b.drinks || []).includes(d))
      const accOk = !onlyAccessible || b.accessible
      return qOk && ambOk && drinkOk && accOk
    })
  }, [bars, query, ambFilter, drinkFilter, onlyAccessible])

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-700 via-fuchsia-600 to-amber-500" />
            <span className="font-extrabold tracking-tight">T’CHIN</span>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            <NavLink onClick={() => go('home')} active={route === 'home'}>Accueil</NavLink>
            <NavLink onClick={() => go('bars')} active={route === 'bars' || route.startsWith('bar:')}>Bars</NavLink>
            <NavLink onClick={() => go('events')} active={route === 'events'}>Événements</NavLink>
            <NavLink onClick={() => go('profile')} active={route === 'profile'}>Profil</NavLink>
          </nav>
          <div className="md:hidden">
            <select className="px-3 py-2 rounded-lg border" value={route.startsWith('bar:') ? 'bars' : route} onChange={e => go(e.target.value)}>
              <option value="home">Accueil</option>
              <option value="bars">Bars</option>
              <option value="events">Événements</option>
              <option value="profile">Profil</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {route === 'home' && (
          <div>
            <div className="bg-gradient-to-br from-purple-700 via-fuchsia-600 to-amber-500 rounded-3xl p-6 md:p-10 text-white shadow-md">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">T’CHIN</h1>
              <p className="mt-2 md:mt-3 text-white/90 max-w-xl">Découvre, réserve et vis des expériences dans les meilleurs bars.</p>
              <div className="mt-6 flex gap-3 flex-wrap">
                <button onClick={() => go('bars')} className="px-5 py-3 bg-white text-gray-900 rounded-xl font-semibold shadow hover:shadow-md">Explorer les bars</button>
                <button onClick={() => go('events')} className="px-5 py-3 bg-black/30 backdrop-blur rounded-xl font-semibold border border-white/40">Événements à venir</button>
              </div>
            </div>
            <div className="mt-6">
              <SectionTitle title="Carte rapide" subtitle="Aperçu Mapbox (démo)" />
              <MapView bars={bars.slice(0, 3)} />
            </div>
          </div>
        )}
        {route === 'bars' && (
          <div>
            <SectionTitle title="Trouve le bar parfait" subtitle="Filtre par ambiance, boissons, accessibilité, ville…" />
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher un bar ou une ville" className="w-full md:w-80 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-black" />
              <div className="flex gap-2 flex-wrap">
                {AMBIANCES.map(a => <Pill key={a} active={ambFilter.includes(a)} onClick={() => setAmbFilter(cur => cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a])}>{a}</Pill>)}
              </div>
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              {DRINKS.map(d => <Pill key={d} active={drinkFilter.includes(d)} onClick={() => setDrinkFilter(cur => cur.includes(d) ? cur.filter(x => x !== d) : [...cur, d])}>{d}</Pill>)}
              <label className="flex items-center gap-2 text-sm ml-auto">
                <input type="checkbox" checked={onlyAccessible} onChange={e => setOnlyAccessible(e.target.checked)} />
                Accessible ♿
              </label>
            </div>
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              {results.map(b => (
                <Card key={b.id}>
                  <img src={b.photo} alt="" className="h-40 w-full object-cover" />
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{b.name}</h3>
                        <p className="text-sm text-gray-600">{b.city} · <Price level={b.priceLevel} /></p>
                      </div>
                      <Rating value={b.rating} />
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{b.description}</p>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {(b.ambiances || []).slice(0,3).map(a => <span key={a} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{a}</span>)}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => go('bar:' + b.id)} className="px-3 py-2 text-sm bg-black text-white rounded-lg">Voir la fiche</button>
                      <button onClick={() => go('events')} className="px-3 py-2 text-sm border rounded-lg">Voir les événements</button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-8">
              <SectionTitle title="Carte interactive" subtitle="Marqueurs par ville (démo). Ajoute de vraies coordonnées côté BDD pour précision." />
              <MapView bars={results} />
            </div>
          </div>
        )}
        {route.startsWith('bar:') && currentBar && <BarDetails bar={currentBar} go={go} />}
        {route === 'events' && <Events events={events} go={go} />}
        {route === 'profile' && <Profile />}
      </main>

      <footer className="max-w-6xl mx-auto px-4 pb-8 text-sm text-gray-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} T’CHIN — Découvre & réserve les meilleurs bars</p>
          <div className="flex gap-3">
            <a className="hover:underline" href="#">CGU</a>
            <a className="hover:underline" href="#">Confidentialité</a>
            <a className="hover:underline" href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function BarDetails({ bar, go }) {
  const [open, setOpen] = useState(false)
  const relatedEventsReq = null // In a full app, fetch /api/events?barId=...
  const relatedEvents = [] // placeholder; UI stays consistent

  return (
    <div className="p-0">
      <div className="relative">
        <img src={bar.photo} alt="" className="h-56 md:h-72 w-full object-cover rounded-none md:rounded-3xl" />
        <button onClick={() => go('bars')} className="absolute top-3 left-3 px-3 py-2 bg-white/90 rounded-lg border">← Retour</button>
      </div>
      <div className="mt-4 grid md:grid-cols-3 gap-6 p-4 md:p-0 md:px-6">
        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold">{bar.name}</h1>
          <p className="text-sm text-gray-600">{bar.city} · <span className="text-xs font-medium text-gray-500">{bar.priceLevel}</span></p>
          <div className="mt-2 flex items-center gap-3">
            <Rating value={bar.rating} />
            <div className="flex gap-2 flex-wrap">
              {(bar.ambiances || []).map(a => <span key={a} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{a}</span>)}
            </div>
          </div>
          <p className="mt-3 text-gray-700">{bar.description}</p>

          <SectionTitle title="Carte & prix" />
          <div className="grid md:grid-cols-2 gap-3">
            {(bar.menu || []).map(m => (
              <div key={m.name} className="flex items-center justify-between p-3 rounded-xl border bg-white">
                <span className="font-medium">{m.name}</span>
                <span className="text-gray-700">{m.price} €</span>
              </div>
            ))}
          </div>

          <SectionTitle title="Allergènes / Accessibilité" />
          <p className="text-sm text-gray-700">
            {bar.accessible ? "Accessible fauteuil roulant" : "Non accessible fauteuil roulant"}
            {(bar.allergens || []).length > 0 && <> · Allergènes: {(bar.allergens || []).join(', ')}</>}
          </p>
        </div>
        <div>
          <Card>
            <div className="p-4">
              <SectionTitle title="Réserver une table" subtitle="MVP – formulaire simple relié à /api/bookings" />
              <BookingForm barId={bar.id} onDone={() => setOpen(false)} />
              <div className="mt-4">
                <SectionTitle title="Événements" />
                {relatedEvents.length === 0 ? <p className="text-sm text-gray-600">Aucun événement.</p> : (
                  <ul className="space-y-2">
                    {relatedEvents.map(e => (
                      <li key={e.id} className="flex items-center justify-between p-3 rounded-xl border">
                        <div><p className="font-medium">{e.title}</p><p className="text-xs text-gray-600">{new Date(e.date).toLocaleDateString()}</p></div>
                        <span className="text-sm">{e.cover === 0 ? "Entrée libre" : e.cover + " €"}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function BookingForm({ barId, onDone }) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [people, setPeople] = useState(2)
  const [status, setStatus] = useState(null)

  const submit = async () => {
    setStatus('loading')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barId, name, date, time, people })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erreur')
      setStatus('ok')
    } catch (e) {
      setStatus('err')
    }
  }

  return (
    <div className="grid gap-3">
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom" className="px-3 py-2 rounded-lg border" />
      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2 rounded-lg border" />
      <input type="time" value={time} onChange={e => setTime(e.target.value)} className="px-3 py-2 rounded-lg border" />
      <input type="number" min={1} value={people} onChange={e => setPeople(Number(e.target.value))} className="px-3 py-2 rounded-lg border" />
      <button type="button" onClick={submit} className="px-4 py-2 bg-black text-white rounded-lg">{status === 'loading' ? 'Envoi…' : 'Valider'}</button>
      {status === 'ok' && <p className="text-green-600 text-sm">Réservation enregistrée ✅</p>}
      {status === 'err' && <p className="text-red-600 text-sm">Erreur lors de l’enregistrement</p>}
    </div>
  )
}

function Events({ events, go }) {
  return (
    <div>
      <SectionTitle title="Événements à venir" subtitle="Concerts, DJ sets, dégustations…" />
      <div className="grid md:grid-cols-3 gap-4">
        {events.map(e => (
          <Card key={e.id}>
            <img src={e.bar.photo} alt="" className="h-40 w-full object-cover" />
            <div className="p-4">
              <h3 className="font-semibold">{e.title}</h3>
              <p className="text-sm text-gray-600">{new Date(e.date).toLocaleDateString()} · {e.bar.name}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => go('bar:' + e.bar.id)} className="px-3 py-2 text-sm bg-black text-white rounded-lg">Voir le bar</button>
                <button onClick={() => go('bars')} className="px-3 py-2 text-sm border rounded-lg">Explorer</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Profile() {
  const BADGES = [
    { id: 'bdg1', name: 'Explorateur', desc: '3 bars testés' },
    { id: 'bdg2', name: 'Expert cocktails', desc: '5 cocktails différents' },
    { id: 'bdg3', name: 'VIP des bars', desc: 'Événements exclusifs' }
  ]
  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-amber-400 grid place-items-center text-white font-bold">TC</div>
        <div>
          <h1 className="text-2xl font-bold">Mon profil</h1>
          <p className="text-sm text-gray-600">Ambiances préférées : Chill, Rooftop</p>
        </div>
      </div>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <Card><div className="p-4"><SectionTitle title="Badges" /><div className="flex flex-wrap gap-3">{BADGES.map(b => (<div key={b.id} className="px-3 py-2 rounded-xl border bg-white"><p className="font-medium">{b.name}</p><p className="text-xs text-gray-600">{b.desc}</p></div>))}</div></div></Card>
        <Card><div className="p-4"><SectionTitle title="T’chin Challenges" /><ul className="space-y-2 text-sm"><li className="p-3 rounded-xl border">Tester un cocktail signature ce mois-ci</li><li className="p-3 rounded-xl border">Poster une photo dans un bar partenaire</li><li className="p-3 rounded-xl border">Découvrir un nouveau rooftop</li></ul></div></Card>
      </div>
    </div>
  )
}