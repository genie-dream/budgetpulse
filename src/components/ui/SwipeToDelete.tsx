'use client'

import { useRef, useState, type ReactNode } from 'react'

interface SwipeToDeleteProps {
  children: ReactNode
  onDelete: () => void
  className?: string
}

/**
 * Reusable swipe-to-delete wrapper.
 * Swipe left more than 60px (with horizontal dominance) to reveal delete button.
 * Swipe right resets to closed state. Works on both touch and mouse.
 */
export default function SwipeToDelete({ children, onDelete, className }: SwipeToDeleteProps) {
  const [swiped, setSwiped] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const mouseStartX = useRef(0)
  const isDragging = useRef(false)

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaY = e.changedTouches[0].clientY - touchStartY.current

    // Only activate when horizontal delta dominates and exceeds 60px
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY)
    if (!isHorizontalSwipe) return

    if (deltaX < -60) {
      setSwiped(true)
    } else if (deltaX > 0) {
      setSwiped(false)
    }
  }

  function handleMouseDown(e: React.MouseEvent) {
    mouseStartX.current = e.clientX
    isDragging.current = true
  }

  function handleMouseUp(e: React.MouseEvent) {
    if (!isDragging.current) return
    isDragging.current = false
    const deltaX = e.clientX - mouseStartX.current
    if (deltaX < -60) {
      setSwiped(true)
    } else if (deltaX > 0) {
      setSwiped(false)
    }
  }

  function handleMouseLeave() {
    isDragging.current = false
  }

  function handleDelete() {
    setSwiped(false)
    onDelete()
  }

  return (
    <div
      className={`relative overflow-hidden ${className ?? ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Content wrapper — slides left when swiped */}
      <div
        style={{
          transform: swiped ? 'translateX(-80px)' : 'translateX(0)',
          transition: 'transform 150ms ease',
          willChange: 'transform',
        }}
      >
        {children}
      </div>

      {/* Delete button revealed on swipe */}
      <button
        aria-label="Delete"
        onClick={handleDelete}
        className="absolute right-0 top-0 bottom-0 w-[80px] bg-red-500 text-white text-sm font-medium flex items-center justify-center"
        style={{
          opacity: swiped ? 1 : 0,
          pointerEvents: swiped ? 'auto' : 'none',
          transition: 'opacity 150ms ease',
        }}
      >
        Delete
      </button>
    </div>
  )
}
