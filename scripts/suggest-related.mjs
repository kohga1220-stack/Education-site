// 孤立語(他の語の relatedSlugs に一度も出てこない語)に、関連リンクの元になる語を提案する。
//   node scripts/suggest-related.mjs            提案を表示するだけ
//   node scripts/suggest-related.mjs --apply    提案を relatedSlugs に反映する(data を書き換える)
// 実行には Node 22.18 以上(TypeScript の autolink.ts を直接読むため)が必要。
import { CATEGORY_IDS, loadCategoryFile, writeCategory } from './lib/terms-io.mjs'
import { Linker } from '../src/lib/autolink.ts'

const apply = process.argv.includes('--apply')
const listRest = process.argv.includes('--list') // 提案しても残る孤立語を一覧表示する
const MAX_RELATED = 8 // 1語の関連リンクはこの件数まで
const MIN_SCORE = 4 // 提案に必要な最低得点
const PER_ORPHAN = 2 // 孤立語1語につき追加する参照元の数

const files = Object.fromEntries(CATEGORY_IDS.map((c) => [c, loadCategoryFile(c).terms]))
const all = CATEGORY_IDS.flatMap((c) => files[c].map((t) => ({ t, cat: c })))
const terms = all.map((x) => x.t)
const bySlug = new Map(terms.map((t) => [t.slug, t]))
const linker = new Linker(terms)

const inbound = new Map()
for (const t of terms) for (const s of t.relatedSlugs) inbound.set(s, (inbound.get(s) ?? 0) + 1)
const tagFreq = new Map()
for (const t of terms) for (const g of new Set(t.tags)) tagFreq.set(g, (tagFreq.get(g) ?? 0) + 1)

const bigrams = (s) => {
  const o = new Set()
  const n = s.normalize('NFKC')
  for (let i = 0; i < n.length - 1; i++) o.add(n.slice(i, i + 2))
  return o
}
const jac = (a, b) => {
  let n = 0
  for (const x of a) if (b.has(x)) n++
  return n / (a.size + b.size - n || 1)
}
const sumBg = new Map(terms.map((t) => [t.slug, bigrams(t.title + t.summary)]))

function score(orphan, ref) {
  let s = 0
  const why = []
  if (linker.mentionedBy.get(orphan.slug)?.has(ref.slug)) { s += 3; why.push('本文で言及') }
  if (linker.mentionedBy.get(ref.slug)?.has(orphan.slug)) { s += 2; why.push('孤立語側が言及') }
  // 孤立語自身が関連語として挙げている語からは、戻りのリンクを張るのが自然(相互リンク)
  if (orphan.relatedSlugs.includes(ref.slug)) { s += 4; why.push('相互リンク') }
  const shared = orphan.tags.filter((g) => ref.tags.includes(g) && (tagFreq.get(g) ?? 99) <= 10)
  if (shared.length) { s += Math.min(2, shared.length) * 2; why.push(`共通タグ:${shared.slice(0, 2).join('・')}`) }
  if (orphan.categories[0] === ref.categories[0]) { s += 1; why.push('同分野') }
  else if (orphan.categories.some((c) => ref.categories.includes(c))) { s += 0.5 }
  const sim = jac(sumBg.get(orphan.slug), sumBg.get(ref.slug))
  if (sim >= 0.15) { s += 1; why.push(`類似${sim.toFixed(2)}`) }
  return { s, why }
}

const orphans = terms.filter((t) => !inbound.get(t.slug))
const plan = [] // { ref, orphan, s, why }
const added = new Map() // ref.slug -> 追加数(上限管理)
for (const o of orphans) {
  const cands = []
  for (const r of terms) {
    if (r.slug === o.slug || r.relatedSlugs.includes(o.slug)) continue
    const { s, why } = score(o, r)
    if (s >= MIN_SCORE) cands.push({ r, s, why })
  }
  cands.sort((a, b) => b.s - a.s || a.r.relatedSlugs.length - b.r.relatedSlugs.length)
  let n = 0
  for (const c of cands) {
    if (n >= PER_ORPHAN) break
    const room = MAX_RELATED - c.r.relatedSlugs.length - (added.get(c.r.slug) ?? 0)
    if (room <= 0) continue
    plan.push({ ref: c.r, orphan: o, s: c.s, why: c.why })
    added.set(c.r.slug, (added.get(c.r.slug) ?? 0) + 1)
    n++
  }
}

const resolved = new Set(plan.map((p) => p.orphan.slug))
console.log(`孤立語: ${orphans.length}語 / 提案で解消できる語: ${resolved.size}語 / 提案の件数: ${plan.length}件 / 残る孤立語: ${orphans.length - resolved.size}語`)
if (listRest) {
  console.log('\n--- 残る孤立語(提案の基準を満たす参照元がない語) ---')
  for (const o of orphans.filter((x) => !resolved.has(x.slug))) console.log(`${o.categories[0]}\t${o.slug}\t${o.title}`)
  process.exit(0)
}
if (!apply) {
  const sample = plan.filter((_, i) => i % Math.max(1, Math.floor(plan.length / 25)) === 0).slice(0, 25)
  console.log('\n--- サンプル ---')
  for (const p of sample) console.log(`${p.ref.title}  →追加→  ${p.orphan.title}   [${p.s}: ${p.why.join(', ')}]`)
  console.log('\n(--apply で反映します)')
  process.exit(0)
}

for (const p of plan) p.ref.relatedSlugs = [...p.ref.relatedSlugs, p.orphan.slug]
for (const c of CATEGORY_IDS) writeCategory(c, files[c])
console.log(`\n反映しました: ${plan.length}件。続けて npm run validate を実行してください。`)
