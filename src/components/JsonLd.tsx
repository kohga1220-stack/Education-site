/** 構造化データ(JSON-LD)を出力する。`<` をエスケープしてスクリプト終了タグの混入を防ぐ */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
