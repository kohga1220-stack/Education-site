export type CategoryId =
  | 'philosophy'
  | 'psychology'
  | 'methods'
  | 'system'
  | 'special'
  | 'moral'
  | 'evaluation'
  | 'sociology'
  | 'guidance'
  | 'ict'

export interface Category {
  id: CategoryId
  label: string
  color: string
}

export type DiagramType = 'pyramid' | 'concentric' | 'columns' | 'none'

export interface DiagramData {
  type: DiagramType
  title?: string
  items: { label: string; desc?: string }[]
}

export interface Term {
  slug: string
  title: string
  reading: string
  kana: string
  categories: CategoryId[]
  summary: string
  body: string
  relatedSlugs: string[]
  isCanonical: boolean
  canonicalSlug?: string
  diagram?: DiagramData
  tags: string[]
}

export const CATEGORIES: Category[] = [
  { id: 'philosophy', label: '教育思想・哲学', color: 'violet' },
  { id: 'psychology', label: '教育心理学', color: 'blue' },
  { id: 'methods', label: '教授法・学習指導', color: 'sky' },
  { id: 'system', label: '教育制度・政策', color: 'teal' },
  { id: 'special', label: '特別支援教育', color: 'emerald' },
  { id: 'moral', label: '道徳・人格教育', color: 'amber' },
  { id: 'evaluation', label: '教育評価・測定', color: 'orange' },
  { id: 'sociology', label: '教育社会学', color: 'rose' },
  { id: 'guidance', label: '生徒指導・相談', color: 'pink' },
  { id: 'ict', label: 'ICT・現代的課題', color: 'indigo' },
]

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
) as Record<CategoryId, Category>

export const KANA_ROWS: { label: string; kana: string[] }[] = [
  { label: 'あ行', kana: ['あ', 'い', 'う', 'え', 'お'] },
  { label: 'か行', kana: ['か', 'き', 'く', 'け', 'こ'] },
  { label: 'さ行', kana: ['さ', 'し', 'す', 'せ', 'そ'] },
  { label: 'た行', kana: ['た', 'ち', 'つ', 'て', 'と'] },
  { label: 'な行', kana: ['な', 'に', 'ぬ', 'ね', 'の'] },
  { label: 'は行', kana: ['は', 'ひ', 'ふ', 'へ', 'ほ'] },
  { label: 'ま行', kana: ['ま', 'み', 'む', 'め', 'も'] },
  { label: 'や行', kana: ['や', 'ゆ', 'よ'] },
  { label: 'ら行', kana: ['ら', 'り', 'る', 'れ', 'ろ'] },
  { label: 'わ行', kana: ['わ', 'を', 'ん'] },
  { label: 'A–Z', kana: ['A–Z'] },
]
