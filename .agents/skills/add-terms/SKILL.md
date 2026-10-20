---
name: add-terms
description: 「わかる！教育学用語」に新しい教育学用語を調査して追加する手順。用語の検索・追加を頼まれたときに使う。
---

# 用語を調査して追加する

前提: `AGENTS.md` と `docs/CONTENT_GUIDELINES.md` を読んだこと。担当は用語追加のみ(サイトのコードは触らない)。

## 手順

1. **最新化**: `git fetch origin && git checkout -B antigravity/<yyyymmdd>-<内容> origin/main`、`npm install`
2. **現状把握**: `npm run validate` の先頭で分野別の語数を確認。追加対象の分野の既存題名を `grep -h 'title:' src/data/terms/<分野>.ts` で見て、抜けている重要語を洗い出す。
3. **候補選定**: 教員採用試験・教職課程で重要な語、最新の答申/法改正、提唱者のいる理論、国際比較の制度 など。**既存と同じ概念(別名・略称・表記ゆれ)でないか**を必ず確認。
4. **調査**: 1語ごとに Web 検索・論文/データベースで裏取り(文科省・e-Gov・国研・J-STAGE・CiNii・OECD/UNESCO 等)。年・法令名・人名・数値を一次情報で確認。
5. **執筆**: `data-inbox/<yyyymmdd>-<内容>.json` に配列で書く(形式: `data-inbox/README.md`、基準: `docs/CONTENT_GUIDELINES.md`)。1ファイルは20〜40語程度に分ける。
6. **取り込み**: `npm run ingest -- --dry-run` → `npm run ingest -- --keep`。却下された語は直して再度。
7. **検証**: `npm run validate`(エラー0)、`npx tsc --noEmit`、`npm run build`。警告(第1水準外の漢字など)は内容を確認。
8. **PR とマージ**: `git add data-inbox src/data/terms && git commit && git push -u origin HEAD`。PR を作成し、`Validate` が緑なら squash マージ。マージ後 `Deploy to GitHub Pages` の成功を確認。
9. 衝突したら `docs/WORKFLOW.md` の「コンフリクトしたら」に従う。

## 禁止

- 記憶のみでの執筆、出典未確認の数値・年。
- 既存用語の書き換え(誤りを見つけたら `docs/PROJECT_STATE.md` の申し送りへ)。
- `src/`(データ以外)・`scripts/`・`.github/`・設定ファイルの変更。
- GitHub MCP `push_files` での日本語ファイル送信(`git push` を使う)。
