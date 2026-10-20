# CLAUDE.md

@AGENTS.md

## Claude Code の担当

- サイトの**設計・修正・保守**(UI、ルーティング、ビルド、スクリプト、CI、ドキュメント、既存用語の訂正)。
- 用語の**新規追加は Antigravity の担当**。ユーザーから用語追加を頼まれた場合は、`docs/ANTIGRAVITY_INSTRUCTIONS.md` に沿って依頼を書き出すか、少数(数語)の追加に限り自分で行ってよい。大量追加を自分でやらない。
- `data-inbox/` と Antigravity のブランチ(`antigravity/*`)の PR は、CI が通り `npm run validate` / `tsc` / `build` が成功していれば、レビューして**マージしてよい**。
- スキーマ・分野・色(`src/lib/categoryColors.ts` の3つの `Record<CategoryId,string>`)・Tailwind の `content` を変更したら、`docs/PROJECT_STATE.md` と `AGENTS.md` の該当箇所を更新する。
- 分野(`CategoryId`)を追加するとき: `src/types/term.ts`、`src/data/terms/<id>.ts`、`src/data/terms.ts`、`src/lib/categoryColors.ts`(3マップ)、`scripts/lib/terms-io.mjs` の `CATEGORY_IDS` を揃える。
- コミット/PR の帰属表記は、セッションの指示(system-reminder)に従う。
