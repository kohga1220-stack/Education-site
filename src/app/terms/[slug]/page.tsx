import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllSlugs, getRelatedTerms, getTermBySlug, getCanonicalTarget } from '@/lib/terms'
import { CATEGORY_MAP } from '@/types/term'
import { CATEGORY_BADGE_CLASS } from '@/lib/categoryColors'
import FavoriteButton from '@/components/FavoriteButton'
import RelatedTerms from '@/components/RelatedTerms'
import Referrers from '@/components/Referrers'
import { getLinker, getReferrers } from '@/lib/linker'
import DiagramRenderer from '@/components/diagrams/DiagramRenderer'
import JsonLd from '@/components/JsonLd'
import { SITE_NAME, absoluteUrl } from '@/lib/site'

function sourceLabel(url: string): string {
  try {
    const u = new URL(url)
    return `${u.hostname.replace(/^www\./, '')}${u.pathname === '/' ? '' : u.pathname}`
  } catch {
    return url
  }
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const term = getTermBySlug(params.slug)
  if (!term) return {}
  return {
    title: `${term.title}（${term.reading}）とは | わかる！教育学用語`,
    description: term.summary,
    alternates: { canonical: absoluteUrl(`terms/${term.slug}`) },
    openGraph: {
      title: `${term.title}（${term.reading}）とは`,
      description: term.summary,
      type: 'article',
      url: absoluteUrl(`terms/${term.slug}`),
      siteName: SITE_NAME,
      locale: 'ja_JP',
    },
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
  const linker = getLinker()
  const linked = new Set<string>() // 同じ用語へのリンクは本文全体で最初の1回だけ
  const referrers = getReferrers(term)

  const url = absoluteUrl(`terms/${term.slug}`)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DefinedTerm',
        '@id': `${url}#term`,
        name: term.title,
        alternateName: term.reading,
        description: term.summary,
        url,
        inLanguage: 'ja',
        keywords: term.tags.join(', '),
        ...(term.sources?.length ? { citation: term.sources } : {}),
        inDefinedTermSet: { '@type': 'DefinedTermSet', name: SITE_NAME, url: absoluteUrl('') },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '用語一覧', item: absoluteUrl('') },
          { '@type': 'ListItem', position: 2, name: term.title, item: url },
        ],
      },
    ],
  }

  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-6">
      <JsonLd data={jsonLd} />
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
          <p key={i}>
            {linker.link(p, term.slug, Math.max(0, 10 - linked.size), linked).map((seg, j) =>
              seg.slug ? (
                <Link
                  key={j}
                  href={`/terms/${seg.slug}`}
                  className="text-primary-700 underline decoration-primary-300 underline-offset-2 hover:decoration-primary-600 dark:text-primary-300"
                >
                  {seg.text}
                </Link>
              ) : (
                <span key={j}>{seg.text}</span>
              ),
            )}
          </p>
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

      {term.sources && term.sources.length > 0 && (
        <section className="rounded-lg border border-slate-200 p-4 text-sm dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">参考にした資料</h2>
          <ul className="mt-2 flex flex-col gap-1.5">
            {term.sources.map((u) => (
              <li key={u}>
                <a
                  href={u}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-primary-700 underline-offset-2 hover:underline dark:text-primary-300"
                >
                  {sourceLabel(u)}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            リンク先が存在し、本文に用語名が書かれていることを自動で確認しています。内容の正しさを保証するものではありません。
          </p>
        </section>
      )}

      <RelatedTerms terms={related} />
      <Referrers terms={referrers} />
    </article>
  )
}
