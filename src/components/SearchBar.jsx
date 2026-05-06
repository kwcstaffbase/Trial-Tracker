export default function SearchBar({ value, onChange, placeholder = 'Search', className = '' }) {
  return (
    <div
      className={
        'relative flex items-center rounded-lg bg-white/5 px-3 py-2 text-sm text-white ring-1 ring-white/5 ' +
        className
      }
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-zinc-400">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="ml-2 w-full bg-transparent placeholder:text-zinc-500 focus:outline-none"
      />
    </div>
  )
}
