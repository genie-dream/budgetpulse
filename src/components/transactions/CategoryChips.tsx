'use client'
import { useEffect, useRef } from 'react'
import type { Category } from '@/types'
import { CATEGORIES } from '@/lib/constants'

interface CategoryChipsProps {
  categories?: typeof CATEGORIES
  selected: Category | 'all'
  onSelect: (id: Category | 'all') => void
  showAll?: boolean
}

export function CategoryChips({
  categories = CATEGORIES,
  selected,
  onSelect,
  showAll = false,
}: CategoryChipsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const el = container?.querySelector<HTMLButtonElement>('[data-selected="true"]')
    if (!container || !el) return
    const containerRect = container.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    if (elRect.left < containerRect.left) {
      container.scrollLeft -= containerRect.left - elRect.left
    }
  }, [selected])

  return (
    <div ref={containerRef} className="flex overflow-x-auto gap-2 px-4 py-3 scrollbar-hide">
      {showAll && (
        <button
          onClick={() => onSelect('all')}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 rounded-full text-sm font-medium min-h-[44px] ${
            selected === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-slate-700 text-slate-300'
          }`}
          data-selected={selected === 'all'}
        >
          All
        </button>
      )}
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          data-selected={selected === cat.id}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 rounded-full text-sm font-medium min-h-[44px] ${
            selected === cat.id
              ? 'bg-blue-500 text-white'
              : 'bg-slate-700 text-slate-300'
          }`}
        >
          <span>{cat.emoji}</span>
          <span>{cat.labelEn}</span>
        </button>
      ))}
    </div>
  )
}
