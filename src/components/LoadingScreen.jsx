export default function LoadingScreen({ label = 'Loading trial data…' }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-white"></div>
        <p className="text-sm text-zinc-400">{label}</p>
      </div>
    </div>
  )
}
