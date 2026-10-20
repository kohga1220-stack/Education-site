# Antigravity への引き継ぎプロンプト(これまでの作業)

> これは Antigravity に最初に渡す説明です。貼り付けるだけで、背景と現状が伝わるように書いています。
> 常設の指示は `docs/ANTIGRAVITY_INSTRUCTIONS.md`。

あなたは、教育学用語集サイト「わかる！教育学用語」の **用語の検索・調査・追加** を担当します。
これから、ここまでの経緯と現状を説明します。サイトの設計・修正は Claude Code が担当するので、あなたは触りません。

## 1. プロジェクト

- リポジトリ: https://github.com/kohga1220-stack/Education-site (公開ブランチ `main`)
- 内容: 教員採用試験・教職課程の学生と現職教員向けの教育学用語集(日本語)。現在 **1,109 語・14 分野**。
- 技術: Next.js 14(静的書き出し)+ TypeScript + Tailwind。GitHub Pages に、`main` への push で自動デプロイ。
- 用語データ: `src/data/terms/<分野ID>.ts`(14 ファイル)。型は `src/types/term.ts`。

## 2. これまでの作業(要約)

1. 初期版(10 分野・563 語)から、**4 分野を追加**(比較教育・国際教育 / 教育史・制度史 / 幼児教育・保育 / 高等教育・大学論)し、全分野を拡充して 1,121 語まで増やしました。**全ての用語を Web 検索で裏取り**して書いています(ユーザーの明確な要望)。
2. 「学習指導要領」の詳細解説と、年月の変遷を整理した新項目「学習指導要領の変遷」を追加(文部科学省の資料を参照)。
3. `main` にマージして公開。
4. 不具合を修正: 存在しない分野 ID による分野ページの空表示、誤字(簡体字・誤変換)・英語の混入・五十音インデックス(`kana`)の誤り 243 件。
5. 同一概念の**重複 12 組を検出して統合**し、1,109 語になりました。
6. 今回、あなたと Claude Code の分業のために、検証スクリプト(`npm run validate`)と取り込みスクリプト(`npm run ingest`)、`AGENTS.md`、`docs/`、CI(`Validate`)を整えました。

## 3. 現在の分野別語数

philosophy 83 / psychology 82 / methods 88 / system 85 / special 81 / moral 81 / evaluation 81 / sociology 83 / guidance 84 / ict 86 / comparative 70 / history 69 / early-childhood 69 / higher-ed 67。

分野 ID と名称: philosophy 教育思想・哲学 / psychology 教育心理学 / methods 教授法・学習指導 / system 教育制度・政策 / special 特別支援教育 / moral 道徳・人格教育 / evaluation 教育評価・測定 / sociology 教育社会学 / guidance 生徒指導・相談 / ict ICT・現代的課題 / comparative 比較教育・国際教育 / history 教育史・制度史 / early-childhood 幼児教育・保育 / higher-ed 高等教育・大学論。

## 4. 用語 1 件のデータ形式

`slug`(一意の kebab-case)/ `title`(一意)/ `reading`(ひらがな)/ `kana`(自動計算されるので省略可)/ `categories`(先頭が主分野)/ `summary`(30〜220 字)/ `body`(300〜600 字、段落は `\n\n`)/ `relatedSlugs`(実在する slug を 3〜6 件)/ `tags`(3〜6 語)/ 任意で `diagram`。詳細は `AGENTS.md` と `docs/CONTENT_GUIDELINES.md`。

## 5. 過去に起きた問題(同じことを繰り返さないでください)

- **同一概念の二重登録**(略称・表記ゆれ・別 slug): 追加前に既存を必ず検索する。
- **簡体字・異体字・英語の混入**: 「遊」が「遣」になる、`遗` `钣` `抖` など。
- **`kana` の誤り**: 複数文字・濁音・括弧付き。→ 自動計算に任せる。
- **存在しない分野 ID / 存在しない `relatedSlugs`**。
- **GitHub MCP `push_files` で日本語の大きなファイルを送ると壊れる**: 必ず `git` で commit / push する。
- 正当な例外: 旧字体の人名(國分康孝・慶應義塾・澤柳政太郎)などは正式表記のまま。

## 6. 検証コマンド

`npm install` → `npm run validate`(エラー 0 が必須)→ `npx tsc --noEmit` → `npm run build`。`package-lock.json` は commit しない。

## 7. マージ権限

ユーザーの承認により、**あなたも自分の PR を自動でマージしてよい**(Claude Code も同様)。条件: 上記の検証がすべて成功し、PR の `Validate` が緑であること。squash マージ後、`Deploy to GitHub Pages` の成功を確認すること。

## 8. まず最初にやること

1. リポジトリを clone し、`AGENTS.md` → `docs/ANTIGRAVITY_INSTRUCTIONS.md` → `.agents/skills/add-terms/SKILL.md` を読む。
2. `npm install && npm run validate` で現状(エラー 0・1,109 語)を確認する。
3. 次の作業指示を待つ(ユーザーが指示を出します)。
