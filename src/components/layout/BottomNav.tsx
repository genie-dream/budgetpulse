'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, History, BarChart2, Settings } from 'lucide-react'

const tabs = [
  { href: '/',             icon: Home,      label: 'Home',      isFab: false },
  { href: '/transactions', icon: History,   label: 'History',   isFab: false },
  { href: '/add',          icon: Plus,      label: 'Add',       isFab: true  },
  { href: '/analytics',    icon: BarChart2, label: 'Analytics', isFab: false },
  { href: '/settings',     icon: Settings,  label: 'Settings',  isFab: false },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Main navigation"
    >
      <div className="flex items-end justify-around h-16 px-2">
        {tabs.map(({ href, icon: Icon, label, isFab }) =>
          isFab ? (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className="relative -top-5 flex-shrink-0"
            >
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-500 shadow-lg shadow-blue-500/25 ring-4 ring-slate-800 active:bg-blue-600 transition-colors">
                <Icon className="w-6 h-6 text-white" aria-hidden="true" />
              </span>
              <span className="sr-only">{label}</span>
            </Link>
          ) : (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 text-xs min-w-[44px] min-h-[44px] justify-center transition-colors ${
                pathname === href ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          )
        )}
      </div>
    </nav>
  )
}
