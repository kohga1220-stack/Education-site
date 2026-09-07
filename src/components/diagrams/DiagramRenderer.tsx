import type { DiagramData } from '@/types/term'
import PyramidDiagram from './PyramidDiagram'
import ConcentricDiagram from './ConcentricDiagram'
import ColumnsDiagram from './ColumnsDiagram'

export default function DiagramRenderer({ diagram }: { diagram?: DiagramData }) {
  if (!diagram || diagram.type === 'none') return null

  switch (diagram.type) {
    case 'pyramid':
      return <PyramidDiagram diagram={diagram} />
    case 'concentric':
      return <ConcentricDiagram diagram={diagram} />
    case 'columns':
      return <ColumnsDiagram diagram={diagram} />
    default:
      return null
  }
}
