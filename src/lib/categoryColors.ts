import type { CategoryId } from '@/types/term'

// Tailwindのクラス名はビルド時に静的解析されるため、動的に組み立てず全パターンを明記する。
export const CATEGORY_BADGE_CLASS: Record<CategoryId, string> = {
  philosophy: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  psychology: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  methods: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  system: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  special: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  moral: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  evaluation: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  sociology: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  guidance: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  ict: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
}

export const CATEGORY_DOT_CLASS: Record<CategoryId, string> = {
  philosophy: 'bg-violet-500',
  psychology: 'bg-blue-500',
  methods: 'bg-sky-500',
  system: 'bg-teal-500',
  special: 'bg-emerald-500',
  moral: 'bg-amber-500',
  evaluation: 'bg-orange-500',
  sociology: 'bg-rose-500',
  guidance: 'bg-pink-500',
  ict: 'bg-indigo-500',
}

export const CATEGORY_SOLID_CLASS: Record<CategoryId, string> = {
  philosophy: 'bg-violet-600 text-white',
  psychology: 'bg-blue-600 text-white',
  methods: 'bg-sky-600 text-white',
  system: 'bg-teal-600 text-white',
  special: 'bg-emerald-600 text-white',
  moral: 'bg-amber-600 text-white',
  evaluation: 'bg-orange-600 text-white',
  sociology: 'bg-rose-600 text-white',
  guidance: 'bg-pink-600 text-white',
  ict: 'bg-indigo-600 text-white',
}
