import Link from 'next/link'
import DarkModeToggle from './DarkModeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
            教
          </span>
          <span className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
            わかる！教育学用語
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white sm:block"
          >
            用語一覧
          </Link>
          <DarkModeToggle />
        </nav>
      </div>
    </header>
  )
}
