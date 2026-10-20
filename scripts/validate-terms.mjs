// 用語データの検証。`npm run validate` で実行する。
// エラーが1件でもあれば終了コード1。--strict で警告もエラー扱い。
import { CATEGORY_IDS, computeKana, loadAllTerms, readSet } from './lib/terms-io.mjs'

const strict = process.argv.includes('--strict')
const x0213 = readSet('jis-x0213-kanji.txt')
const level1 = readSet('jis-level1-kanji.txt')
const allow = readSet('rare-kanji-allowlist.txt')

const errors = []
const warnings = []
const err = (t, msg) => errors.push(`${t.__file}/${t.slug ?? '(slug不明)'}: ${msg}`)
const warn = (t, msg) => warnings.push(`${t.__file}/${t.slug}: ${msg}`)

const terms = loadAllTerms()
const bySlug = new Map()
const byTitle = new Map()
const byReading = new Map()
const byCore = new Map()

const isStr = (v) => typeof v === 'string' && v.trim() !== ''
const KANJI = /[㐀-䶿一-鿿豈-﫿]/u
const READING_OK = /^[ぁ-ゖー・0-9（）()、]+$/u
const KANA_ROW = new Set([...'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん', 'A–Z'])
const SLUG_OK = /^[a-z0-9]+(-[a-z0-9]+)*$/
const DIAGRAM_TYPES = new Set(['pyramid', 'concentric', 'columns', 'none'])

for (const t of terms) {
  // 必須フィールド
  for (const k of ['slug', 'title', 'reading', 'kana', 'summary', 'body']) {
    if (!isStr(t[k])) err(t, `${k} が空または文字列ではありません`)
  }
  if (!Array.isArray(t.categories) || t.categories.length === 0) err(t, 'categories が空です')
  if (!Array.isArray(t.relatedSlugs)) err(t, 'relatedSlugs が配列ではありません')
  if (!Array.isArray(t.tags)) err(t, 'tags が配列ではありません')
  if (t.isCanonical !== true) err(t, 'isCanonical は true にしてください')
  if (!isStr(t.slug) || !isStr(t.title) || !isStr(t.reading)) continue

  // slug
  if (!SLUG_OK.test(t.slug)) err(t, `slug は小文字英数字とハイフンのみ: "${t.slug}"`)
  if (bySlug.has(t.slug)) err(t, `slug 重複 (${bySlug.get(t.slug).__file})`)
  else bySlug.set(t.slug, t)

  // title / reading
  if (byTitle.has(t.title)) err(t, `title 重複 "${t.title}" (${byTitle.get(t.title).slug})`)
  else byTitle.set(t.title, t)
  if (!READING_OK.test(t.reading)) err(t, `reading はひらがな(と「ー」「・」数字・括弧)のみ: "${t.reading}"`)
  // 括弧書き・全角半角・空白を除いた題名が同じなら重複(例: 「A」と「A(略称)」)
  const core = t.title.normalize('NFKC').replace(/[（(][^）)]*[）)]/g, '').replace(/\s/g, '')
  if (byCore.has(core)) err(t, `題名が実質重複: "${t.title}" ≒ "${byCore.get(core).title}" (${byCore.get(core).slug})`)
  else byCore.set(core, t)
  const rk = t.reading.replace(/[（(][^）)]*[）)]/g, '')
  if (byReading.has(rk)) warn(t, `読みが同じ別項目あり(同概念の二重登録でないか確認): ${byReading.get(rk).slug}`)
  else byReading.set(rk, t)
  for (const [o, c] of [['(', ')'], ['（', '）'], ['「', '」']]) {
    if (t.title.split(o).length !== t.title.split(c).length) err(t, `title の括弧が対応していません: "${t.title}"`)
  }

  // kana
  if (!KANA_ROW.has(t.kana)) err(t, `kana は清音ひらがな1字か 'A–Z': "${t.kana}"`)
  else if (READING_OK.test(t.reading)) {
    const want = computeKana(t.title, t.reading)
    if (t.kana !== want) err(t, `kana が "${want}" であるべき(現在 "${t.kana}")`)
  }

  // categories
  for (const c of t.categories ?? []) if (!CATEGORY_IDS.includes(c)) err(t, `不正なカテゴリID: "${c}"`)
  if (t.categories?.[0] !== t.__file) err(t, `categories[0] は ${t.__file} であるべき(現在 "${t.categories?.[0]}")`)
  if (new Set(t.categories).size !== (t.categories ?? []).length) err(t, 'categories に重複')

  // 本文の品質
  const text = [t.title, t.summary, t.body].join('\n')
  if (isStr(t.summary) && (t.summary.length < 30 || t.summary.length > 220)) warn(t, `summary の長さ ${t.summary.length}字(推奨 30–220)`)
  if (isStr(t.body) && t.body.length < 150) warn(t, `body が短い(${t.body.length}字)`)
  if (/\n{3,}|^\s|\s$/.test(t.body ?? '')) warn(t, 'body の前後・段落間の空行が不正')

  const bad = new Set()
  const rare = new Set()
  for (const ch of text) {
    if (!KANJI.test(ch)) continue
    if (!x0213.has(ch)) bad.add(ch)
    else if (!level1.has(ch) && !allow.has(ch)) rare.add(ch)
  }
  if (bad.size) err(t, `日本語で使わない字(簡体字・異体字の疑い): ${[...bad].join(' ')}`)
  if (rare.size) warn(t, `JIS第1水準外の漢字(誤字でないか確認): ${[...rare].join(' ')}`)
  if (/[぀-ヿ]\s*[,.]\s*[぀-ヿ]/.test(text)) warn(t, '日本語文中に半角の , . を検出')

  // tags / relatedSlugs の形
  for (const tag of t.tags ?? []) if (!isStr(tag)) err(t, 'tags に空要素')
  if (new Set(t.relatedSlugs).size !== (t.relatedSlugs ?? []).length) err(t, 'relatedSlugs に重複')

  // diagram
  if (t.diagram) {
    const d = t.diagram
    if (!DIAGRAM_TYPES.has(d.type)) err(t, `diagram.type が不正: ${d.type}`)
    if (!isStr(d.title) || !Array.isArray(d.items) || d.items.length === 0) err(t, 'diagram の title/items が不正')
  }
}

// 参照整合性(全件読み込み後)
for (const t of terms) {
  for (const s of t.relatedSlugs ?? []) {
    if (s === t.slug) err(t, `relatedSlugs が自分自身: ${s}`)
    else if (!bySlug.has(s)) err(t, `relatedSlugs に存在しない slug: ${s}`)
  }
}

const counts = Object.fromEntries(CATEGORY_IDS.map((c) => [c, terms.filter((t) => t.__file === c).length]))
console.log(`用語数: ${terms.length}`)
console.log(CATEGORY_IDS.map((c) => `${c}=${counts[c]}`).join('  '))
if (warnings.length) {
  console.log(`\n警告 ${warnings.length} 件`)
  for (const w of warnings.slice(0, 80)) console.log('  ⚠ ' + w)
  if (warnings.length > 80) console.log(`  …ほか ${warnings.length - 80} 件`)
}
if (errors.length) {
  console.log(`\nエラー ${errors.length} 件`)
  for (const e of errors.slice(0, 120)) console.log('  ✗ ' + e)
  if (errors.length > 120) console.log(`  …ほか ${errors.length - 120} 件`)
}
const failed = errors.length > 0 || (strict && warnings.length > 0)
console.log(failed ? '\n❌ 検証に失敗しました' : '\n✅ 検証OK')
process.exit(failed ? 1 : 0)
