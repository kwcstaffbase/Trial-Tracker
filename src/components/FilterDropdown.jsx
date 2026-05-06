import { useEffect, useRef, useState } from 'react'

export default function FilterDropdown({ sections, activeCount = 0 }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    function onDocClick(e) {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white ring-1 ring-white/5 hover:bg-white/10"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-zinc-300">
          <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span>Filter</span>
        {activeCount > 0 && (
          <span className="rounded-full bg-sky-500 px-1.5 text-[11px] font-semibold text-white">
            {activeCount}
          </span>
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-zinc-400">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-xl bg-bg-header p-3 text-sm shadow-xl ring-1 ring-white/10">
          {sections.map((sec) => (
            <div key={sec.label} className="mb-3 last:mb-0">
              <div className="mb-1 px-1 text-xs uppercase tracking-wide text-zinc-400">
                {sec.label}
              </div>
              <div className="max-h-56 overflow-auto pr-1">
                {sec.options.map((opt) => {
                  const checked = sec.selected.has(opt)
                  return (
                    <label
                      key={opt}
                      className="flex cursor-pointer items-center gap-2 rounded px-1 py-1.5 hover:bg-white/5"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => sec.onToggle(opt)}
                        className="h-4 w-4 rounded border-white/20 bg-transparent accent-sky-500"
                      />
                      <span className="text-zinc-200">{opt}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
