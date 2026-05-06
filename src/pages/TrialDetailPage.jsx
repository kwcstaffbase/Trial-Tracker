import { Navigate, useParams } from 'react-router-dom'
import PageShell from '../components/PageShell'
import Breadcrumb from '../components/Breadcrumb'
import { useData } from '../context/DataContext'
import { getClinicsForRow } from '../lib/parseExcel'

const FIELDS = [
  { header: 'SC Trial ID' },
  { header: 'USOR Trial ID' },
  { header: 'NCT Trial Link', type: 'link' },
  { header: 'Disease Type' },
  { header: 'Line of Therapy' },
  { header: 'Trial Name' },
  { header: 'Trial Arm Label' },
  { header: 'MOA' },
  { header: 'Trial Arm Biomarkers' },
  { header: 'Trial Arm Treatment Setting' },
  { header: 'Biomarker Prescreening' },
  { header: 'Tissue Requirements' },
  { header: 'CNS Involvement' },
  { header: 'Baseline Disease Requirement' },
  { header: 'Enrollment Status' },
  { header: 'Trial Arm Status' },
  { header: '# of Slots' },
  { header: 'Slot Type' },
  { header: 'Slot Notes' },
]

export default function TrialDetailPage() {
  const { data } = useData()
  const { idx } = useParams()
  if (!data) return <Navigate to="/" replace />

  const row = data.rows[Number(idx)]
  if (!row) {
    return (
      <PageShell>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Trial' }]} />
        <p className="mt-6 text-zinc-400">Trial not found.</p>
      </PageShell>
    )
  }

  const disease = row['Disease Type'] || ''
  const lot = row['Line of Therapy'] || ''
  const clinics = getClinicsForRow(row, data.clinicHeaders)

  return (
    <PageShell>
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { collapsed: true },
          { label: lot, to: `/disease/${encodeURIComponent(disease)}/lot/${encodeURIComponent(lot)}` },
          { label: row['SC Trial ID'] || row['USOR Trial ID'] || 'Trial' },
        ]}
      />

      <h1 className="mt-3 text-3xl font-semibold">
        {row['SC Trial ID'] || row['USOR Trial ID'] || 'Trial'}
      </h1>
      {row['NCT Trial ID'] && (
        <div className="mt-1 text-sm text-zinc-400">{row['NCT Trial ID']}</div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        {FIELDS.map(({ header, type }) => {
          const value = row[header]
          if (value === null || value === undefined || value === '') return null
          return (
            <div key={header}>
              <div className="text-xs text-zinc-400">{header}</div>
              <div className="mt-1 text-sm text-white">
                {type === 'link' ? (
                  <a
                    href={String(value)}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-sky-400 hover:underline"
                  >
                    {String(value)}
                  </a>
                ) : (
                  <span className="whitespace-pre-wrap">{String(value)}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {clinics.length > 0 && (
        <div className="mt-12 space-y-4">
          {clinics.map(({ clinic, email }) => (
            <div
              key={clinic}
              className="flex items-center justify-between border-t border-white/10 pt-4"
            >
              <div className="text-sm font-semibold">{clinic}</div>
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white ring-1 ring-white/10 hover:bg-white/10"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="2" />
                  <path d="M4 6l8 7 8-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Email</span>
              </a>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
