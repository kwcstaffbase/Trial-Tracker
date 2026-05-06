import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="sticky top-0 z-20 bg-bg-header text-white">
      <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-6 py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wide text-bg-header">
              TXO
            </span>
          </div>
          <span className="text-base font-semibold">Texas Oncology Trial Tracker</span>
        </Link>
      </div>
    </header>
  )
}
