import Link from 'next/link'
import type { Term } from '@/types/term'

const SHOWN = 12

export default function Referrers({ terms }: { terms: Term[] }) {
  if (terms.length === 0) return null
  const shown = terms.slice(0, SHOWN)
  const rest = terms.length - shown.length

  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <h2 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">この用語を参照している用語</h2>
      <ul className="flex flex-wrap gap-2">
        {shown.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/terms/${t.slug}`}
              className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:border-primary-400 hover:text-primary-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-600 dark:hover:text-primary-400"
            >
              {t.title}
            </Link>
          </li>
        ))}
      </ul>
      {rest > 0 && <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">ほか{rest}語</p>}
    </div>
  )
}
