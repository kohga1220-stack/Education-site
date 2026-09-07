'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CategoryId, Term } from '@/types/term'
import { KANA_ROWS } from '@/types/term'
import { filterTerms, sortByReading } from '@/lib/terms'
import { FAVORITES_EVENT, getFavorites } from '@/lib/favorites'
import SearchBar from './SearchBar'
import KanaIndex from './KanaIndex'
import CategoryFilter from './CategoryFilter'
import TermCard from './TermCard'

export default function TermExplorer({ allTerms }: { allTerms: Term[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryId | null>(null)
  const [kanaRowLabel, setKanaRowLabel] = useState<string | null>(null)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    setFavorites(getFavorites())
    const handler = () => setFavorites(getFavorites())
    window.addEventListener(FAVORITES_EVENT, handler)
    return () => window.removeEventListener(FAVORITES_EVENT, handler)
  }, [])

  const kanaRow = useMemo(() => {
    if (!kanaRowLabel) return null
    return KANA_ROWS.find((r) => r.label === kanaRowLabel)?.kana ?? null
  }, [kanaRowLabel])

  const filtered = useMemo(() => {
    let result = filterTerms(allTerms, { query, category, kanaRow })
    if (favoritesOnly) {
      result = result.filter((t) => favorites.includes(t.slug))
    }
    return sortByReading(result)
  }, [allTerms, query, category, kanaRow, favoritesOnly, favorites])

  return (
    <div className="flex flex-col gap-5">
      <SearchBar value={query} onChange={setQuery} />

      <div className="flex flex-col gap-3">
        <KanaIndex selected={kanaRowLabel} onChange={setKanaRowLabel} />
        <CategoryFilter selected={category} onChange={setCategory} />
        <button
          type="button"
          onClick={() => setFavoritesOnly((v) => !v)}
          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
            favoritesOnly
              ? 'bg-amber-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          <svg viewBox="0 0 24 24" fill={favoritesOnly ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385c.117.487-.415.87-.842.61l-4.725-2.885a.563.563 0 00-.586 0L6.98 20.539c-.427.26-.96-.123-.842-.61l1.285-5.385a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
          お気に入りのみ
        </button>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">{filtered.length}件の用語</p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((term) => (
            <TermCard key={term.slug} term={term} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          条件に一致する用語が見つかりませんでした。
        </p>
      )}
    </div>
  )
}
