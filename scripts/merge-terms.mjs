// 二重登録された2語を1語に統合する(Claude Code 用の保守スクリプト)。
//   node scripts/merge-terms.mjs --keep <残す slug> --drop <消す slug> [--dry-run]
// 残す語に、消す語の 副分野・タグ・関連語・出典(5件まで)・試験の基本語フラグ を引き継ぎ、
// 全用語の relatedSlugs の参照を付け替える。本文は残す語のものをそのまま使う(別々の文章を混ぜない)。
// 実行後は npm run validate / npx tsc --noEmit / npm run build を行うこと。
import fs from 'node:fs'
import path from 'node:path'
import { CATEGORY_IDS, ROOT, loadCategoryFile, writeCategory } from './lib/terms-io.mjs'

const args = process.argv.slice(2)
const val = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined }
const KEEP = val('--keep')
const DROP = val('--drop')
const dryRun = args.includes('--dry-run')
if (!KEEP || !DROP || KEEP === DROP) {
  console.error('使い方: node scripts/merge-terms.mjs --keep <slug> --drop <slug> [--dry-run]')
  process.exit(2)
}

const MAX_RELATED = 8
const files = Object.fromEntries(CATEGORY_IDS.map((c) => [c, loadCategoryFile(c).terms]))
const all = CATEGORY_IDS.flatMap((c) => files[c].map((t) => ({ t, c })))
const k = all.find((x) => x.t.slug === KEEP)
const d = all.find((x) => x.t.slug === DROP)
if (!k || !d) {
  console.error(`slug が見つかりません: ${!k ? KEEP : ''} ${!d ? DROP : ''}`)
  process.exit(1)
}
const keep = k.t
const drop = d.t
const uniq = (a) => [...new Set(a)]

keep.categories = uniq([...keep.categories, ...drop.categories])
keep.tags = uniq([...keep.tags, ...drop.tags])
keep.relatedSlugs = uniq([...keep.relatedSlugs, ...drop.relatedSlugs]).filter((s) => s !== KEEP && s !== DROP).slice(0, MAX_RELATED)
const src = uniq([...(keep.sources ?? []), ...(drop.sources ?? [])]).slice(0, 5)
if (src.length) keep.sources = src
if (drop.exam && !keep.exam) keep.exam = true

const touched = new Set([k.c, d.c])
let redirected = 0
for (const c of CATEGORY_IDS) {
  for (const t of files[c]) {
    if (t.slug === DROP) continue
    if (t.relatedSlugs.includes(DROP)) {
      t.relatedSlugs = uniq(t.relatedSlugs.map((s) => (s === DROP ? KEEP : s))).filter((s) => s !== t.slug)
      touched.add(c)
      redirected++
    }
  }
}
files[d.c] = files[d.c].filter((t) => t.slug !== DROP)

// コード・文書にハードコードされた slug の確認
const hits = []
for (const dir of ['src', 'scripts', 'docs', '.github']) {
  const walk = (p) => {
    for (const e of fs.readdirSync(p, { withFileTypes: true })) {
      const f = path.join(p, e.name)
      if (e.isDirectory()) walk(f)
      else if (/\.(ts|tsx|mjs|md|yml|json)$/.test(e.name) && !f.includes(`${path.sep}data${path.sep}terms${path.sep}`)) {
        if (fs.readFileSync(f, 'utf8').includes(DROP)) hits.push(path.relative(ROOT, f))
      }
    }
  }
  walk(path.join(ROOT, dir))
}

console.log(`統合: 「${drop.title}」(${DROP}) → 「${keep.title}」(${KEEP})`)
console.log(`  分野: ${keep.categories.join(',')} / タグ: ${keep.tags.length}件 / 関連: ${keep.relatedSlugs.length}件 / 出典: ${keep.sources?.length ?? 0}件${keep.exam ? ' / 試験の基本語' : ''}`)
console.log(`  参照の付け替え: ${redirected}件`)
if (hits.length) console.log(`  ⚠ 消す slug が書かれているファイル(要確認): ${hits.join(', ')}`)
if (dryRun) { console.log('(--dry-run: 書き込んでいません)'); process.exit(0) }
for (const c of touched) writeCategory(c, files[c])
console.log('書き込みました。npm run validate を実行してください。')
