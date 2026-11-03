import type { Metadata } from 'next'
import QuizApp from '@/components/QuizApp'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: '用語クイズ | わかる！教育学用語',
  description: '教育学用語の説明文から用語名を選ぶ4択クイズ。試験の基本語や分野を選んで、苦手な語だけを復習できます。',
  alternates: { canonical: absoluteUrl('quiz') },
}

export default function QuizPage() {
  return <QuizApp />
}
