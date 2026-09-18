import { terms, normalizeKana } from '@/data/terms'
import type { CategoryId, Term } from '@/types/term'

export function getAllTerms(): Term[] {
  return terms
}

export function getTermBySlug(slug: string): Term | undefined {
  return terms.find((t) => t.slug === slug)
}

export function getAllSlugs(): string[] {
  return terms.map((t) => t.slug)
}

export function getRelatedTerms(term: Term): Term[] {
  return term.relatedSlugs
    .map((slug) => getTermBySlug(slug))
    .filter((t): t is Term => Boolean(t))
}

export function getTermsByCategory(category: CategoryId): Term[] {
  return terms
    .filter((t) => t.categories.includes(category))
    .sort((a, b) => a.reading.localeCompare(b.reading, 'ja'))
}

export function getCanonicalTarget(term: Term): Term {
  if (term.isCanonical || !term.canonicalSlug) return term
  return getTermBySlug(term.canonicalSlug) ?? term
}

export function searchTerms(query: string): Term[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return terms.filter((t) => {
    return (
      t.title.toLowerCase().includes(q) ||
      t.reading.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
    )
  })
}

export function filterTerms(
  allTerms: Term[],
  {
    query,
    category,
    kanaRow,
  }: { query?: string; category?: CategoryId | null; kanaRow?: string[] | null }
): Term[] {
  let result = allTerms

  if (query && query.trim()) {
    const q = query.trim().toLowerCase()
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.reading.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    )
  }

  if (category) {
    result = result.filter((t) => t.categories.includes(category))
  }

  if (kanaRow && kanaRow.length > 0) {
    result = result.filter((t) => {
      const k = normalizeKana(t.kana)
      return kanaRow.includes(k) || kanaRow.includes(t.kana)
    })
  }

  return result
}

export function sortByReading(list: Term[]): Term[] {
  return [...list].sort((a, b) => a.reading.localeCompare(b.reading, 'ja'))
}
