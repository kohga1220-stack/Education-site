# プロジェクトの現状と履歴

最終更新: 2026-10-26 / 用語数 **2,578** / 分野 14 / 公開: GitHub Pages(`main` への push で自動デプロイ)

## 分野別の語数

| 分野ID | 分野名 | 語数 | 分野ID | 分野名 | 語数 |
|---|---|---|---|---|---|
| philosophy | 教育思想・哲学 | 183 | sociology | 教育社会学 | 183 |
| psychology | 教育心理学 | 182 | guidance | 生徒指導・相談 | 184 |
| methods | 教授法・学習指導 | 187 | ict | ICT・現代的課題 | 185 |
| system | 教育制度・政策 | 185 | comparative | 比較教育・国際教育 | 189 |
| special | 特別支援教育 | 181 | history | 教育史・制度史 | 188 |
| moral | 道徳・人格教育 | 181 | early-childhood | 幼児教育・保育 | 189 |
| evaluation | 教育評価・測定 | 180 | higher-ed | 高等教育・大学論 | 181 |

(2026-10-26 時点。正確な数は `npm run validate` の先頭行で確認する。)

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

7. Antigravity が `data-inbox` 経由で追加: PR #2(4分野×20語=80語)、PR #3(全14分野×100語=1,400語)→ 2,589語。受け入れ後の点検で、同一主題の二重登録11組を統合し、全角英数字・漢数字の年号を半角算用数字に統一して **2,578語**。`validate` に全角英数・漢数字年号・題名長(30字超)の警告を追加。

## 重複統合の記録(12組、初回)

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

- [Antigravity→Claude Code] 統合提案: yoshida-shoin-shiseikanno-kyouiku を yoshida-shoin に統合 (吉田松陰の教育思想は既に philosophy/yoshida-shoin に記載あり)
- [Antigravity→Claude Code] 統合提案: nakae-chomin-sansuijin-rousseau を nakae-chomin に統合 (中江兆民の思想は既に philosophy/nakae-chomin に記載あり)
- [Antigravity→Claude Code] 統合提案: nitobe-inazo-bushido-international を nitobe-inazo に統合 (新渡戸稲造の思想・武士道は既に philosophy/nitobe-inazo に記載あり)
- [Antigravity→Claude Code] 統合提案: nel-noddings-care-ethics を noddings-care に統合 (ノディングスのケアの倫理は既に moral/noddings-care に記載あり)
- [Antigravity→Claude Code] 統合提案: carol-gilligan-different-voice を gilligan-care-ethics に統合 (ギリガンのケアの倫理は既に moral/gilligan-care-ethics に記載あり)
- [Antigravity→Claude Code] 統合提案: katsu-kaishu-naval-training-school を kobe-naval-training-center-katsu-kaishu に統合 (勝海舟の海軍教育は history/kobe-naval-training-center-katsu-kaishu と主題重複)
- [Antigravity→Claude Code] 統合提案: martha-nussbaum-creating-capabilities を capability-approach に統合 (ヌスバウムのケイパビリティ論は philosophy/capability-approach に統合可能)
- [Antigravity→Claude Code] 統合提案: amartya-sen-development-as-freedom を capability-approach に統合 (センの潜在能力アプローチは philosophy/capability-approach に統合可能)
- [Antigravity→Claude Code] 統合提案: wilhelm-von-humboldt-bildung を bildung に統合 (フンボルトの陶冶論は philosophy/bildung に統合可能)

