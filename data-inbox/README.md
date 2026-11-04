# data-inbox — 新規用語の投入口

Antigravity はここに JSON を置き、`npm run ingest` で `src/data/terms/*.ts` へ取り込みます。

- ファイル名: `YYYYMMDD-<分野や内容>.json`(`_` で始まるファイルは無視)
- 形式: 用語オブジェクトの**配列**
- `kana`・`isCanonical` は省略可(自動設定)。`category`(文字列)は `categories` の代わりに使えます。
- `sources`(出典URLの配列、最大5件)は**必須扱い**。裏取りに使った一次情報・論文のURLを、**実際に開いて確認したものだけ**書く。取り込むと語のデータに保存され、用語ページに「参考にした資料」として表示される。PRでCIが、各URLの存在と、本文に用語名(または括弧書きの別名)が書かれていることを自動確認し、1件でも失敗すると差し戻される(PDFは開けることのみ確認)。
- 類似題名のチェック(取り込み時に自動):
  - 括弧書き・全角半角・記号を除いた**題名が既存と同じ**語は却下されます(例外なし)。
  - 読みが同じ、題名が既存の語を含む(長さの差8字以内)、題名が似ている語は、**`distinctFrom`(10字以上)に「なぜ別の用語か」を書いた場合だけ**受理されます。書かないと却下されます。`distinctFrom` はサイトには保存されず、PRで確認されます。
  - 今回の一括投入の中での重複も検出されます。
  - 例: `"distinctFrom": "義務教育学校は学校種の名称で、義務教育は制度全般を指す"`
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
    "sources": ["https://www.mext.go.jp/…", "https://www.jstage.jst.go.jp/…"],
    "diagram": { "type": "columns", "title": "任意", "items": [{ "label": "項目", "desc": "説明" }] }
  }
]
```

コマンド: `npm run ingest -- --dry-run`(確認のみ) / `npm run ingest -- --keep`(取り込み後も JSON を残す)

## 既存語に出典だけを追加する(`sources-*.json`)

既存の用語には `sources` がありません。次の形のファイルを `data-inbox/sources-<内容>.json` として置き、`npm run attach-sources` で追加します(新規用語の `ingest` とは別のコマンド)。

```json
[
  {
    "slug": "zpd",
    "sources": ["https://…"],
    "note": "出典の「第○章」に、最近接領域の定義と提唱者が書かれていた(10字以上)"
  }
]
```

- 変更されるのは、該当語に `sources:` 行が1行加わることだけです。題名・本文などは変わりません。
- 既に `sources` がある語、存在しない slug、不正な URL、`note` が10字未満の項目は却下されます(`note` はサイトには保存されず、PR の確認用)。
- **語ごとに、実際に開いて、その語の内容が書かれていたURLだけ**を入れます。同じ URL を無関係な語に使い回さない(`npm run validate` が4語以上での使い回しを警告します)。本文が確認できない語には付けません。
- 優先順: まず試験の基本語(`exam: true`)、次に法令・制度・数値を含む語。1PR あたり20〜30語まで。
- コマンド: `npm run attach-sources -- --dry-run` / `npm run attach-sources -- --keep`。PR の CI(`Verify sources`)が URL の到達と題名の記載を確認します。
- 出典のない試験の基本語を一覧する: `node -e "import('./scripts/lib/terms-io.mjs').then(m=>m.loadAllTerms().filter(t=>t.exam&&!t.sources).forEach(t=>console.log(t.slug,t.title)))"`
