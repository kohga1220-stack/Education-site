// 既存の用語に出典(sources)だけを追加する。`npm run attach-sources`
//   --dry-run  書き込まずに結果だけ表示
//   --keep     取り込み済みの inbox ファイルを削除しない
// 入力: data-inbox/sources-*.json(用語の配列ではなく、次の形のオブジェクトの配列)
//   [{ "slug": "zpd", "sources": ["https://…"], "note": "出典のどこに何が書いてあったか(10字以上)" }]
// 変更するのは該当用語の `sources:` 行の追加だけ(題名・本文など他の項目は変わらない)。
// 既に sources がある語・存在しない slug・不正な URL は却下する。`note` はサイトには保存せず、PRで確認する。
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { ROOT, TERMS_DIR, loadAllTerms } from './lib/terms-io.mjs'

const dryRun = process.argv.includes('--dry-run')
const keep = process.argv.includes('--keep')
const INBOX = path.join(ROOT, 'data-inbox')
const files = fs.existsSync(INBOX)
  ? fs.readdirSync(INBOX).filter((f) => /^sources-.*\.json$/.test(f)).sort()
  : []

if (files.length === 0) {
  console.log('data-inbox/ に sources-*.json がありません。')
  process.exit(0)
}

const terms = new Map(loadAllTerms().map((t) => [t.slug, t]))
const accepted = [] // { slug, sources, file, from, note }
const rejected = []
const leftover = {}
const claimed = new Set()
const js = JSON.stringify

for (const f of files) {
  let data
  try {
    data = JSON.parse(fs.readFileSync(path.join(INBOX, f), 'utf8'))
  } catch (e) {
    rejected.push(`${f}: JSONとして読めません (${e.message})`)
    continue
  }
  if (!Array.isArray(data)) {
    rejected.push(`${f}: 最上位は {slug, sources, note} の配列にしてください`)
    continue
  }
  data.forEach((raw, i) => {
    const rej = (msg) => {
      rejected.push(msg)
      leftover[f] = [...(leftover[f] ?? []), raw]
    }
    const label = `${f}[${i}] ${raw?.slug ?? '?'}`
    const t = terms.get(raw?.slug)
    if (!t) return rej(`${label}: その slug の用語がありません`)
    if (claimed.has(t.slug)) return rej(`${label}: 同じ語が重複して指定されています`)
    if (t.sources?.length) return rej(`${label}: 既に sources があります(差し替えは Claude Code に依頼)`)
    if (typeof raw.note !== 'string' || raw.note.trim().length < 10) {
      return rej(`${label}: note(出典のどこに何が書いてあったか。10字以上)が必要です`)
    }
    const urls = Array.isArray(raw.sources)
      ? [...new Set(raw.sources.filter((u) => typeof u === 'string' && /^https?:\/\/[^\s]+$/.test(u)))]
      : []
    if (urls.length === 0) return rej(`${label}: sources に http(s) のURLを1件以上入れてください`)
    if (urls.length > 5) return rej(`${label}: sources は5件までです`)
    claimed.add(t.slug)
    accepted.push({ slug: t.slug, title: t.title, sources: urls, file: t.__file, from: f })
  })
}

console.log(`出典を追加する語: ${accepted.length} / 却下: ${rejected.length}`)
for (const a of accepted) console.log(`  + ${a.title} (${a.slug}) ← ${a.sources.length}件`)
for (const r of rejected) console.log('  ✗ ' + r)

if (dryRun || accepted.length === 0) {
  console.log(dryRun ? '\n(--dry-run: 何も書き込んでいません)' : '\n追加できる語がありません。')
  process.exit(rejected.length && accepted.length === 0 ? 1 : 0)
}

// 書き込み: 該当語のブロックの `tags:` 行の直後に `sources:` 行を挿入する(他の行には触れない)
const backup = {}
const byFile = {}
for (const a of accepted) (byFile[a.file] ??= []).push(a)
let failed = null
for (const [cat, items] of Object.entries(byFile)) {
  const p = path.join(TERMS_DIR, `${cat}.ts`)
  backup[p] = fs.readFileSync(p, 'utf8')
  const lines = backup[p].split('\n')
  for (const a of items) {
    const start = lines.findIndex((l) => l === `    slug: ${js(a.slug)},`)
    if (start < 0) { failed = `${cat}.ts: ${a.slug} の位置が見つかりません`; break }
    let end = start + 1
    while (end < lines.length && lines[end] !== '  },') end++
    const tagsAt = lines.findIndex((l, i) => i > start && i < end && /^    tags: \[.*\],$/.test(l))
    if (tagsAt < 0) { failed = `${cat}.ts: ${a.slug} の tags 行が見つかりません`; break }
    if (lines.slice(start, end).some((l) => l.startsWith('    sources:'))) { failed = `${cat}.ts: ${a.slug} に既に sources があります`; break }
    lines.splice(tagsAt + 1, 0, `    sources: [${a.sources.map(js).join(', ')}],`)
  }
  if (failed) break
  fs.writeFileSync(p, lines.join('\n'), 'utf8')
}
const restore = () => { for (const [p, src] of Object.entries(backup)) fs.writeFileSync(p, src, 'utf8') }
if (failed) {
  restore()
  console.log(`\n❌ ${failed}。変更を元に戻しました。`)
  process.exit(1)
}

const v = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'validate-terms.mjs')], { encoding: 'utf8' })
if (v.status !== 0) {
  restore()
  console.log('\n❌ 追加後の検証に失敗したため、変更を元に戻しました。\n')
  console.log(v.stdout)
  process.exit(1)
}

if (!keep) {
  for (const f of new Set(accepted.map((a) => a.from))) {
    const p = path.join(INBOX, f)
    if (leftover[f]) fs.writeFileSync(p, JSON.stringify(leftover[f], null, 2) + '\n', 'utf8')
    else fs.unlinkSync(p)
  }
}
console.log(`\n✅ ${accepted.length} 語に出典を追加しました。続けて npm run verify-sources(または CI)で確認されます。`)
process.exit(rejected.length ? 2 : 0)
