import { philosophyTerms } from './terms/philosophy'
import { psychologyTerms } from './terms/psychology'
import { methodsTerms } from './terms/methods'
import { systemTerms } from './terms/system'
import { specialTerms } from './terms/special'
import { moralTerms } from './terms/moral'
import { evaluationTerms } from './terms/evaluation'
import { sociologyTerms } from './terms/sociology'
import { guidanceTerms } from './terms/guidance'
import { ictTerms } from './terms/ict'

export const terms = [
  ...philosophyTerms,
  ...psychologyTerms,
  ...methodsTerms,
  ...systemTerms,
  ...specialTerms,
  ...moralTerms,
  ...evaluationTerms,
  ...sociologyTerms,
  ...guidanceTerms,
  ...ictTerms,
]

export function normalizeKana(k: string): string {
  const map: Record<string, string> = {
    が: 'か', ぎ: 'き', ぐ: 'く', げ: 'け', ご: 'こ',
    ざ: 'さ', じ: 'し', ず: 'す', ぜ: 'せ', ぞ: 'そ',
    だ: 'た', ぢ: 'ち', づ: 'つ', で: 'て', ど: 'と',
    ば: 'は', び: 'ひ', ぶ: 'ふ', べ: 'へ', ぼ: 'ほ',
    ぱ: 'は', ぴ: 'ひ', ぷ: 'ふ', ぺ: 'へ', ぽ: 'ほ',
  }
  return map[k] ?? k
}
