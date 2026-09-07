import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllSlugs, getRelatedTerms, getTermBySlug, getCanonicalTarget } from '@/lib/terms'
import { CATEGORY_MAP } from '@/types/term'
import { CATEGORY_BADGE_CLASS } from '@/lib/categoryColors'
import FavoriteButton from '@/components/FavoriteButton'
import RelatedTerms from '@/components/RelatedTerms'
import DiagramRenderer from '@/components/diagrams/DiagramRenderer'

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const term = getTermBySlug(params.slug)
  if (!term) return {}
  return {
    title: `${term.title}（${term.reading}）とは | わかる！教育学用語`,
    description: term.summary,
  }
}

export default function TermPage({ params }: { params: { slug: string } }) {
  const term = getTermBySlug(params.slug)
  if (!term) notFound()

  const canonical = getCanonicalTarget(term)
  const isStub = !term.isCanonical && canonical.slug !== term.slug

  if (isStub) {
    return (
      <article className="mx-auto max-w-2xl">
        <p className="text-xs text-slate-400 dark:text-slate-500">{term.reading}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{term.title}</h1>
        <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">{term.summary}</p>
        <Link
          href={`/terms/${canonical.slug}`}
          className="mt-6 inline-flex items-center gap-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          詳しい解説を見る（{canonical.title}）
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </article>
    )
  }

  const related = getRelatedTerms(term)
  const paragraphs = term.body.split('\n\n')

  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <nav className="mb-3 text-xs text-slate-400 dark:text-slate-500">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">
            用語一覧
          </Link>
          <span className="mx-1.5">/</span>
          <span>{term.title}</span>
        </nav>

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400 dark:text-slate-500">{term.reading}</p>
            <h1 className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              {term.title}
            </h1>
          </div>
          <FavoriteButton slug={term.slug} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {term.categories.map((c) => (
            <Link key={c} href={`/categories/${c}`} className={`category-badge ${CATEGORY_BADGE_CLASS[c]}`}>
              {CATEGORY_MAP[c].label}
            </Link>
          ))}
        </div>

        <p className="mt-4 rounded-lg bg-primary-50 p-4 text-sm leading-relaxed text-primary-900 dark:bg-primary-900/20 dark:text-primary-100">
          {term.summary}
        </p>
      </div>

      <DiagramRenderer diagram={term.diagram} />

      <div className="prose-body text-[15px] text-slate-700 dark:text-slate-300">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {term.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {term.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <RelatedTerms terms={related} />
    </article>
  )
}
