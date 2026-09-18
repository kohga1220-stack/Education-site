import type { DiagramData } from '@/types/term'

export default function PyramidDiagram({ diagram }: { diagram: DiagramData }) {
  const n = diagram.items.length
  return (
    <div className="not-prose my-2">
      {diagram.title && (
        <p className="mb-3 text-sm font-bold text-slate-600 dark:text-slate-300">{diagram.title}</p>
      )}
      <div className="flex flex-col items-center gap-1">
        {diagram.items.map((item, i) => {
          const widthPct = 30 + (i / Math.max(n - 1, 1)) * 60
          return (
            <div
              key={item.label}
              style={{ width: `${widthPct}%` }}
              className="flex min-h-[3rem] flex-col items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-center text-white shadow-sm"
            >
              <span className="text-sm font-bold leading-tight">{item.label}</span>
              {item.desc && <span className="mt-0.5 text-[11px] text-primary-100">{item.desc}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
