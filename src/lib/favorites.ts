const STORAGE_KEY = 'wakaru-kyoikugaku:favorites'

function readRaw(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function writeRaw(slugs: string[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs))
  } catch {
    // localStorageが使えない環境（プライベートブラウズ等）では無視する
  }
}

export function getFavorites(): string[] {
  return readRaw()
}

export function isFavorite(slug: string): boolean {
  return readRaw().includes(slug)
}

export function toggleFavorite(slug: string): string[] {
  const current = readRaw()
  const next = current.includes(slug)
    ? current.filter((s) => s !== slug)
    : [...current, slug]
  writeRaw(next)
  return next
}

export const FAVORITES_EVENT = 'wakaru-kyoikugaku:favorites-changed'

export function dispatchFavoritesChanged(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(FAVORITES_EVENT))
}
