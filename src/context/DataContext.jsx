import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { parseTrialWorkbook, parseRawWorkbook, buildIndexes } from '../lib/parseExcel'
import { idbGet, idbSet, idbDel } from '../lib/idb'
import { DATA_SOURCE_URL } from '../config'

const DataContext = createContext(null)

// IndexedDB cache settings. Bump CACHE_SCHEMA_VERSION if the cached shape
// changes in a way that's incompatible with older entries.
const CACHE_KEY = 'workbook'
const CACHE_SCHEMA_VERSION = 1
const CACHE_TTL_MS = 12 * 60 * 60 * 1000 // 12 hours

export function DataProvider({ children }) {
  // Start in `loading` state if we have a URL to auto-load from. This
  // prevents a flash of the upload screen on first render before the
  // IndexedDB cache lookup completes.
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(DATA_SOURCE_URL))
  const [error, setError] = useState(null)
  const autoLoadAttempted = useRef(false)

  const writeCache = useCallback(async (raw) => {
    await idbSet(CACHE_KEY, {
      v: CACHE_SCHEMA_VERSION,
      headers: raw.headers,
      rows: raw.rows,
      clinicHeaders: raw.clinicHeaders,
      fetchedAt: Date.now(),
    })
  }, [])

  // Manual upload path (drop-zone in UploadPage). Caches afterwards.
  const load = useCallback(
    async (file) => {
      setLoading(true)
      setError(null)
      try {
        const raw = await parseRawWorkbook(file)
        const indexed = buildIndexes(raw)
        setData(indexed)
        await writeCache(raw)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Failed to parse spreadsheet.')
        setData(null)
      } finally {
        setLoading(false)
      }
    },
    [writeCache],
  )

  // Network fetch path (default on app start, or "Retry" button). Caches
  // afterwards.
  const loadFromUrl = useCallback(
    async (url) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(url, { credentials: 'omit' })
        const ct = (res.headers.get('Content-Type') || '').toLowerCase()

        if (!res.ok) {
          if (ct.includes('application/json')) {
            const detail = await res.json()
            const list = (detail.attempts || [])
              .map((a) => `  • ${a.strategy}: ${a.status || a.error || a.note || 'unknown'}`)
              .join('\n')
            throw new Error(`Middleware reports all download strategies failed:\n${list}`)
          }
          throw new Error(`HTTP ${res.status} ${res.statusText} fetching ${url}`)
        }
        if (ct.includes('text/html')) {
          throw new Error(
            'Server returned an HTML page instead of the spreadsheet bytes. Check the production data file is in place.',
          )
        }

        const blob = await res.blob()
        if (blob.size < 1024) {
          throw new Error(`Downloaded file is only ${blob.size} bytes — likely an error page.`)
        }
        const file = new File([blob], 'data.xlsx', { type: blob.type })
        const raw = await parseRawWorkbook(file)
        const indexed = buildIndexes(raw)
        setData(indexed)
        await writeCache(raw)
        const strategy = res.headers.get('X-Strategy-Used')
        if (strategy) console.log(`[trial-tracker] loaded data via "${strategy}" strategy`)
      } catch (err) {
        console.error(err)
        let msg = err.message || 'Failed to fetch the spreadsheet.'
        if (msg.toLowerCase().includes('failed to fetch') || err.name === 'TypeError') {
          msg =
            'The browser could not reach the data file. Check your network connection, or in dev, that `npm run dev` is still running.'
        }
        setError(msg)
        setData(null)
      } finally {
        setLoading(false)
      }
    },
    [writeCache],
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    idbDel(CACHE_KEY) // forget the cache so a forced reload re-fetches
  }, [])

  // -------------------------------------------------------------------
  // Bootstrap: on mount, try IndexedDB first. If it has a fresh entry,
  // skip the network entirely. Otherwise fall back to loadFromUrl.
  // -------------------------------------------------------------------
  useEffect(() => {
    if (autoLoadAttempted.current) return
    autoLoadAttempted.current = true

    let cancelled = false
    ;(async () => {
      try {
        const cached = await idbGet(CACHE_KEY)
        if (cancelled) return

        const fresh =
          cached &&
          cached.v === CACHE_SCHEMA_VERSION &&
          typeof cached.fetchedAt === 'number' &&
          Date.now() - cached.fetchedAt < CACHE_TTL_MS &&
          Array.isArray(cached.rows)

        if (fresh) {
          const ageMin = Math.round((Date.now() - cached.fetchedAt) / 60000)
          console.log(`[cache] hit — using stored workbook (${ageMin} min old)`)
          const indexed = buildIndexes(cached)
          if (cancelled) return
          setData(indexed)
          setLoading(false)
          return
        }
        if (cached) console.log('[cache] entry is stale or incompatible — refetching')
      } catch (err) {
        console.warn('[cache] read failed:', err)
      }

      // Either no cache, stale cache, or read error → fetch from server.
      if (DATA_SOURCE_URL && !cancelled) {
        await loadFromUrl(DATA_SOURCE_URL)
      } else if (!cancelled) {
        setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [loadFromUrl])

  const value = useMemo(
    () => ({ data, loading, error, load, loadFromUrl, reset }),
    [data, loading, error, load, loadFromUrl, reset],
  )
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside <DataProvider>')
  return ctx
}
