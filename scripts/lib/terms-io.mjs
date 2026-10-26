// 用語データ(src/data/terms/*.ts)の読み書きと、kana・読みの正規化ルールを集約する。
// validate-terms.mjs と ingest-terms.mjs の両方がここを使う。
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(HERE, '..', '..')
export const TERMS_DIR = path.join(ROOT, 'src', 'data', 'terms')
export const DATA_DIR = path.join(ROOT, 'scripts', 'data')

// src/types/term.ts の CategoryId と一致させること(ファイル名 = カテゴリID)
export const CATEGORY_IDS = [
  'philosophy', 'psychology', 'methods', 'system', 'special', 'moral', 'evaluation',
  'sociology', 'guidance', 'ict', 'comparative', 'history', 'early-childhood', 'higher-ed',
]

export const readSet = (file) => new Set([...fs.readFileSync(path.join(DATA_DIR, file), 'utf8')])

const DAKUTEN = 'がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽゔ'
const SEION = 'かきくけこさしすせそたちつてとはひふへほはひふへほう'
const SMALL = 'ぁぃぅぇぉっゃゅょゎ'
const SMALL_BIG = 'あいうえおつやゆよわ'

export const kataToHira = (s) =>
  [...s].map((c) => (c >= 'ァ' && c <= 'ヶ' ? String.fromCharCode(c.charCodeAt(0) - 0x60) : c)).join('')

/** 五十音インデックス用の kana を決める。英字始まりの題名は 'A–Z'、それ以外は読みの先頭1文字(清音化)。 */
export function computeKana(title, reading) {
  if (/^[A-Za-zＡ-Ｚａ-ｚ]/.test(title)) return 'A–Z'
  let c = kataToHira(reading)[0] ?? ''
  const i = DAKUTEN.indexOf(c)
  if (i >= 0) c = SEION[i]
  const j = SMALL.indexOf(c)
  if (j >= 0) c = SMALL_BIG[j]
  return c
}

/** .ts ファイルから Term[] を取り出す(型注釈とimportを外してVMで評価) */
export function loadCategoryFile(cat) {
  const file = path.join(TERMS_DIR, `${cat}.ts`)
  let src = fs.readFileSync(file, 'utf8')
  src = src.replace(/^import type.*\n\n?/, '').replace(/^export const \w+Terms: Term\[\] = /, '')
  const terms = vm.runInNewContext(`(${src.trim()})`)
  return { file, terms }
}

export function loadAllTerms() {
  const all = []
  for (const cat of CATEGORY_IDS) {
    const { terms } = loadCategoryFile(cat)
    for (const t of terms) all.push({ ...t, __file: cat })
  }
  return all
}

const js = JSON.stringify
const arr = (a) => '[' + a.map(js).join(', ') + ']'

/** 既存 .ts と同じ体裁で1語分を出力する(diagram があれば含める) */
export function serializeTerm(t) {
  const lines = [
    '  {',
    `    slug: ${js(t.slug)},`,
    `    title: ${js(t.title)},`,
    `    reading: ${js(t.reading)},`,
    `    kana: ${js(t.kana)},`,
    `    categories: ${arr(t.categories)},`,
    `    summary:`,
    `      ${js(t.summary)},`,
    `    body: ${js(t.body)},`,
    `    relatedSlugs: ${arr(t.relatedSlugs ?? [])},`,
    `    isCanonical: true,`,
  ]
  if (t.diagram) {
    const d = t.diagram
    lines.push(
      '    diagram: {',
      `      type: ${js(d.type)},`,
      `      title: ${js(d.title)},`,
      '      items: [',
      ...d.items.map((i) => `        { label: ${js(i.label)}, desc: ${js(i.desc)} },`),
      '      ],',
      '    },',
    )
  }
  lines.push(`    tags: ${arr(t.tags ?? [])},`, '  },')
  return lines.join('\n')
}

