export function Header() {
  return (
    <header className="w-full py-12 px-6 text-center border-b-2" style={{ borderColor: 'var(--border)' }}>
      <h1 className="font-display text-6xl md:text-8xl" style={{ color: 'var(--text)' }}>
        Nath & Dai
      </h1>
      <p className="font-body text-sm mt-3 tracking-widest uppercase opacity-60">
        nossas aventuras
      </p>
    </header>
  )
}
