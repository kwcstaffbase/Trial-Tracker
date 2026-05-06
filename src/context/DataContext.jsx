import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { parseTrialWorkbook } from '../lib/parseExcel'
import { DATA_SOURCE_URL } from '../config'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const autoLoadAttempted = useRef(false)

  const load = useCallback(async (file) => {
    setLoading(true)
    setError(null)
    try {
      const parsed = await parseTrialWorkbook(file)
      setData(parsed)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to parse spreadsheet.')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadFromUrl = useCallback(async (url) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(url, { credentials: 'omit' })
      const ct = (res.headers.get('Content-Type') || '').toLowerCase()

      // The middleware returns JSON on failure, with details about which
      // strategies it tried. Surface that to the user.
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

      // Defensive: even on 200, double-check we didn't get HTML.
      if (ct.includes('text/html')) {
        throw new Error(
          'Server returned an HTML page instead of the spreadsheet bytes. The middleware should have caught this — restart `npm run dev`?',
        )
      }

      const blob = await res.blob()
      if (blob.size < 1024) {
        throw new Error(`Downloaded file is only ${blob.size} bytes — likely an error page.`)
      }
      const file = new File([blob], 'data.xlsx', { type: blob.type })
      const parsed = await parseTrialWorkbook(file)
      setData(parsed)
      const strategy = res.headers.get('X-Strategy-Used')
      if (strategy) console.log(`[trial-tracker] loaded data via "${strategy}" strategy`)
    } catch (err) {
      console.error(err)
      let msg = err.message || 'Failed to fetch the spreadsheet.'
      if (msg.toLowerCase().includes('failed to fetch') || err.name === 'TypeError') {
        msg =
          'The browser could not reach the dev server. Is `npm run dev` still running? ' +
          'If you just edited vite.config.js, you must restart it — Vite does not hot-reload server middleware.'
      }
      setError(msg)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
  }, [])

  useEffect(() => {
    if (autoLoadAttempted.current) return
    if (!DATA_SOURCE_URL) return
    autoLoadAttempted.current = true
    loadFromUrl(DATA_SOURCE_URL)
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