/** カテゴリの .ts 末尾に追記する(UTF-8のまま・全角文字を壊さない) */
export function appendToCategory(cat, terms) {
  const file = path.join(TERMS_DIR, `${cat}.ts`)
  const src = fs.readFileSync(file, 'utf8')
  const i = src.lastIndexOf('\n]')
  if (i < 0) throw new Error(`${file}: 配列の終端 "]" が見つかりません`)
  const next = src.slice(0, i) + '\n' + terms.map(serializeTerm).join('\n') + '\n]' + src.slice(i + 2)
  fs.writeFileSync(file, next, 'utf8')
}

/** カテゴリの .ts を全面的に書き直す(既存項目の編集・削除用) */
export function writeCategory(cat, terms) {
  const file = path.join(TERMS_DIR, `${cat}.ts`)
  const src = fs.readFileSync(file, 'utf8')
  const head = src.slice(0, src.indexOf('[\n') + 2)
  fs.writeFileSync(file, head + terms.map(serializeTerm).join('\n') + '\n]\n', 'utf8')
}

// ---- 類似題名の検出(重複登録の防止) ----
const stripParen = (s) => s.replace(/[（(][^）)]*[）)]/g, '')
/** 比較用の題名: 全角半角を統一し、括弧書き・空白・記号を除く */
export const titleCore = (title) =>
  stripParen(title.normalize('NFKC')).replace(/[\s、。・･「」『』\-ー]/g, '')
const bigrams = (s) => {
  const o = new Set()
  for (let i = 0; i < s.length - 1; i++) o.add(s.slice(i, i + 2))
  return o
}
const jaccard = (a, b) => {
  let n = 0
  for (const x of a) if (b.has(x)) n++
  return n / (a.size + b.size - n || 1)
}
const readingCore = (r) => stripParen(r.normalize('NFKC')).replace(/[・ー\s]/g, '')

/**
 * 既存の用語(配列)と比べ、重複の疑いを返す。
 *   level 'reject': 題名が同じ(括弧書き・全角半角・記号を除く)。同一概念の二重登録。例外なし
 *   level 'review': 読みが同じ / 題名が既存の語を含む(長さの差8字以内) / 題名が似ている(類似度0.6以上)。
 *                   別の用語である理由を入力 JSON の distinctFrom に書いた場合だけ通す
 *   level 'warn'  : 題名が既存の語を含む(差が大きい)/ やや似ている。情報表示のみ
 * 戻り値: { level, other(既存項目), reason } または null(最も強い一致を返す)
 */
const RANK = { reject: 3, review: 2, warn: 1 }
export function findSimilar(term, existing) {
  const core = titleCore(term.title)
  const rd = readingCore(term.reading)
  const bg = bigrams(core)
  let best = null
  const take = (level, other, reason) => {
    if (!best || RANK[level] > RANK[best.level]) best = { level, other, reason }
  }
  for (const o of existing) {
    if (o.slug === term.slug) continue
    const oc = titleCore(o.title)
    if (!oc || !core) continue
    if (oc === core) return { level: 'reject', other: o, reason: '題名が同じ(括弧書き等を除く)' }
    if (rd && rd === readingCore(o.reading)) take('review', o, '読みが同じ')
    const contained = Math.min(oc.length, core.length) >= 4 && (oc.includes(core) || core.includes(oc))
    const diff = Math.abs(oc.length - core.length)
    const sim = jaccard(bg, bigrams(oc))
    if (contained && diff <= 8) take('review', o, '題名が既存の語を含む(言い換え・小変更の疑い)')
    else if (sim >= 0.6) take('review', o, `題名が似ている(類似度${sim.toFixed(2)})`)
    else if (contained) take('warn', o, '題名が既存の語を含む(細分化の疑い)')
    else if (sim >= 0.5) take('warn', o, `題名がやや似ている(類似度${sim.toFixed(2)})`)
  }
  return best
}
