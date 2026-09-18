'use client'

import { KANA_ROWS } from '@/types/term'

export default function KanaIndex({
  selected,
  onChange,
}: {
  selected: string | null
  onChange: (rowLabel: string | null) => void
}) {
  return (
    <div className="scrollbar-thin flex gap-1.5 overflow-x-auto pb-1">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition ${
          selected === null
            ? 'bg-primary-600 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
        }`}
      >
        すべて
      </button>
      {KANA_ROWS.map((row) => (
        <button
          key={row.label}
          type="button"
          onClick={() => onChange(selected === row.label ? null : row.label)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition ${
            selected === row.label
              ? 'bg-primary-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          {row.label}
        </button>
      ))}
    </div>
  )
}
