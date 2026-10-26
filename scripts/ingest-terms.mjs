// data-inbox/*.json に置かれた新規用語を src/data/terms/*.ts に取り込む。`npm run ingest`
//   --dry-run  書き込まずに結果だけ表示
//   --keep     取り込み済みの inbox ファイルを削除しない
// 取り込み後に validate-terms を実行し、失敗したら全て元に戻す。
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import {
  CATEGORY_IDS, ROOT, TERMS_DIR, appendToCategory, computeKana, findSimilar, loadAllTerms,
} from './lib/terms-io.mjs'

const dryRun = process.argv.includes('--dry-run')
const keep = process.argv.includes('--keep')
const INBOX = path.join(ROOT, 'data-inbox')
const files = fs.existsSync(INBOX)
  ? fs.readdirSync(INBOX).filter((f) => f.endsWith('.json') && !f.startsWith('_')).sort()
  : []

if (files.length === 0) {
  console.log('data-inbox/ に取り込む .json がありません。')
  process.exit(0)
}

const existing = loadAllTerms()
const slugs = new Set(existing.map((t) => t.slug))
const pool = [...existing] // 既存 + 今回受理した語(同一バッチ内の重複も検出する)

const leftover = {} // ファイル名 -> 却下された元データ
const accepted = []
const rejected = []
const notes = []

for (const f of files) {
  let data
  try {
    data = JSON.parse(fs.readFileSync(path.join(INBOX, f), 'utf8'))
  } catch (e) {
    rejected.push(`${f}: JSONとして読めません (${e.message})`)
    continue
  }
  if (!Array.isArray(data)) {
    rejected.push(`${f}: 最上位は用語オブジェクトの配列にしてください`)
    continue
  }
  data.forEach((raw, i) => {
    const rej = (msg) => {
      rejected.push(msg)
      leftover[f] = [...(leftover[f] ?? []), raw]
    }
    const label = `${f}[${i}] ${raw?.slug ?? raw?.title ?? '?'}`
    const t = { ...raw }
    if (!t.categories && typeof t.category === 'string') t.categories = [t.category]
    delete t.category
    for (const k of ['slug', 'title', 'reading', 'summary', 'body']) {
      if (typeof t[k] !== 'string' || !t[k].trim()) return rej(`${label}: ${k} が必要です`)
    }
    if (!Array.isArray(t.categories) || t.categories.length === 0) return rej(`${label}: categories が必要です`)
    if (!t.categories.every((c) => CATEGORY_IDS.includes(c))) return rej(`${label}: 不正なカテゴリID ${t.categories}`)
    if (slugs.has(t.slug)) return rej(`${label}: slug が既存と重複 → 取り込みません(既存の更新は Claude Code に依頼)`)
    const sim = findSimilar(t, pool)
    if (sim) {
      const where = `既存「${sim.other.title}」(${sim.other.slug})`
      if (sim.level === 'reject') return rej(`${label}: ${sim.reason} → ${where}。取り込みません`)
      if (sim.level === 'review') {
        const why = typeof t.distinctFrom === 'string' ? t.distinctFrom.trim() : ''
        if (why.length < 10) {
          return rej(`${label}: ${sim.reason} → ${where}。別の用語である理由を distinctFrom(10字以上)に書くか、取り込みをやめてください`)
        }
        notes.push(`${label}: 類似あり(${sim.reason}) → ${where}。distinctFrom「${why}」により受理(PRで確認)`)
      } else {
        notes.push(`${label}: 参考: ${sim.reason} → ${where}`)
      }
    }
    delete t.distinctFrom // サイトには保存しない
    const kana = computeKana(t.title, t.reading)
    if (t.kana && t.kana !== kana) notes.push(`${label}: kana "${t.kana}" → "${kana}" に自動補正`)
    t.kana = kana
    t.relatedSlugs = t.relatedSlugs ?? []
    t.tags = t.tags ?? []
    t.isCanonical = true
    slugs.add(t.slug)
    accepted.push({ ...t, __from: f })
    pool.push(t)
  })
}

// relatedSlugs は既存+今回追加分に存在するものだけ残す
for (const t of accepted) {
  const ok = t.relatedSlugs.filter((s) => slugs.has(s) && s !== t.slug)
  const dropped = t.relatedSlugs.filter((s) => !ok.includes(s))
  if (dropped.length) notes.push(`${t.slug}: 存在しない relatedSlugs を除外 → ${dropped.join(', ')}`)
  t.relatedSlugs = [...new Set(ok)]
}

const byCat = {}
for (const t of accepted) (byCat[t.categories[0]] ??= []).push(t)

console.log(`取り込み対象: ${accepted.length} 語 / 却下: ${rejected.length} 語`)
for (const [c, ts] of Object.entries(byCat)) console.log(`  ${c}: +${ts.length}`)
for (const n of notes) console.log('  ℹ ' + n)
for (const r of rejected) console.log('  ✗ ' + r)

if (dryRun || accepted.length === 0) {
  console.log(dryRun ? '\n(--dry-run: 何も書き込んでいません)' : '\n取り込める語がありません。')
  process.exit(rejected.length && accepted.length === 0 ? 1 : 0)
}

// 書き込み(失敗時に戻せるよう原本を保持)
const backup = {}
for (const c of Object.keys(byCat)) {
  const p = path.join(TERMS_DIR, `${c}.ts`)
  backup[p] = fs.readFileSync(p, 'utf8')
}
for (const [c, ts] of Object.entries(byCat)) appendToCategory(c, ts)

const v = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'validate-terms.mjs')], { encoding: 'utf8' })
if (v.status !== 0) {
  for (const [p, src] of Object.entries(backup)) fs.writeFileSync(p, src, 'utf8')
  console.log('\n❌ 取り込み後の検証に失敗したため、変更を元に戻しました。\n')
  console.log(v.stdout)
  process.exit(1)
}

if (!keep) {
  for (const f of new Set(accepted.map((t) => t.__from))) {
    const p = path.join(INBOX, f)
    // 却下語だけを残して書き戻す(直して再投入するため)
    if (leftover[f]) fs.writeFileSync(p, JSON.stringify(leftover[f], null, 2) + '\n', 'utf8')
    else fs.unlinkSync(p)
  }
}
console.log(`\n✅ ${accepted.length} 語を取り込みました。続けて npx tsc --noEmit と npm run build を実行してください。`)
process.exit(rejected.length ? 2 : 0)
