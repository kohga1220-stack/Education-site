import type { IndexEntry } from './search'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

let cache: Promise<IndexEntry[]> | null = null

/** 全文検索インデックスを読み込む(初回だけ通信し、以後は使い回す。失敗したら次回やり直す) */
export function loadSearchIndex(): Promise<IndexEntry[]> {
  if (!cache) {
    cache = fetch(`${BASE}/search-index.json`).then((r) => {
      if (!r.ok) throw new Error(`search-index.json: HTTP ${r.status}`)
      return r.json() as Promise<IndexEntry[]>
    })
    cache.catch(() => {
      cache = null
    })
  }
  return cache
}
