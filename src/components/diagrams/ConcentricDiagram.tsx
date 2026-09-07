import type { DiagramData } from '@/types/term'

const RING_CLASSES = [
  'bg-primary-100 dark:bg-primary-900/30',
  'bg-primary-300 dark:bg-primary-800/50',
  'bg-primary-600',
]
const RING_TEXT = [
  'text-primary-900 dark:text-primary-100',
  'text-primary-900 dark:text-white',
  'text-white',
]

export default function ConcentricDiagram({ diagram }: { diagram: DiagramData }) {
  const items = diagram.items
  const sizes = [100, 68, 36]

  return (
    <div className="not-prose my-2">
      {diagram.title && (
        <p className="mb-3 text-sm font-bold text-slate-600 dark:text-slate-300">{diagram.title}</p>
      )}
      <div className="relative mx-auto flex aspect-square w-full max-w-xs items-center justify-center">
        {items.map((item, i) => (
          <div
            key={item.label}
            style={{ width: `${sizes[i] ?? 100}%`, height: `${sizes[i] ?? 100}%` }}
            className={`absolute flex items-center justify-center rounded-full ${RING_CLASSES[i % RING_CLASSES.length]}`}
          >
            {i === items.length - 1 && (
              <span
                className={`max-w-[70%] text-center text-xs font-bold leading-tight sm:text-sm ${RING_TEXT[i % RING_TEXT.length]}`}
              >
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>
      <ul className="mx-auto mt-4 max-w-xs space-y-1.5">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${RING_CLASSES[i % RING_CLASSES.length]}`} />
            <span>
              <strong className="font-semibold text-slate-800 dark:text-slate-100">{item.label}</strong>
              {item.desc ? `：${item.desc}` : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
