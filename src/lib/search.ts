// 検索の正規化と採点。ブラウザ側(TermExplorer)とテストの両方から使うため、依存を持たない。

/** 表記ゆれを吸収する: 全角半角・大文字小文字・カタカナ/ひらがな・長音・中黒・空白・括弧を同一視する */
export function normalizeText(s: string): string {
  return s
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60)) // カタカナ → ひらがな
    .replace(/ゔ/g, 'ぶ')
    .replace(/[\sー・･、。,.\-－—―()（）「」『』［］\[\]]/g, '')
}

/** public/search-index.json の1件(略記)。scripts/build-search-index.mjs が作る */
export interface IndexEntry {
  s: string // slug
  t: string // 題名
  r: string // 読み
  m: string // 要約
  g: string[] // タグ
  b: string // 本文
}

export interface PreparedEntry {
  slug: string
  title: string
  reading: string
  summary: string
  tags: string[]
  body: string
}

export interface SearchSource {
  slug: string
  title: string
  reading: string
  summary: string
  tags: string[]
  body?: string
}

export function prepare(entries: SearchSource[]): PreparedEntry[] {
  return entries.map((e) => ({
    slug: e.slug,
    title: normalizeText(e.title),
    reading: normalizeText(e.reading),
    summary: normalizeText(e.summary),
    tags: e.tags.map(normalizeText),
    body: normalizeText(e.body ?? ''),
  }))
}

export function fromIndex(entries: IndexEntry[]): SearchSource[] {
  return entries.map((e) => ({ slug: e.s, title: e.t, reading: e.r, summary: e.m, tags: e.g, body: e.b }))
}

/** 検索語を空白(全角含む)で分け、正規化して返す。全ての語を含む語だけがヒットする(AND検索) */
export function tokenize(query: string): string[] {
  return query
    .split(/[\s　]+/)
    .map(normalizeText)
    .filter(Boolean)
}

function countOccurrences(text: string, token: string, max: number): number {
  let n = 0
  let i = text.indexOf(token)
  while (i >= 0 && n < max) {
    n++
    i = text.indexOf(token, i + token.length)
  }
  return n
}

/** 1語に対する得点。題名 > 読み > タグ > 要約 > 本文 の順に高い。当たらなければ 0 */
function scoreToken(e: PreparedEntry, token: string): number {
  let best = 0
  if (e.title === token) best = 1000
  else if (e.title.startsWith(token)) best = 800
  else if (e.title.includes(token)) best = 600
  if (best < 500 && e.reading.startsWith(token)) best = 500
  else if (best < 400 && e.reading.includes(token)) best = 400
  if (best < 350 && e.tags.some((t) => t === token)) best = 350
  else if (best < 250 && e.tags.some((t) => t.includes(token))) best = 250
  if (best < 150 && e.summary.includes(token)) best = 150
  if (best < 60 && token.length >= 2 && e.body) {
    const n = countOccurrences(e.body, token, 5)
    if (n > 0) best = 60 + n * 4
  }
  return best
}

export function scoreEntry(e: PreparedEntry, tokens: string[]): number {
  let total = 0
  for (const token of tokens) {
    const s = scoreToken(e, token)
    if (s === 0) return 0
    total += s
  }
  return total
}

/** 検索語に当たった語だけの得点表(slug → 得点)。検索語が空なら null */
export function computeScores(entries: PreparedEntry[], query: string): Map<string, number> | null {
  const tokens = tokenize(query)
  if (tokens.length === 0) return null
  const scores = new Map<string, number>()
  for (const e of entries) {
    const s = scoreEntry(e, tokens)
    if (s > 0) scores.set(e.slug, s)
  }
  return scores
}

/** 本文だけに当たった場合の抜粋(元の文字列から、検索語の周辺を切り出す)。見つからなければ null */
export function makeSnippet(body: string, query: string, radius = 36): string | null {
  const raw = query.split(/[\s　]+/).filter(Boolean)
  const lower = body.toLowerCase()
  for (const tok of raw) {
    const i = lower.indexOf(tok.toLowerCase())
    if (i < 0) continue
    const start = Math.max(0, i - radius)
    const end = Math.min(body.length, i + tok.length + radius)
    const clip = body.slice(start, end).replace(/\s+/g, ' ')
    return `${start > 0 ? '…' : ''}${clip}${end < body.length ? '…' : ''}`
  }
  return null
}
