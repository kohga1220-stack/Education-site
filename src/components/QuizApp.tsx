'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CATEGORIES } from '@/types/term'
import { loadSearchIndex } from '@/lib/searchIndexClient'
import { makeQuestions, type Question, type QuizMode, type QuizTerm } from '@/lib/quiz'

type Scope = 'exam' | 'all' | 'weak'
type Phase = 'setup' | 'playing' | 'result'

const WEAK_KEY = 'wakaru-kyoikugaku:quiz-weak'

function readWeak(): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(WEAK_KEY) ?? '[]')
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function writeWeak(slugs: string[]) {
  try {
    window.localStorage.setItem(WEAK_KEY, JSON.stringify(slugs))
  } catch {
    /* 保存できなくてもクイズは続けられる */
  }
}

const btnBase =
  'rounded-xl border px-4 py-3 text-left text-sm leading-relaxed transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400'

export default function QuizApp() {
  const [all, setAll] = useState<QuizTerm[] | null>(null)
  const [loadError, setLoadError] = useState(false)

  const [scope, setScope] = useState<Scope>('exam')
  const [cat, setCat] = useState<string>('')
  const [mode, setMode] = useState<QuizMode>('summary-to-term')
  const [count, setCount] = useState(10)
  const [weak, setWeak] = useState<string[]>([])

  const [phase, setPhase] = useState<Phase>('setup')
  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [missed, setMissed] = useState<string[]>([])
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    setWeak(readWeak())
    loadSearchIndex()
      .then((idx) =>
        setAll(
          idx.map((e) => ({ slug: e.s, title: e.t, reading: e.r, summary: e.m, cat: e.c ?? '', exam: e.x === 1 })),
        ),
      )
      .catch(() => setLoadError(true))
  }, [])

  const bySlug = useMemo(() => new Map((all ?? []).map((t) => [t.slug, t])), [all])
  const examCount = useMemo(() => (all ?? []).filter((t) => t.exam).length, [all])

  const start = useCallback(
    (poolOverride?: QuizTerm[]) => {
      if (!all) return
      let pool = poolOverride ?? all
      if (!poolOverride) {
        if (cat) pool = pool.filter((t) => t.cat === cat)
        if (scope === 'exam') pool = pool.filter((t) => t.exam)
        if (scope === 'weak') pool = pool.filter((t) => weak.includes(t.slug))
      }
      const qs = makeQuestions(pool, all, { count, mode })
      if (qs.length === 0) {
        setNotice('この条件では出題できる語がありません。範囲や分野を変えてください。')
        return
      }
      setNotice(qs.length < count ? `出題できる語が少ないため、${qs.length}問になります。` : null)
      setQuestions(qs)
      setIndex(0)
      setPicked(null)
      setMissed([])
      setPhase('playing')
    },
    [all, cat, scope, weak, count, mode],
  )

  const q = questions[index]

  const choose = useCallback(
    (i: number) => {
      if (!q || picked !== null) return
      setPicked(i)
      const correct = i === q.answerIndex
      const cur = readWeak()
      if (!correct) {
        setMissed((m) => [...m, q.slug])
        if (!cur.includes(q.slug)) writeWeak([...cur, q.slug])
      } else if (scope === 'weak' && cur.includes(q.slug)) {
        writeWeak(cur.filter((s) => s !== q.slug))
      }
      setWeak(readWeak())
    },
    [q, picked, scope],
  )

  const next = useCallback(() => {
    if (index + 1 >= questions.length) setPhase('result')
    else {
      setIndex(index + 1)
      setPicked(null)
    }
  }, [index, questions.length])

  // キーボード: 1〜4 で解答、Enter / スペースで次へ
  useEffect(() => {
    if (phase !== 'playing') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '4') choose(Number(e.key) - 1)
      else if ((e.key === 'Enter' || e.key === ' ') && picked !== null) {
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, choose, next, picked])

  if (loadError) {
    return <p className="py-12 text-center text-sm text-slate-500">クイズのデータを読み込めませんでした。時間をおいて再読み込みしてください。</p>
  }
  if (!all) {
    return <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">クイズのデータを読み込んでいます…</p>
  }

  if (phase === 'setup') {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">用語クイズ</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            用語の説明文から用語名を当てる4択クイズです。間違えた語は「苦手」として端末に保存され、あとで苦手な語だけを復習できます。
          </p>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">範囲</legend>
          {(
            [
              ['exam', `試験の基本語（${examCount}語）`],
              ['all', `すべての語（${all.length.toLocaleString('ja-JP')}語）`],
              ['weak', `苦手に保存した語（${weak.length}語）`],
            ] as [Scope, string][]
          ).map(([v, label]) => (
            <label key={v} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input type="radio" name="scope" checked={scope === v} onChange={() => setScope(v)} />
              {label}
            </label>
          ))}
          <p className="text-xs text-slate-400 dark:text-slate-500">
            「試験の基本語」は、教職教養などでまず押さえたい用語として編集部が選んだものです。出題頻度を調べたものではありません。
          </p>
        </fieldset>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
          分野
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="">すべての分野</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">形式</legend>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input type="radio" name="mode" checked={mode === 'summary-to-term'} onChange={() => setMode('summary-to-term')} />
            説明を読んで、用語名を選ぶ
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input type="radio" name="mode" checked={mode === 'term-to-summary'} onChange={() => setMode('term-to-summary')} />
            用語名を見て、正しい説明を選ぶ
          </label>
        </fieldset>

        <fieldset className="flex items-center gap-4">
          <legend className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">問題数</legend>
          {[10, 20].map((n) => (
            <label key={n} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input type="radio" name="count" checked={count === n} onChange={() => setCount(n)} />
              {n}問
            </label>
          ))}
        </fieldset>

        {notice && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-100">{notice}</p>}

        <button
          type="button"
          onClick={() => start()}
          className="w-fit rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          はじめる
        </button>
      </div>
    )
  }

  if (phase === 'playing' && q) {
    const answered = picked !== null
    const term = bySlug.get(q.slug)
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>
            第{index + 1}問 / {questions.length}問
          </span>
          <button type="button" onClick={() => setPhase('setup')} className="underline-offset-2 hover:underline">
            やめる
          </button>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full bg-primary-500 transition-all" style={{ width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-800/60">
          <p className="mb-2 text-xs font-semibold text-primary-700 dark:text-primary-300">
            {q.mode === 'summary-to-term' ? 'この説明にあてはまる用語は？' : 'この用語の説明は？'}
          </p>
          <p className={q.mode === 'summary-to-term' ? 'text-[15px] leading-relaxed text-slate-800 dark:text-slate-100' : 'text-xl font-bold text-slate-900 dark:text-white'}>
            {q.prompt}
          </p>
        </div>

        <ul className="flex flex-col gap-2.5">
          {q.choices.map((c, i) => {
            const isAnswer = i === q.answerIndex
            const state = !answered
              ? 'border-slate-300 bg-white hover:border-primary-400 dark:border-slate-700 dark:bg-slate-900'
              : isAnswer
                ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-100'
                : picked === i
                  ? 'border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-900/20 dark:text-rose-100'
                  : 'border-slate-200 bg-white opacity-60 dark:border-slate-800 dark:bg-slate-900'
            return (
              <li key={c.slug}>
                <button type="button" disabled={answered} onClick={() => choose(i)} className={`${btnBase} w-full ${state}`}>
                  <span className="mr-2 font-semibold">{i + 1}.</span>
                  {c.label}
                  {answered && isAnswer && <span className="ml-2 font-semibold">◯ 正解</span>}
                  {answered && picked === i && !isAnswer && <span className="ml-2 font-semibold">✕</span>}
                </button>
              </li>
            )
          })}
        </ul>

        {answered && term && (
          <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed dark:bg-slate-800/50">
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              {term.title}
              <span className="ml-2 text-xs font-normal text-slate-400">{term.reading}</span>
            </p>
            {q.mode === 'summary-to-term' && <p className="mt-1 text-slate-600 dark:text-slate-300">{term.summary}</p>}
            <Link href={`/terms/${term.slug}`} target="_blank" className="mt-2 inline-block text-primary-700 underline-offset-2 hover:underline dark:text-primary-300">
              くわしい解説を読む（別のタブで開きます）
            </Link>
          </div>
        )}

        {answered && (
          <button type="button" onClick={next} className="w-fit rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700">
            {index + 1 >= questions.length ? '結果を見る' : '次の問題へ'}
          </button>
        )}
        <p className="text-xs text-slate-400 dark:text-slate-500">キーボード: 数字キー 1〜4 で解答、Enter で次へ</p>
      </div>
    )
  }

  // result
  const score = questions.length - missed.length
  const missedTerms = missed.map((s) => bySlug.get(s)).filter((t): t is QuizTerm => Boolean(t))
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">結果</h1>
      <p className="text-4xl font-bold text-primary-700 dark:text-primary-300">
        {score} <span className="text-xl font-normal text-slate-500">/ {questions.length}問 正解</span>
      </p>
      {missedTerms.length > 0 ? (
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-200">間違えた語（苦手に保存しました）</h2>
          <ul className="flex flex-col gap-1.5 text-sm">
            {missedTerms.map((t) => (
              <li key={t.slug}>
                <Link href={`/terms/${t.slug}`} target="_blank" className="text-primary-700 underline-offset-2 hover:underline dark:text-primary-300">
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-slate-600 dark:text-slate-300">全問正解です。</p>
      )}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => start()} className="rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700">
          同じ設定でもう一度
        </button>
        {missedTerms.length >= 1 && (
          <button
            type="button"
            onClick={() => start(missedTerms)}
            className="rounded-xl border border-primary-600 px-5 py-3 text-sm font-semibold text-primary-700 hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-900/20"
          >
            間違えた語だけ復習
          </button>
        )}
        <button type="button" onClick={() => setPhase('setup')} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
          設定に戻る
        </button>
      </div>
    </div>
  )
}
