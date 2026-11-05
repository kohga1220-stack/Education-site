// 出典(sources)の自動確認。`node scripts/verify-sources.mjs --base origin/main`(PRで追加・変更された語だけ)
//   --all            全語の出典を確認
//   --slug a,b       指定した語だけ
// 1件でも 404 や「本文に用語名がない」出典があれば終了コード1。接続できない場合は警告のみ(確認できなかったと表示)。
import { execSync } from 'node:child_process'
import { CATEGORY_IDS, loadAllTerms, parseTermsSource } from './lib/terms-io.mjs'
import { keywordsFor, verifyUrl } from './lib/verify-url.mjs'

const args = process.argv.slice(2)
const val = (flag) => {
  const i = args.indexOf(flag)
  return i >= 0 ? args[i + 1] : undefined
}
const base = val('--base')
const only = val('--slug')?.split(',')
const all = args.includes('--all')

const terms = loadAllTerms().filter((t) => t.sources?.length)

// --base: 基準ブランチと比べて sources が追加・変更された語だけを対象にする
const baseSources = new Map()
if (base && !all) {
  for (const c of CATEGORY_IDS) {
    try {
      const src = execSync(`git show ${base}:src/data/terms/${c}.ts`, { encoding: 'utf8', maxBuffer: 1 << 28 })
      for (const t of parseTermsSource(src)) baseSources.set(t.slug, JSON.stringify(t.sources ?? []))
    } catch {
      /* 基準側にファイルがない場合は全て新規扱い */
    }
  }
}

const targets = terms.filter((t) => {
  if (only) return only.includes(t.slug)
  if (all || !base) return true
  return baseSources.get(t.slug) !== JSON.stringify(t.sources)
})

if (targets.length === 0) {
  console.log('確認対象の出典はありません。')
  process.exit(0)
}

const jobs = targets.flatMap((t) => t.sources.map((url) => ({ t, url })))
console.log(`出典の確認: ${targets.length}語 / ${jobs.length}件のURL\n`)

const results = []
const CONCURRENCY = 4
let next = 0
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < jobs.length) {
      const { t, url } = jobs[next++]
      const r = await verifyUrl(url, keywordsFor(t))
      results.push({ slug: t.slug, title: t.title, url, ...r })
    }
  }),
)

const icon = { ok: '✅', warn: '⚠', fail: '✗' }
results.sort((a, b) => a.slug.localeCompare(b.slug))
// 資料の実際の題名も出す。語の定義の根拠になる資料か(別分野の応用研究や、お知らせ記事ではないか)を、PRの確認者が見るため
for (const r of results) console.log(`${icon[r.level]} ${r.title} (${r.slug})\n    ${r.url}\n    ${r.reason}${r.pageTitle ? `\n    資料の題名: ${r.pageTitle}` : ''}`)

// 語ごとに集計。1件でも失敗(存在しない/本文に用語名がない)があれば、その語は失敗(サイトに表示されるリンクが誤りになるため)
const bySlug = new Map()
for (const r of results) bySlug.set(r.slug, [...(bySlug.get(r.slug) ?? []), r])
const failed = [...bySlug].filter(([, rs]) => rs.some((r) => r.level === 'fail'))
const unverified = [...bySlug].filter(([, rs]) => !rs.some((r) => r.level === 'fail') && !rs.some((r) => r.level === 'ok'))

console.log(`\n確認できた語: ${bySlug.size - failed.length - unverified.length} / 確認できなかった語(警告): ${unverified.length} / 失敗: ${failed.length}`)
if (failed.length) {
  console.log('\n❌ 次の語は、失敗した出典があります(存在しない、または本文に用語名がない)。その出典を差し替えるか外してください:')
  for (const [slug, rs] of failed) for (const r of rs.filter((x) => x.level === 'fail')) console.log(`  - ${slug}: ${r.url}`)
  process.exit(1)
}
console.log('\n✅ 出典の確認OK')
