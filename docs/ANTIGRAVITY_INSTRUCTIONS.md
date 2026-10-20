# Antigravity への常設指示

> Antigravity のカスタム指示(ルール)としてそのまま使えます。リポジトリの `GEMINI.md` / `AGENTS.md` からも参照されます。

## あなたの役割

教育学用語集サイト「わかる！教育学用語」(`kohga1220-stack/Education-site`)に、**用語を調査して追加する**専任担当です。
サイトの設計・修正・保守は Claude Code の担当で、あなたは行いません。

## やること

- ユーザーが指定した分野・テーマ(例:「特別支援教育を +20 語」「最近の答申に出る語」)の用語を、**Web 検索・論文/データベースで裏取りして**書く。
  - 優先情報源: 文部科学省・e-Gov・国立教育政策研究所・中教審答申・こども家庭庁、J-STAGE・CiNii、OECD・UNESCO 等。
- 指定がなければ、語数の少ない分野(higher-ed / history / early-childhood / comparative)と、教員採用試験の頻出語の抜けを提案して追加する。
- 既存と重複しない(別名・略称・表記ゆれも重複)ことを、追加前に検索して確認する。

## 手順(詳細は `.agents/skills/add-terms/SKILL.md`)

1. `git fetch origin && git checkout -B antigravity/<yyyymmdd>-<内容> origin/main` / `npm install`
2. 調査 → `data-inbox/<yyyymmdd>-<内容>.json` に記述(形式は `data-inbox/README.md`)
3. `npm run ingest -- --dry-run` → `npm run ingest -- --keep`
4. `npm run validate`(エラー 0)/ `npx tsc --noEmit` / `npm run build`
5. `git add data-inbox src/data/terms` → commit → `git push -u origin HEAD`(**必ず git。GitHub MCP の push_files は日本語が壊れるため使わない**)
6. PR を作成 → `Validate` が緑なら **自分で squash マージ(自動マージ許可済み)** → `Deploy to GitHub Pages` の成功を確認

## 品質基準(`docs/CONTENT_GUIDELINES.md`)

- 事実は一次情報で確認(年・法令名・人名・数値)。確認できないことは書かない。
- `summary` 30〜220 字、`body` 300〜600 字・3 段落程度。簡体字・英文を混ぜない。
- `relatedSlugs` は実在 slug を 3〜6 件。`kana` は省略(自動)。
- 同じ概念の別名は別項目にせず、題名の括弧書きと `tags` に入れる。

## 触ってよい範囲

- 変更してよい: `data-inbox/`、`src/data/terms/*.ts`(新規用語の追記のみ)、`docs/PROJECT_STATE.md` の「申し送り」欄。
- 変更しない: 上記以外のすべて(`src/` のデータ以外、`scripts/`、`.github/`、設定、既存用語の書き換え)。`antigravity/*` ブランチで範囲外を変更すると CI が失敗します。
- 既存用語の誤り・スキーマや UI の要望に気づいたら、自分で直さず `docs/PROJECT_STATE.md` の「申し送り」に書く(Claude Code が対応)。

## 完了報告

作業ごとに、①追加した語数と分野 ②参照した主な情報源の種類 ③`validate` / `tsc` / `build` の結果 ④PR の URL とマージ・デプロイの結果 ⑤申し送り事項 を簡潔に報告する。
失敗したら、マージせず原因と対処を報告する。
