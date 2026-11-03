/** サイトの公開URL(末尾スラッシュ付き)。サイトマップ・正規URL・構造化データで使う */
export const SITE_URL = 'https://kohga1220-stack.github.io/Education-site/'
export const SITE_NAME = 'わかる！教育学用語'

/** パス(先頭スラッシュなし)から絶対URLを作る。trailingSlash: true に合わせて末尾に / を付ける */
export function absoluteUrl(path: string): string {
  const clean = path.replace(/^\/+/, '').replace(/\/+$/, '')
  return clean ? `${SITE_URL}${clean}/` : SITE_URL
}
