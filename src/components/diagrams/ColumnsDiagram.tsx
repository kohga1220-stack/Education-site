import type { DiagramData } from '@/types/term'

export default function ColumnsDiagram({ diagram }: { diagram: DiagramData }) {
  return (
    <div className="not-prose my-2">
      {diagram.title && (
        <p className="mb-3 text-sm font-bold text-slate-600 dark:text-slate-300">{diagram.title}</p>
      )}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.min(diagram.items.length, 4)}, minmax(0, 1fr))` }}
      >
        {diagram.items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center rounded-lg border border-primary-200 bg-primary-50 p-3 text-center dark:border-primary-800 dark:bg-primary-900/20"
          >
            <span className="whitespace-pre-line text-sm font-bold leading-tight text-primary-800 dark:text-primary-200">
              {item.label}
            </span>
            {item.desc && (
              <span className="mt-1.5 text-[11px] leading-snug text-slate-600 dark:text-slate-400">
                {item.desc}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
