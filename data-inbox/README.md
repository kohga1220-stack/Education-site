# data-inbox — 新規用語の投入口

Antigravity はここに JSON を置き、`npm run ingest` で `src/data/terms/*.ts` へ取り込みます。

- ファイル名: `YYYYMMDD-<分野や内容>.json`(`_` で始まるファイルは無視)
- 形式: 用語オブジェクトの**配列**
- `kana`・`isCanonical` は省略可(自動設定)。`category`(文字列)は `categories` の代わりに使えます。
- slug / 題名が既存と重複する語は却下され、そのファイルには却下分だけが残ります。

```json
[
  {
    "slug": "example-term",
    "title": "用語名",
    "reading": "ようごめい",
    "categories": ["methods"],
    "summary": "一覧に出る要約(30〜220字)。",
    "body": "第1段落。\n\n第2段落。\n\n第3段落。",
    "relatedSlugs": ["zpd"],
    "tags": ["別名", "提唱者"],
    "diagram": { "type": "columns", "title": "任意", "items": [{ "label": "項目", "desc": "説明" }] }
  }
]
```

コマンド: `npm run ingest -- --dry-run`(確認のみ) / `npm run ingest -- --keep`(取り込み後も JSON を残す)
