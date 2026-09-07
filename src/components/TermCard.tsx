import Link from 'next/link'
import type { Term } from '@/types/term'
import { CATEGORY_MAP } from '@/types/term'
import { CATEGORY_BADGE_CLASS } from '@/lib/categoryColors'
import FavoriteButton from './FavoriteButton'

export default function TermCard({ term }: { term: Term }) {
  return (
    <Link
      href={`/terms/${term.slug}`}
      className="group flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/60 dark:hover:border-primary-700"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">{term.reading}</p>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-400">
            {term.title}
          </h3>
        </div>
        <FavoriteButton slug={term.slug} size="sm" />
      </div>
      <p className="line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {term.summary}
      </p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {term.categories.map((c) => (
          <span key={c} className={`category-badge ${CATEGORY_BADGE_CLASS[c]}`}>
            {CATEGORY_MAP[c].label}
          </span>
        ))}
      </div>
    </Link>
  )
}
