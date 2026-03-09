// src/components/layout/Header.tsx
interface HeaderProps {
  title: string
  className?: string
}

export function Header({ title, className = '' }: HeaderProps) {
  return (
    <header
      className={`sticky top-0 z-40 bg-slate-900/80 backdrop-blur border-b border-slate-800 ${className}`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="px-4 py-3">
        <h1 className="text-lg font-semibold text-slate-100">{title}</h1>
      </div>
    </header>
  )
}
