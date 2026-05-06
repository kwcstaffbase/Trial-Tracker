import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import PageShell from '../components/PageShell'
import Breadcrumb from '../components/Breadcrumb'
import SearchBar from '../components/SearchBar'
import ListRow from '../components/ListRow'
import { useData } from '../context/DataContext'
import { getRibbonStyle } from '../lib/diseaseRibbons'

export default function DiseasePage() {
  const { data } = useData()
  const { disease: encoded } = useParams()
  const disease = decodeURIComponent(encoded || '')
  const [query, setQuery] = useState('')

  const lines = data?.linesByDisease.get(disease) || null
  const style = useMemo(() => getRibbonStyle(disease), [disease])

  const visible = useMemo(() => {
    if (!lines) return []
    const q = query.trim().toLowerCase()
    if (!q) return lines
    return lines.filter((l) => l.toLowerCase().includes(q))
  }, [lines, query])

  if (!data) return <Navigate to="/" replace />
  if (!lines) {
    return (
      <PageShell>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: disease }]} />
        <p className="mt-6 text-zinc-400">No data for “{disease}”.</p>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: disease }]} />

      <div className="mt-6 flex items-center gap-8">
        <div className="h-44 w-56 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/5">
          {style.kind === 'image' ? (
            <img src={style.src} alt={disease} className="h-full w-full object-cover" />
          ) : (
            <RibbonHero colors={style.colors} />
          )}
        </div>
        <h1 className="text-4xl font-semibold">{disease}</h1>
      </div>

      <div className="mt-8 flex justify-end">
        <SearchBar value={query} onChange={setQuery} className="w-72" />
      </div>

      <div className="mt-3">
        {visible.map((lot) => (
          <ListRow
            key={lot}
            to={`/disease/${encodeURIComponent(disease)}/lot/${encodeURIComponent(lot)}`}
            primary={lot}
          />
        ))}
        {visible.length === 0 && (
          <div className="py-8 text-center text-sm text-zinc-400">
            No lines of therapy match “{query}”.
          </div>
        )}
      </div>
    </PageShell>
  )
}

function RibbonHero({ colors }) {
  const [from, to] = colors
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${from}22 0%, ${to}33 100%), #f3f4f6` }}
    >
      <svg viewBox="0 0 120 160" width="60%" height="60%" aria-hidden="true">
        <defs>
          <linearGradient id={`hg-${from.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <g fill={`url(#hg-${from.replace('#', '')})`} stroke="rgba(0,0,0,0.15)" strokeWidth="1.2">
          <path d="M60 18 C 78 36, 92 60, 86 96 L 102 150 L 80 150 L 70 110 C 62 86, 52 60, 60 18 Z" />
          <path d="M60 18 C 42 36, 28 60, 34 96 L 18 150 L 40 150 L 50 110 C 58 86, 68 60, 60 18 Z" opacity="0.85" />
        </g>
      </svg>
    </div>
  )
}
