import { useMemo, useState } from 'react'
import PageShell from '../components/PageShell'
import RibbonCard from '../components/RibbonCard'
import SearchBar from '../components/SearchBar'
import { useData } from '../context/DataContext'

export default function HomePage() {
  const { data } = useData()
  const [query, setQuery] = useState('')

  const visible = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    if (!q) return data.diseases
    return data.diseases.filter((d) => d.toLowerCase().includes(q))
  }, [data, query])

  const headerBand = (
    <>
      <h1 className="text-2xl font-semibold">Home</h1>
      <SearchBar value={query} onChange={setQuery} className="w-72" />
    </>
  )

  return (
    <PageShell headerBand={headerBand}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((disease) => (
          <RibbonCard key={disease} disease={disease} />
        ))}
      </div>
      {visible.length === 0 && (
        <div className="py-12 text-center text-sm text-zinc-400">
          No disease types match “{query}”.
        </div>
      )}
    </PageShell>
  )
}
