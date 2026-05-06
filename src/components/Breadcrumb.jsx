import { Link, useNavigate } from 'react-router-dom'

export default function Breadcrumb({ items }) {
  const navigate = useNavigate()
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-zinc-400">
      <button
        onClick={() => navigate(-1)}
        aria-label="Back"
        className="rounded p-0.5 hover:text-white"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        const showSlash = i < items.length - 1
        if (item.collapsed) {
          return (
            <span key={`c-${i}`} className="flex items-center gap-2">
              <span>…</span>
              {showSlash && <span className="text-zinc-600">/</span>}
            </span>
          )
        }
        return (
          <span key={item.label + i} className="flex items-center gap-2">
            {item.to && !isLast ? (
              <Link to={item.to} className="hover:text-white">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-semibold text-white' : ''}>{item.label}</span>
            )}
            {showSlash && <span className="text-zinc-600">/</span>}
          </span>
        )
      })}
    </nav>
  )
}
