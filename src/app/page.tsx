import Link from 'next/link'
import { getAllTerms } from '@/lib/terms'
import { CATEGORIES } from '@/types/term'
import { CATEGORY_BADGE_CLASS } from '@/lib/categoryColors'
import TermExplorer from '@/components/TermExplorer'

export default function HomePage() {
  const allTerms = getAllTerms()

  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-10 text-white sm:px-10 sm:py-14">
        <h1 className="text-2xl font-bold sm:text-3xl">わかる！教育学用語</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-primary-100 sm:text-base">
          教育学の基礎用語を、初学者や教育関係者でなくてもしっかわかるように、それでいて学術的に濃い内容で解説する用語集です。
          教育思想・教育心理学・教授法・教育制度・特別支援教育など、{allTerms.length}語の用語を五十音・カテゴリ・検索から探せます。
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.id}`}
              className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-white/25 sm:text-sm"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <TermExplorer allTerms={allTerms} />
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.id}`}
            className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-center transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/60"
          >
            <span className={`category-badge ${CATEGORY_BADGE_CLASS[cat.id]}`}>{cat.label}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {allTerms.filter((t) => t.categories.includes(cat.id)).length}語
            </span>
          </Link>
        ))}
      </section>
    </div>
  )
}
