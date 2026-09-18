import Link from 'next/link'
import type { Term } from '@/types/term'

export default function RelatedTerms({ terms }: { terms: Term[] }) {
  if (terms.length === 0) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
      <h2 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">関連用語</h2>
      <ul className="flex flex-wrap gap-2">
        {terms.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/terms/${t.slug}`}
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-primary-400 hover:text-primary-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:text-primary-400"
            >
              {t.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
