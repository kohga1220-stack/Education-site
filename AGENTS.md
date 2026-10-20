# AGENTS.md — 「わかる！教育学用語」共通ルール

教育学用語集サイト(Next.js 14 静的書き出し + TypeScript + Tailwind、GitHub Pages 公開)。
リポジトリ: `kohga1220-stack/Education-site` / 公開ブランチ: `main`(push で自動デプロイ)。

このファイルは **Claude Code と Antigravity の両方** が最初に読む共通契約です。
(Claude Code は `CLAUDE.md`、Antigravity は `GEMINI.md` からここを参照します。)

## 1. 役割分担

| | Claude Code | Antigravity |
|---|---|---|
| 担当 | サイトの**設計・修正・保守** | 用語の**検索・調査・追加** |
| 触ってよい場所 | `src/`(データ以外)、`scripts/`、`docs/`、`.github/`、設定ファイル、既存用語の訂正 | `data-inbox/`、`src/data/terms/*.ts`(**新規用語の追記のみ**) |
| 触ってはいけない場所 | 用語の新規大量追加(調査は Antigravity に任せる) | 上記以外すべて(UI・スクリプト・CI・設定・既存用語の書き換え) |
| ブランチ | `claude/<内容>` | `antigravity/<内容>` |

境界をまたぐ必要が出たら、自分で直さず `docs/PROJECT_STATE.md` の「申し送り」に書き、相手のエージェントに任せる。
スキーマ変更・カテゴリ追加・既存用語の誤りの訂正が必要になったら Claude Code の仕事。

## 2. 自動マージ方針(ユーザー承認済み)

**Claude Code も Antigravity も、自分の PR を自分でマージしてよい。** ただし次を全て満たすこと。
詳細は `docs/WORKFLOW.md`。

1. `npm run validate` がエラー 0
2. `npx tsc --noEmit` が成功
3. `npm run build` が成功(用語追加時は特に必須)
4. PR の CI(`Validate`)が成功
5. squash マージ → マージ後、`Deploy to GitHub Pages` が成功したか確認

`main` へ直接 push しない(緊急の復旧を除く)。失敗したらマージせず原因を直す。

## 3. 絶対に守ること

- **用語は必ず Web 検索・論文/データベースで裏取りして書く**(文部科学省・e-Gov・国立教育政策研究所・J-STAGE・CiNii・OECD・UNESCO 等)。記憶だけで書かない。年・法令名・人名・数値は一次情報で確認。確認できない事項は書かない。
- 既存と**重複する用語を追加しない**(題名・読み・概念で確認。検索は `npm run validate` の重複検出と `grep`)。
- **簡体字・異体字・英語の混入禁止**(例:「遊」を「遣」と誤記する、中国語の簡体字、本文中の英文)。
- 文字化け防止: GitHub MCP の `push_files` で日本語の大きなファイルを送らない。**必ず `git` で commit/push** する。
- 他のリポジトリには触れない。`package-lock.json` などの自動生成物をコミットしない。
- コミットメッセージ末尾の帰属表記を維持する(各ツールの指定に従う)。

## 4. 用語データの仕組み(要点)

- 保存場所: `src/data/terms/<category>.ts`(14分野、ファイル名=分野ID)。型は `src/types/term.ts`。
- 1語のスキーマ(全フィールド必須。`diagram` のみ任意):

```ts
{
  slug: "kebab-case-ascii",        // 一意。小文字英数とハイフン
  title: "題名",                    // 一意(括弧書きを除いて既存と重複しない)
  reading: "ひらがなのよみ",          // ひらがな(ー・数字・括弧可)。五十音順の並び替えに使う
  kana: "あ",                       // 読みの先頭1字(清音・大文字化)。英字始まりの題名は "A–Z"。※自動計算される
  categories: ["methods", "ict"],  // 先頭=ファイルの分野。残りは副分野
  summary: "一覧に出る要約(30〜220字)",
  body: "本文。段落は \n\n で区切る(推奨 300〜600字、3段落程度)",
  relatedSlugs: ["zpd"],           // 実在する slug のみ(3〜6件)
  isCanonical: true,
  tags: ["キーワード"],
  diagram: { type: "pyramid" | "concentric" | "columns", title, items: [{label, desc}] } // 任意
}
```

- 分野ID: `philosophy` 教育思想・哲学 / `psychology` 教育心理学 / `methods` 教授法・学習指導 / `system` 教育制度・政策 / `special` 特別支援教育 / `moral` 道徳・人格教育 / `evaluation` 教育評価・測定 / `sociology` 教育社会学 / `guidance` 生徒指導・相談 / `ict` ICT・現代的課題 / `comparative` 比較教育・国際教育 / `history` 教育史・制度史 / `early-childhood` 幼児教育・保育 / `higher-ed` 高等教育・大学論
- 書き方の基準は `docs/CONTENT_GUIDELINES.md`。

## 5. よく使うコマンド

```bash
npm install            # 初回(package-lock.json は生成されても commit しない)
npm run validate       # 用語データの検証(重複・参照切れ・字種・kana 等)
npm run ingest         # data-inbox/*.json を src/data/terms/*.ts へ取り込む(--dry-run 可)
npx tsc --noEmit       # 型チェック
npm run build          # 静的書き出し(out/)
```

## 6. 参照先

- 現状と履歴・既知の落とし穴: `docs/PROJECT_STATE.md`
- 用語の書き方: `docs/CONTENT_GUIDELINES.md`
- ブランチ・PR・マージ手順: `docs/WORKFLOW.md`
- Antigravity 向け: `docs/ANTIGRAVITY_HANDOFF.md`(これまでの経緯)、`docs/ANTIGRAVITY_INSTRUCTIONS.md`(常設の指示)、`.agents/skills/add-terms/SKILL.md`(用語追加の手順)
