import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <p className="text-5xl">🔍</p>
      <h1 className="text-xl font-bold text-slate-800 dark:text-white">ページが見つかりませんでした</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        お探しの用語やページは存在しないか、移動した可能性があります。
      </p>
      <Link
        href="/"
        className="mt-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
      >
        用語一覧に戻る
      </Link>
    </div>
  )
}
