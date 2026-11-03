'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CategoryId, TermSummary } from '@/types/term'
import { KANA_ROWS } from '@/types/term'
import { filterTerms, sortByReading } from '@/lib/terms'
import { computeScores, fromIndex, makeSnippet, prepare, type IndexEntry, type PreparedEntry } from '@/lib/search'
import { loadSearchIndex } from '@/lib/searchIndexClient'
import { FAVORITES_EVENT, getFavorites } from '@/lib/favorites'
import SearchBar from './SearchBar'
import KanaIndex from './KanaIndex'
import CategoryFilter from './CategoryFilter'
import TermCard from './TermCard'

const PAGE_SIZE = 60

export default function TermExplorer({ allTerms }: { allTerms: TermSummary[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryId | null>(null)
  const [kanaRowLabel, setKanaRowLabel] = useState<string | null>(null)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [examOnly, setExamOnly] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    setFavorites(getFavorites())
    const handler = () => setFavorites(getFavorites())
    window.addEventListener(FAVORITES_EVENT, handler)
    return () => window.removeEventListener(FAVORITES_EVENT, handler)
  }, [])

  // 絞り込み条件が変わったら表示件数を最初に戻す
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [query, category, kanaRowLabel, favoritesOnly, examOnly])

  const kanaRow = useMemo(() => {
    if (!kanaRowLabel) return null
    return KANA_ROWS.find((r) => r.label === kanaRowLabel)?.kana ?? null
  }, [kanaRowLabel])

  // 全文検索インデックス(本文つき)。最初に検索欄を触ったときに一度だけ読み込む
  const [rawIndex, setRawIndex] = useState<IndexEntry[] | null>(null)
  const [indexError, setIndexError] = useState(false)
  const startLoadingIndex = () => {
    if (rawIndex || indexError) return
    loadSearchIndex()
      .then(setRawIndex)
      .catch(() => setIndexError(true))
  }
  useEffect(() => {
    if (query.trim()) startLoadingIndex()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // 本文が届くまでは、手元の題名・読み・要約・タグだけで検索する
  const localIndex = useMemo<PreparedEntry[]>(
    () => prepare(allTerms.map((t) => ({ slug: t.slug, title: t.title, reading: t.reading, summary: t.summary, tags: t.tags }))),
    [allTerms],
  )
  const fullIndex = useMemo<PreparedEntry[] | null>(() => (rawIndex ? prepare(fromIndex(rawIndex)) : null), [rawIndex])
  const bodyBySlug = useMemo(() => new Map(rawIndex?.map((e) => [e.s, e.b]) ?? []), [rawIndex])

  const scores = useMemo(() => computeScores(fullIndex ?? localIndex, query), [fullIndex, localIndex, query])

  const filtered = useMemo(() => {
    let result = filterTerms(allTerms, { category, kanaRow })
    if (scores) result = result.filter((t) => scores.has(t.slug))
    if (examOnly) result = result.filter((t) => t.exam)
    if (favoritesOnly) {
      result = result.filter((t) => favorites.includes(t.slug))
    }
    if (!scores) return sortByReading(result)
    // 検索中は関連度の高い順(同点は読み順)
    return sortByReading(result).sort((a, b) => (scores.get(b.slug) ?? 0) - (scores.get(a.slug) ?? 0))
  }, [allTerms, scores, category, kanaRow, favoritesOnly, favorites, examOnly])

  // 本文だけに当たった語には、当たった箇所の抜粋を添える
  const snippetFor = (t: TermSummary): string | null => {
    if (!query.trim() || !fullIndex) return null
    const q = query.toLowerCase()
    const head = `${t.title}${t.reading}${t.summary}${t.tags.join('')}`.toLowerCase()
    const tokens = q.split(/[\s\u3000]+/).filter(Boolean)
    if (tokens.every((tok) => head.includes(tok))) return null
    return makeSnippet(bodyBySlug.get(t.slug) ?? '', query)
  }

  return (
    <div className="flex flex-col gap-5">
      <SearchBar value={query} onChange={setQuery} onFocus={startLoadingIndex} />

      <div className="flex flex-col gap-3">
        <KanaIndex selected={kanaRowLabel} onChange={setKanaRowLabel} />
        <CategoryFilter selected={category} onChange={setCategory} />
        <div className="flex flex-wrap gap-2">
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
          <button
            type="button"
            onClick={() => setExamOnly((v) => !v)}
            aria-pressed={examOnly}
            title="教職教養などでまず押さえたい用語として編集部が選んだ語です(出題頻度を調べたものではありません)"
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              examOnly
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            試験の基本語のみ
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        {filtered.length}件の用語
        {query.trim() && !fullIndex && !indexError && '(本文も検索しています…)'}
        {query.trim() && indexError && '(本文の検索データを読み込めなかったため、題名・要約・タグのみで検索しています)'}
        {scores && fullIndex && '(関連度の高い順)'}
      </p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(0, visibleCount).map((term) => (
            <TermCard key={term.slug} term={term} snippet={snippetFor(term)} />
          ))}
        </div>
      ) : null}

      {filtered.length > visibleCount ? (
        <button
          type="button"
          onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
          className="mx-auto rounded-full bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700"
        >
          さらに表示({Math.min(PAGE_SIZE, filtered.length - visibleCount)}件 / 残り{filtered.length - visibleCount}件)
        </button>
      ) : null}

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          条件に一致する用語が見つかりませんでした。
        </p>
      ) : null}
    </div>
  )
}
