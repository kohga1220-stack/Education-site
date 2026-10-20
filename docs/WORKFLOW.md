# ワークフロー(2エージェント体制)

```
 ユーザー ──依頼──▶ Claude Code  (設計・修正)   ── PR ──┐
        └──依頼──▶ Antigravity  (調査・追加)   ── PR ──┤
                                                       ▼
                                  CI: Validate(validate / tsc / build / 変更範囲)
                                                       ▼
                                   自分の PR を自分で squash マージ
                                                       ▼
                                      main → Deploy to GitHub Pages
```

## 共通

- 作業は必ず**専用ブランチ**で行い、`main` へは PR 経由(squash マージ)。
- ブランチ名: Claude Code は `claude/<内容>`、Antigravity は `antigravity/<yyyymmdd>-<分野や内容>`。
- マージ前チェック: `npm run validate`(エラー0)、`npx tsc --noEmit`、`npm run build`、PR の `Validate` が緑。
- マージ後: `Deploy to GitHub Pages` が成功したか確認する(失敗したらすぐ原因を直す。放置しない)。
- PR の本文に「追加/変更の要約」「出典の種類」「検証結果」を書く。

## Antigravity: 用語追加の流れ

1. `git fetch origin && git checkout -B antigravity/<日付>-<内容> origin/main`(毎回、最新の `main` から)
2. 調査して `data-inbox/<日付>-<内容>.json` を作る(形式は `data-inbox/README.md`)。
3. `npm run ingest -- --dry-run` で確認 → `npm run ingest -- --keep` で取り込み(失敗時は自動で元に戻る)。
4. `npm run validate` / `npx tsc --noEmit` / `npm run build`。
5. `git add data-inbox src/data/terms && git commit && git push -u origin <ブランチ>` → PR → CI が緑なら squash マージ。
6. 取り込み済みの inbox JSON は、マージ後の次の作業で削除してよい(履歴には残る)。

### コンフリクトしたら(用語ファイルの末尾追記が衝突する)

```bash
git fetch origin
git checkout origin/main -- src/data/terms     # 用語ファイルを main の状態に戻す
npm run ingest -- --keep                        # inbox から再取り込み(重複は自動で却下)
npm run validate && git add -A && git commit -m "rebase: 用語を再取り込み" && git push -f origin HEAD
```

## Claude Code: 修正の流れ

1. `claude/<内容>` ブランチ → 修正 → `tsc` / `build` / `validate` → PR → 緑ならマージ。
2. `antigravity/*` の PR は、変更が `data-inbox/` と `src/data/terms/` のみで CI が緑なら、内容の抜き取り確認の上でマージしてよい。

## 変更範囲のガード

`.github/workflows/validate.yml` は `antigravity/*` ブランチの PR で、`data-inbox/`・`src/data/terms/`・`docs/PROJECT_STATE.md` 以外のファイルが変更されていると失敗する。

## 注意点

- `GITHUB_TOKEN` によるマージは別ワークフローを起動しないため、自動マージ専用の GitHub Action は置いていない。各エージェントが CI の緑を確認して自分でマージする。
- GitHub MCP の `push_files` は日本語の大きなファイルを壊すことがあった。**`git push` を使う**。
- `package-lock.json` はコミットしない(CI は `npm install`)。
