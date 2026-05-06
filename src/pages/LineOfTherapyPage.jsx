import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import PageShell from '../components/PageShell'
import Breadcrumb from '../components/Breadcrumb'
import SearchBar from '../components/SearchBar'
import FilterDropdown from '../components/FilterDropdown'
import { useData } from '../context/DataContext'

export default function LineOfTherapyPage() {
  const { data } = useData()
  const { disease: dEnc, lot: lEnc } = useParams()
  const disease = decodeURIComponent(dEnc || '')
  const lot = decodeURIComponent(lEnc || '')

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(() => new Set())
  const [regionFilter, setRegionFilter] = useState(() => new Set())

  const allRows = useMemo(() => {
    if (!data) return []
    const idxs = data.trialsByDiseaseLot.get(`${disease}::${lot}`) || []
    return idxs.map((i) => data.rows[i])
  }, [data, disease, lot])

  const statusOptions = useMemo(() => {
    return [...new Set(allRows.map((r) => r['Trial Arm Status']).filter(Boolean))].sort()
  }, [allRows])
  const regionOptions = useMemo(() => {
    return [...new Set(allRows.map((r) => r['Region']).filter(Boolean))].sort()
  }, [allRows])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allRows.filter((r) => {
      if (statusFilter.size && !statusFilter.has(r['Trial Arm Status'])) return false
      if (regionFilter.size && !regionFilter.has(r['Region'])) return false
      if (!q) return true
      const haystack = [
        r['Descriptor'],
        r['USOR Trial ID'],
        r['SC Trial ID'],
        r['NCT Trial ID'],
        r['Trial Name'],
        r['MOA'],
        r['Trial Arm Biomarkers'],
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [allRows, query, statusFilter, regionFilter])

  const grouped = useMemo(() => {
    const m = new Map()
    for (const r of visible) {
      const region = r['Region'] || 'Unspecified Region'
      if (!m.has(region)) m.set(region, [])
      m.get(region).push(r)
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [visible])

  if (!data) return <Navigate to="/" replace />

  const toggle = (set, setter) => (val) => {
    const next = new Set(set)
    if (next.has(val)) next.delete(val)
    else next.add(val)
    setter(next)
  }
  const activeCount = statusFilter.size + regionFilter.size

  return (
    <PageShell>
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { label: disease, to: `/disease/${encodeURIComponent(disease)}` },
          { label: lot },
        ]}
      />
      <h1 className="mt-3 text-3xl font-semibold">{disease}</h1>
      <h2 className="mt-1 text-sm uppercase tracking-wide text-zinc-400">{lot}</h2>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
        <SearchBar value={query} onChange={setQuery} className="w-72" />
        <FilterDropdown
          activeCount={activeCount}
          sections={[
            {
              label: 'Status',
              options: statusOptions,
              selected: statusFilter,
              onToggle: toggle(statusFilter, setStatusFilter),
            },
            {
              label: 'Region',
              options: regionOptions,
              selected: regionFilter,
              onToggle: toggle(regionFilter, setRegionFilter),
            },
          ]}
        />
      </div>

      <div className="mt-2">
        {grouped.map(([region, trials]) => (
          <section key={region} className="mt-6">
            <h3 className="mb-1 text-sm font-semibold text-white">{region}</h3>
            {trials.map((r) => (
              <Link
                key={r.__idx}
                to={`/trial/${r.__idx}`}
                className="flex items-center justify-between border-b border-white/5 py-3 text-white transition hover:bg-bg-row"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">
                    {r['SC Trial ID'] || r['USOR Trial ID'] || 'Trial'}
                    {r['USOR Trial ID'] ? ` (${r['USOR Trial ID']})` : ''}
                  </span>
                  <span className="text-sm text-zinc-400">
                    {r['Descriptor'] || r['Trial Name'] || '—'}
                  </span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-zinc-500">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ))}
          </section>
        ))}
        {visible.length === 0 && (
          <div className="py-12 text-center text-sm text-zinc-400">
            No trials match the current filters.
          </div>
        )}
      </div>
    </PageShell>
  )
}
