// 出典URLが「開けること」と「本文に用語名が書かれていること」を確認する。
// 結果の level: 'ok' | 'warn'(確認できず・確認の対象外) | 'fail'(404/410、または本文に用語名がない)
import { titleCore } from './terms-io.mjs'

const UA = 'Mozilla/5.0 (compatible; EducationSiteSourceCheck/1.0; +https://github.com/kohga1220-stack/Education-site)'

// 長音「ー」も除く(titleCore が題名から長音を除くため、本文側も揃えないと「ポートフォリオ評価」などが一致しない)
const norm = (s) => s.normalize('NFKC').replace(/[\s・･、。ー]/g, '').toLowerCase()

/** 用語から「本文に書かれているはずの語」を取り出す(題名、括弧書きの別名) */
export function keywordsFor(term) {
  const kws = new Set()
  const core = titleCore(term.title)
  if (core.length >= 2) kws.add(core.toLowerCase())
  // 「〜の廃止」「〜制度」で終わる題名は、資料が「教員免許更新制」のように語幹だけで書くことが多いので、語幹も許す
  const stem = core.replace(/(の廃止|制度)$/, '')
  if (stem !== core && stem.length >= 4) kws.add(stem.toLowerCase())
  for (const m of term.title.normalize('NFKC').matchAll(/[（(]([^）)]+)[）)]/g)) {
    const a = norm(m[1])
    if (a.length >= 2) kws.add(a)
  }
  return [...kws]
}

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
}

/** URLを取得し、キーワードのいずれかが本文にあるかを確認する */
export async function verifyUrl(url, keywords, { timeoutMs = 20000, fetchImpl = fetch } = {}) {
  let res
  try {
    res = await fetchImpl(url, {
      redirect: 'follow',
      headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.5' },
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch (e) {
    return { level: 'warn', reason: `接続できず(${e.name === 'TimeoutError' ? 'タイムアウト' : e.message})` }
  }
  if (res.status === 404 || res.status === 410) return { level: 'fail', reason: `ページが存在しません(HTTP ${res.status})` }
  if (!res.ok) return { level: 'warn', reason: `確認できず(HTTP ${res.status})` }
  const type = res.headers.get('content-type') ?? ''
  if (/pdf/i.test(type) || /\.pdf($|\?)/i.test(url)) {
    return { level: 'warn', reason: 'PDFのため本文は確認していません(開けることのみ確認)' }
  }
  if (!/html|text|xml/i.test(type)) return { level: 'warn', reason: `HTML以外(${type || '種別不明'})のため本文は確認していません` }
  const text = norm(htmlToText((await res.text()).slice(0, 3_000_000)))
  const hit = keywords.find((k) => text.includes(norm(k)))
  if (!hit) return { level: 'fail', reason: `本文に ${keywords.map((k) => `「${k}」`).join('・')} がありません(別の語の資料の疑い)` }
  return { level: 'ok', reason: `本文に「${hit}」を確認` }
}
