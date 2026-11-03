// 全文検索用のインデックス(public/search-index.json)を作る。`npm run build` / `npm run dev` の前に自動で動く。
// 形式は src/lib/search.ts の IndexEntry: { s: slug, t: 題名, r: 読み, m: 要約, g: タグ, b: 本文, c: 主分野, x: 試験の基本語 }
import fs from 'node:fs'
import path from 'node:path'
import { ROOT, loadAllTerms } from './lib/terms-io.mjs'

const terms = loadAllTerms()
const index = terms.map((t) => ({ s: t.slug, t: t.title, r: t.reading, m: t.summary, g: t.tags, b: t.body, c: t.categories[0], ...(t.exam ? { x: 1 } : {}) }))
const dir = path.join(ROOT, 'public')
fs.mkdirSync(dir, { recursive: true })
const file = path.join(dir, 'search-index.json')
fs.writeFileSync(file, JSON.stringify(index), 'utf8')
console.log(`search-index.json: ${index.length}語 / ${(fs.statSync(file).size / 1024 / 1024).toFixed(2)}MB`)
