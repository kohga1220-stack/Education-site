import { terms } from '@/data/terms'
import { Linker } from './autolink'
import type { Term } from '@/types/term'

let cached: Linker | null = null

/** 全用語から作る本文リンクの部品(ビルド中に一度だけ作る) */
export function getLinker(): Linker {
  if (!cached) cached = new Linker(terms)
  return cached
}

let inboundCache: Map<string, string[]> | null = null

function relatedInbound(): Map<string, string[]> {
  if (!inboundCache) {
    const m = new Map<string, string[]>()
    for (const t of terms) {
      for (const s of t.relatedSlugs) m.set(s, [...(m.get(s) ?? []), t.slug])
    }
    inboundCache = m
  }
  return inboundCache
}

/** この用語を参照している用語(関連用語として挙げている語 + 本文で言及している語)。自分の関連用語に既にある語は除く */
export function getReferrers(term: Term): Term[] {
  const bySlug = new Map(terms.map((t) => [t.slug, t]))
  const slugs = new Set<string>(relatedInbound().get(term.slug) ?? [])
  getLinker().mentionedBy.get(term.slug)?.forEach((s) => slugs.add(s))
  const own = new Set(term.relatedSlugs)
  return Array.from(slugs)
    .filter((s) => s !== term.slug && !own.has(s))
    .map((s) => bySlug.get(s))
    .filter((t): t is Term => Boolean(t))
    .sort((a, b) => a.reading.localeCompare(b.reading, 'ja'))
}
