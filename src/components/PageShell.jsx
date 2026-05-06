import Header from './Header'

export default function PageShell({ children, headerBand }) {
  return (
    <div className="min-h-screen bg-bg-base text-white">
      <Header />
      {headerBand && (
        <div className="bg-bg-band">
          <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-5">
            {headerBand}
          </div>
        </div>
      )}
      <main className="mx-auto max-w-[1280px] px-6 py-6">{children}</main>
    </div>
  )
}
