// 本文中に出てくる他の用語名を見つけ、リンクにするための部品。依存を持たない(テストしやすくするため)。

export interface LinkableTerm {
  slug: string
  title: string
  body: string
}

export interface Segment {
  text: string
  /** 他の用語へのリンクなら、その slug */
  slug?: string
}

const MIN_NAME = 3
const isAscii = (s: string) => /^[\x20-\x7e]+$/.test(s)

/** 題名から、本文に書かれうる名称を取り出す: 括弧を除いた題名と、括弧書きの別名 */
export function namesOf(title: string): string[] {
  const out = new Set<string>()
  const main = title.replace(/[（(][^）)]*[）)]/g, '').trim()
  // 「学校教育（教育基本法第6条）」のように条文で限定された題名は、括弧の前の語(学校教育)を名称にしない(意味がずれるため)
  const qualifiedByArticle = /[（(][^）)]*第[0-9０-９]+条[^）)]*[）)]/.test(title)
  if (main.length >= MIN_NAME && !qualifiedByArticle) out.add(main)
  for (const m of Array.from(title.matchAll(/[（(]([^）)]+)[）)]/g))) {
    const alias = m[1].trim()
    // 説明的な括弧書き(長い・読点を含む)や、短い略称の取り違えを避ける
    const numericOnly = /^[0-9０-９\s年月日.,\-]+$/.test(alias) // 「（2022）」「（1979年）」のような年号は名称にしない
    if (alias.length >= MIN_NAME && alias.length <= 20 && !numericOnly && !/[、,・等など]/.test(alias)) out.add(alias)
  }
  return Array.from(out)
}

interface NameEntry {
  name: string
  slug: string
}

export class Linker {
  private buckets = new Map<string, NameEntry[]>()
  /** target slug -> その用語に言及している用語の slug の集合 */
  readonly mentionedBy = new Map<string, Set<string>>()

  constructor(terms: LinkableTerm[]) {
    // 名称 -> slug。同じ名称が複数の語に当たる場合は曖昧なので使わない
    const owner = new Map<string, string | null>()
    for (const t of terms) {
      for (const n of namesOf(t.title)) {
        owner.set(n, owner.has(n) && owner.get(n) !== t.slug ? null : t.slug)
      }
    }
    const entries: NameEntry[] = []
    owner.forEach((slug, name) => {
      if (slug) entries.push({ name, slug })
    })
    entries.sort((a, b) => b.name.length - a.name.length) // 長い名称を優先
    for (const e of entries) {
      const key = e.name.slice(0, 2)
      const list = this.buckets.get(key)
      if (list) list.push(e)
      else this.buckets.set(key, [e])
    }
    for (const t of terms) {
      for (const hit of this.scan(t.body, t.slug)) {
        let set = this.mentionedBy.get(hit.slug)
        if (!set) this.mentionedBy.set(hit.slug, (set = new Set()))
        set.add(t.slug)
      }
    }
  }

  /** text の中の用語名を、出現順にすべて返す(自分自身は除く) */
  private scan(text: string, selfSlug: string): { start: number; end: number; slug: string }[] {
    const hits: { start: number; end: number; slug: string }[] = []
    for (let i = 0; i < text.length - 1; ) {
      const list = this.buckets.get(text.slice(i, i + 2))
      let matched = false
      if (list) {
        for (const e of list) {
          if (!text.startsWith(e.name, i)) continue
          if (isAscii(e.name)) {
            const before = text[i - 1]
            const after = text[i + e.name.length]
            if ((before && /[A-Za-z0-9]/.test(before)) || (after && /[A-Za-z0-9]/.test(after))) continue
          }
          if (e.slug !== selfSlug) hits.push({ start: i, end: i + e.name.length, slug: e.slug })
          i += e.name.length
          matched = true
          break
        }
      }
      if (!matched) i++
    }
    return hits
  }

  /** 本文を、リンク部分と通常の文字に分ける。同じ用語へのリンクは最初の1回だけ、1本文で最大 limit 件 */
  link(text: string, selfSlug: string, limit = 10, alreadyLinked: Set<string> = new Set()): Segment[] {
    const segs: Segment[] = []
    let pos = 0
    let n = 0
    for (const h of this.scan(text, selfSlug)) {
      if (n >= limit) break
      if (alreadyLinked.has(h.slug)) continue
      alreadyLinked.add(h.slug)
      if (h.start > pos) segs.push({ text: text.slice(pos, h.start) })
      segs.push({ text: text.slice(h.start, h.end), slug: h.slug })
      pos = h.end
      n++
    }
    if (pos < text.length) segs.push({ text: text.slice(pos) })
    return segs.length ? segs : [{ text }]
  }
}
