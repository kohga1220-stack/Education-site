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
