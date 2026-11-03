import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAllTerms } from '@/lib/terms'
import { SITE_URL } from '@/lib/site'

const termCount = getAllTerms().length.toLocaleString('ja-JP')

export const metadata: Metadata = {
  title: 'わかる！教育学用語 | 教育学用語集',
  description:
    '教育学の基礎用語を、初学者にも教育関係者にもわかりやすく、かつ学術的に解説する用語集サイトです。教育思想・教育心理学・教授法・教育制度・特別支援教育など、' + termCount + '語の用語を五十音・カテゴリ・検索から探せます。',
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'わかる！教育学用語',
    description: '初学者にもわかりやすく、学術的に濃い教育学用語集',
    type: 'website',
    siteName: 'わかる！教育学用語',
    locale: 'ja_JP',
    url: SITE_URL,
  },
}

const themeInitScript = `
(function () {
  try {
    var stored = window.localStorage.getItem('wakaru-kyoikugaku:theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = stored ? stored === 'dark' : prefersDark;
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
