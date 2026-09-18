import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CATEGORIES, CATEGORY_MAP, type CategoryId } from '@/types/term'
import { getTermsByCategory } from '@/lib/terms'
import { CATEGORY_BADGE_CLASS } from '@/lib/categoryColors'
import TermCard from '@/components/TermCard'

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.id }))
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const cat = CATEGORY_MAP[params.category as CategoryId]
  if (!cat) return {}
  return {
    title: `${cat.label}の用語一覧 | わかる！教育学用語`,
    description: `教育学の用語集「わかる！教育学用語」における「${cat.label}」カテゴリの用語一覧です。`,
  }
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const cat = CATEGORY_MAP[params.category as CategoryId]
  if (!cat) notFound()

  const terms = getTermsByCategory(cat.id)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <nav className="mb-3 text-xs text-slate-400 dark:text-slate-500">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">
            用語一覧
          </Link>
          <span className="mx-1.5">/</span>
          <span>{cat.label}</span>
        </nav>
        <div className="flex items-center gap-2">
          <span className={`category-badge ${CATEGORY_BADGE_CLASS[cat.id]}`}>{cat.label}</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">{terms.length}語</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {terms.map((term) => (
          <TermCard key={term.slug} term={term} />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-6 dark:border-slate-800">
        {CATEGORIES.filter((c) => c.id !== cat.id).map((c) => (
          <Link
            key={c.id}
            href={`/categories/${c.id}`}
            className={`category-badge ${CATEGORY_BADGE_CLASS[c.id]} opacity-80 hover:opacity-100`}
          >
            {c.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
