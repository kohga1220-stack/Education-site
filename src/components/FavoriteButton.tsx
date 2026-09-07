'use client'

import { useEffect, useState } from 'react'
import { dispatchFavoritesChanged, isFavorite, toggleFavorite } from '@/lib/favorites'

export default function FavoriteButton({
  slug,
  size = 'md',
}: {
  slug: string
  size?: 'sm' | 'md'
}) {
  const [active, setActive] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setActive(isFavorite(slug))
  }, [slug])

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const next = toggleFavorite(slug)
    setActive(next.includes(slug))
    dispatchFavoritesChanged()
  }

  const dim = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? 'お気に入りから外す' : 'お気に入りに追加する'}
      className="inline-flex items-center justify-center rounded-full p-1.5 text-slate-400 transition hover:bg-amber-50 hover:text-amber-500 dark:text-slate-500 dark:hover:bg-amber-900/30 dark:hover:text-amber-400"
      suppressHydrationWarning
    >
      <svg
        viewBox="0 0 24 24"
        className={dim}
        fill={mounted && active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={1.8}
        style={mounted && active ? { color: '#f59e0b' } : undefined}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385c.117.487-.415.87-.842.61l-4.725-2.885a.563.563 0 00-.586 0L6.98 20.539c-.427.26-.96-.123-.842-.61l1.285-5.385a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      </svg>
    </button>
  )
}
