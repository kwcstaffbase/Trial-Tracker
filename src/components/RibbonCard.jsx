import { Link } from 'react-router-dom'
import { getRibbonStyle } from '../lib/diseaseRibbons'

export default function RibbonCard({ disease }) {
  const style = getRibbonStyle(disease)
  return (
    <Link
      to={`/disease/${encodeURIComponent(disease)}`}
      className="group flex flex-col gap-2"
    >
      <div className="aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-white/5 transition group-hover:ring-white/20">
        {style.kind === 'image' ? (
          <img src={style.src} alt={disease} className="h-full w-full object-cover" />
        ) : (
          <RibbonGradient colors={style.colors} />
        )}
      </div>
      <span className="text-sm font-semibold text-white">{disease}</span>
    </Link>
  )
}

function RibbonGradient({ colors }) {
  const [from, to] = colors
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${from}22 0%, ${to}33 100%), #f3f4f6` }}
    >
      <Ribbon from={from} to={to} />
    </div>
  )
}

function Ribbon({ from, to }) {
  return (
    <svg viewBox="0 0 120 160" width="64%" height="64%" aria-hidden="true">
      <defs>
        <linearGradient id={`g-${from.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <g fill={`url(#g-${from.replace('#', '')})`} stroke="rgba(0,0,0,0.15)" strokeWidth="1.2">
        <path d="M60 18 C 78 36, 92 60, 86 96 L 102 150 L 80 150 L 70 110 C 62 86, 52 60, 60 18 Z" />
        <path d="M60 18 C 42 36, 28 60, 34 96 L 18 150 L 40 150 L 50 110 C 58 86, 68 60, 60 18 Z" opacity="0.85" />
      </g>
    </svg>
  )
}
