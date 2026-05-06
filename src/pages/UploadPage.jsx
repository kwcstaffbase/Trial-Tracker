import { useCallback, useState } from 'react'
import PageShell from '../components/PageShell'
import { useData } from '../context/DataContext'
import { DATA_SOURCE_URL } from '../config'

/**
 * Shown when the auto-fetch from the configured SharePoint URL failed (or
 * no URL is configured). Surfaces the error and offers two ways forward:
 * retry the URL, or upload a local copy.
 */
export default function UploadPage() {
  const { load, loadFromUrl, loading, error } = useData()
  const [dragOver, setDragOver] = useState(false)

  const onFile = useCallback(
    (file) => {
      if (!file) return
      load(file)
    },
    [load],
  )

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) onFile(f)
  }

  const hasConfiguredUrl = !!DATA_SOURCE_URL

  return (
    <PageShell>
      <div className="flex flex-col items-center justify-center py-16">
        <h1 className="mb-2 text-2xl font-semibold">
          {hasConfiguredUrl ? 'Could not load trial data' : 'Load a Trial Spreadsheet'}
        </h1>
        <p className="mb-8 max-w-xl text-center text-sm text-zinc-400">
          {hasConfiguredUrl
            ? 'The app tried to fetch the configured SharePoint file but it failed. Retry below, or load a local copy of the spreadsheet.'
            : 'Drop an .xlsx file with the standard Texas Oncology trial-tracker columns to browse it.'}
        </p>

        {error && (
          <div className="mb-6 max-w-xl rounded-lg border border-rose-400/30 bg-rose-400/5 p-4 text-sm text-rose-200">
            {error}
          </div>
        )}

        {hasConfiguredUrl && (
          <button
            onClick={() => loadFromUrl(DATA_SOURCE_URL)}
            disabled={loading}
            className="mb-6 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500 disabled:opacity-50"
          >
            {loading ? 'Retrying…' : 'Retry SharePoint fetch'}
          </button>
        )}

        <label
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={
            'flex w-full max-w-xl cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-12 transition ' +
            (dragOver
              ? 'border-sky-400 bg-sky-400/5'
              : 'border-white/15 bg-white/5 hover:border-white/30')
          }
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-zinc-300">
            <path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-base font-medium">
            {loading
              ? 'Parsing…'
              : hasConfiguredUrl
              ? 'Or drop XLSX here / click to choose a local copy'
              : 'Drop XLSX here, or click to choose a file'}
          </span>
          <span className="text-xs text-zinc-400">.xlsx, .xlsm, or .xls</span>
          <input
            type="file"
            accept=".xlsx,.xlsm,.xls"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </label>
      </div>
    </PageShell>
  )
}
