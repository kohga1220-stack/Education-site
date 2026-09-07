'use client'

import { CATEGORIES, type CategoryId } from '@/types/term'
import { CATEGORY_SOLID_CLASS } from '@/lib/categoryColors'

export default function CategoryFilter({
  selected,
  onChange,
}: {
  selected: CategoryId | null
  onChange: (category: CategoryId | null) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
          selected === null
            ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
        }`}
      >
        すべてのカテゴリ
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onChange(selected === cat.id ? null : cat.id)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
            selected === cat.id
              ? CATEGORY_SOLID_CLASS[cat.id]
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
