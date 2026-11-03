// クイズの出題ロジック。依存を持たない(テストしやすくするため)。乱数は差し替えられる。

export interface QuizTerm {
  slug: string
  title: string
  reading: string
  summary: string
  /** 主分野のID */
  cat: string
  /** 試験の基本語か */
  exam: boolean
}

export type QuizMode = 'summary-to-term' | 'term-to-summary'

export interface Choice {
  slug: string
  label: string
}

export interface Question {
  slug: string
  mode: QuizMode
  prompt: string
  choices: Choice[]
  answerIndex: number
}

export type Rng = () => number

/** 題名から、説明文に書かれうる名称(括弧を除いた題名と括弧書きの別名)を取り出す */
function namesIn(title: string): string[] {
  const out = new Set<string>()
  const main = title.replace(/[（(][^）)]*[）)]/g, '').trim()
  if (main.length >= 2) out.add(main)
  for (const m of Array.from(title.matchAll(/[（(]([^）)]+)[）)]/g))) {
    const a = m[1].trim()
    if (a.length >= 2 && !/^[0-9０-９\s年月日.,\-]+$/.test(a)) out.add(a)
  }
  return Array.from(out).sort((a, b) => b.length - a.length)
}

/** 説明文から、答えになる用語名を「〇〇」に置き換える。答えが漏れそうなら null(出題しない) */
export function maskTitle(summary: string, title: string): string | null {
  let masked = summary
  for (const n of namesIn(title)) masked = masked.split(n).join('〇〇')
  const main = title.replace(/[（(][^）)]*[）)]/g, '').trim()
  // 「ABC検査V」のような語形の違いで漏れていないか: 題名の先頭4字が残っていたら出さない
  if (main.length >= 4 && masked.includes(main.slice(0, 4))) return null
  if (masked.length < 20) return null
  return masked
}

/** 共通する連続3文字があれば、似すぎた選択肢(語形違い)とみなす */
function tooSimilar(a: string, b: string): boolean {
  for (let i = 0; i + 3 <= a.length; i++) if (b.includes(a.slice(i, i + 3))) return true
  return false
}

export function shuffle<T>(arr: T[], rng: Rng): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const t = a[i]
    a[i] = a[j]
    a[j] = t
  }
  return a
}

function pickDistractors(correct: QuizTerm, pool: QuizTerm[], n: number, rng: Rng): QuizTerm[] {
  const ok = (t: QuizTerm) => t.slug !== correct.slug && !tooSimilar(correct.title, t.title)
  const same = shuffle(pool.filter((t) => t.cat === correct.cat && ok(t)), rng)
  const others = shuffle(pool.filter((t) => t.cat !== correct.cat && ok(t)), rng)
  const out: QuizTerm[] = []
  for (const t of [...same, ...others]) {
    if (out.length >= n) break
    if (out.some((o) => tooSimilar(o.title, t.title))) continue
    out.push(t)
  }
  return out
}

/**
 * 問題を作る。
 * pool: 出題してよい語(範囲で絞った語)。distractorPool: 選択肢に使える語(通常は全語)
 */
export function makeQuestions(
  pool: QuizTerm[],
  distractorPool: QuizTerm[],
  opts: { count: number; mode: QuizMode; rng?: Rng },
): Question[] {
  const rng = opts.rng ?? Math.random
  const questions: Question[] = []
  for (const t of shuffle(pool, rng)) {
    if (questions.length >= opts.count) break
    const d = pickDistractors(t, distractorPool, 3, rng)
    if (d.length < 3) continue
    if (opts.mode === 'summary-to-term') {
      const masked = maskTitle(t.summary, t.title)
      if (!masked) continue
      const choices = shuffle([t, ...d], rng).map((x) => ({ slug: x.slug, label: x.title }))
      questions.push({
        slug: t.slug,
        mode: opts.mode,
        prompt: masked,
        choices,
        answerIndex: choices.findIndex((c) => c.slug === t.slug),
      })
    } else {
      // 用語名から説明を選ぶ。説明文は答え以外の語の名前を含みうるが、題名は伏せなくてよい
      const choices = shuffle([t, ...d], rng).map((x) => ({ slug: x.slug, label: x.summary }))
      questions.push({
        slug: t.slug,
        mode: opts.mode,
        prompt: t.title,
        choices,
        answerIndex: choices.findIndex((c) => c.slug === t.slug),
      })
    }
  }
  return questions
}
