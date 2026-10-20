# プロジェクトの現状と履歴

最終更新: 2026-10-20 / 用語数 **1,109** / 分野 14 / 公開: GitHub Pages(`main` への push で自動デプロイ)

## 分野別の語数

| 分野ID | 分野名 | 語数 | 分野ID | 分野名 | 語数 |
|---|---|---|---|---|---|
| philosophy | 教育思想・哲学 | 83 | sociology | 教育社会学 | 83 |
| psychology | 教育心理学 | 82 | guidance | 生徒指導・相談 | 84 |
| methods | 教授法・学習指導 | 88 | ict | ICT・現代的課題 | 86 |
| system | 教育制度・政策 | 85 | comparative | 比較教育・国際教育 | 70 |
| special | 特別支援教育 | 81 | history | 教育史・制度史 | 69 |
| moral | 道徳・人格教育 | 81 | early-childhood | 幼児教育・保育 | 69 |
| evaluation | 教育評価・測定 | 81 | higher-ed | 高等教育・大学論 | 67 |

(正確な数は `npm run validate` の先頭行で確認する。)

## 技術構成

- Next.js 14(App Router, `output: 'export'`)/ TypeScript / Tailwind CSS。ビルド出力は `out/`、リンクは `/Education-site/` のベースパス付き。
- 静的ページ: トップ1 + `_not-found` + 分野ページ14 + 用語ページ(用語数分)。
- 五十音検索: `src/lib/terms.ts` の `filterTerms` は `kana` が**1文字ちょうど**(または `A–Z`)であることを前提にする。並び順は `reading.localeCompare('ja')`。
- 分野の色: `src/lib/categoryColors.ts` の3つの `Record<CategoryId,string>`(BADGE/DOT/SOLID)に**全分野**が必要。Tailwind は `src/lib/**/*` もスキャンする設定(`tailwind.config.ts`)。
- デプロイ: `.github/workflows/deploy.yml`(`main` push / 手動)。検証: `.github/workflows/validate.yml`(PR・push)。

## 経緯

1. 初期: 10分野・563語。
2. 分野追加(比較教育・国際教育 / 教育史・制度史 / 幼児教育・保育 / 高等教育・大学論)と語数拡充 → 842語 → 1,121語。全用語を Web 検索で裏取りして執筆。
3. 「学習指導要領」の詳細解説と、年月の変遷を整理した新項目「学習指導要領の変遷」(`gakushu-shido-yoryo-hensen`)を追加。
4. PR #1 を `main` にマージ。
5. 不具合修正:
   - 分野ページが空表示 → 存在しない分野ID(`edtech` `career` `inclusive-education` `tokubetsu-shien-in`)が原因。修正し、新4分野の色定義と Tailwind スキャン対象を追加。
   - 誤字(簡体字・誤変換: 「遊」→「遣」、`遗` `钣` `抖` `攝` `双减` 等)、英語の混入、括弧の不整合、`kana`(五十音インデックス)243件の誤りを一括修正。
6. 2エージェント体制の整備(この文書の追加): 検証・取り込みスクリプト、`AGENTS.md` ほか。このとき**同一概念の重複12組**を検出して統合(1,121 → 1,109語)。

## 重複統合の記録(12組)

統合先は最も参照の多い項目。別名・副分野・タグ・関連は統合先へ引き継ぎ、旧 slug への参照は付け替え済み。
学習の転移 / 高大接続改革 / 幼児教育・保育の無償化 / 交流及び共同学習 / 特別支援教育支援員 / 大学入学共通テスト / 高等教育の修学支援新制度 / 要保護児童対策地域協議会 / NAPLAN / 幼児期の終わりまでに育ってほしい姿 / 三つのポリシー / ファカルティ・ディベロップメント。
**教訓: 同じ概念を別 slug で二重登録しやすい。追加前に必ず検索する。**

## 過去に起きた問題と防止策(必読)

| 問題 | 原因 | 防止 |
|---|---|---|
| 分野ページが空 | 存在しない分野ID | `validate` が不正IDを検出 |
| 文字化け・欠落 | GitHub MCP `push_files` が日本語の大ファイルを壊す | `git push` を使う |
| 簡体字/異体字の混入 | 並列調査エージェントの出力 | `validate` が JIS X 0213 外の字をエラーにする。第1水準外は警告 |
| 五十音で出ない語 | `kana` が複数文字・濁音・括弧 | `kana` は自動計算(`ingest`)、`validate` が不一致を検出 |
| 同一概念の二重登録 | 題名ゆれ・略称 | `validate` が括弧書きを除いた題名の一致を検出。読み一致は警告 |
| 色が出ない/型エラー | `categoryColors.ts` の分野漏れ | `tsc` が検出 |
| 参照切れ | 存在しない `relatedSlugs` | `validate` が検出、`ingest` は自動で除外 |

正当な例外(誤りではない): 旧字体の人名(國分康孝・慶應義塾・小尾乕雄・澤柳)、キリル文字の EGE、ギリシャ文字 α/θ/η、「CHARACTER COUNTS!」の「！」、「内容項目」中の「，」。

## 今後の方針

- Claude Code: サイト設計・修正・保守。
- Antigravity: 用語の検索・追加(`data-inbox/` → `npm run ingest`)。
- 追加の優先候補(Antigravity が提案してよい): 各分野 +20 語ずつ、特に語数の少ない `higher-ed` `early-childhood` `history` `comparative`。他分野の重要語の抜け(教員採用試験頻出語、最新の答申・法改正)。

## 申し送り(エージェント間の連絡欄)

<!-- 例: [Antigravity→Claude Code] 2026-10-21 `xxx` の本文に誤りの可能性: 〜 -->

(現在なし)
