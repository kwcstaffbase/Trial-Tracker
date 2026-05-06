import { Link } from 'react-router-dom'

export default function ListRow({ to, primary, secondary }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between border-b border-white/5 px-1 py-4 text-white transition hover:bg-bg-row"
    >
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{primary}</span>
        {secondary && <span className="text-sm text-zinc-400">{secondary}</span>}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-zinc-500">
        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  )
}
