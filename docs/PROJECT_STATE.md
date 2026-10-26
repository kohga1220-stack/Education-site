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
- [Antigravity→Claude Code] 統合提案: token-economy-system を special/token-economy に統合 (トークンエコノミー法は既に special/token-economy に登録あり)
- [Antigravity→Claude Code] 統合提案: procedural-declarative-memory を long-term-memory-types に統合 (手続き的記憶は既に psychology/long-term-memory-types に解説あり)
- [Antigravity→Claude Code] 統合提案: episodic-semantic-memory を long-term-memory-types に統合 (エピソード記憶・意味記憶は既に psychology/long-term-memory-types に解説あり)
- [Antigravity→Claude Code] 統合提案: tanaka-binet-intelligence-scale を evaluation/tanaka-binet に統合 (田中ビネー知能検査は既に evaluation/tanaka-binet に登録あり)
- [Antigravity→Claude Code] 統合提案: affect-attunement-stern を early-childhood/affect-attunement-intersubjectivity-stern に統合 (スターンの情動調律は既に early-childhood に登録あり)
- [Antigravity→Claude Code] 統合提案: second-rebellion-psychological-weaning を psychological-weaning に統合 (心理的離乳・反抗期は psychology/psychological-weaning に関連記載あり)
- [Antigravity→Claude Code] 統合提案: four-sources-of-self-efficacy を jiko-kouryokukan に統合 (自己効力感の4つの情報源は psychology/jiko-kouryokukan に統合可能)
- [Antigravity→Claude Code] 統合提案: zimmerman-self-regulated-cyclical を self-regulated-learning に統合 (自己調整学習の循環モデルは psychology/self-regulated-learning に統合可能)
- [Antigravity→Claude Code] 統合提案: cognitive-dissonance-reduction-process を cognitive-dissonance に統合 (認知的不協和の低減は psychology/cognitive-dissonance に統合可能)
- [Antigravity→Claude Code] 統合提案: hot-and-cool-executive-functions を executive-function に統合 (実行機能のホット・クール理論は psychology/executive-function に統合可能)
- [Antigravity→Claude Code] 統合提案: sociometric-status-peer-nomination を sociometry-moreno に統合 (ソシオメトリック・ステータスは psychology/sociometry-moreno に統合可能)
- [Antigravity→Claude Code] 統合提案: peer-assessment-feedback-loop を evaluation/peer-assessment に統合 (ピア・アセスメントは既に evaluation/peer-assessment に登録あり)
- [Antigravity→Claude Code] 統合提案: instruction-assessment-integration-practice を evaluation/shido-hyoka-ittaika に統合 (指導と評価の一体化は既に evaluation/shido-hyoka-ittaika に登録あり)
- [Antigravity→Claude Code] 統合提案: montessori-sensorial-didactic-materials を early-childhood/montessori-sensorial-materials-pink-tower に統合 (感覚教具は既に early-childhood に登録あり)
- [Antigravity→Claude Code] 統合提案: feeling-meter-moral-line を moral/emotion-meter-visualization-moral-shift に統合 (心情メーター・心の数直線は既に moral に登録あり)
- [Antigravity→Claude Code] 統合提案: service-learning-critical-reflection を service-learning に統合 (サービスラーニングは既に methods/service-learning に登録あり)
- [Antigravity→Claude Code] 統合提案: expert-group-home-group-dynamics を jigsaw-method に統合 (エキスパート活動・ホームグループは methods/jigsaw-method に統合可能)
- [Antigravity→Claude Code] 統合提案: role-play-deepening-moral-education を role-playing に統合 (役割演技は methods/role-playing に統合可能)
- [Antigravity→Claude Code] 統合提案: tactical-modified-games-pe を tgfu-tactical-approach に統合 (体育の戦術アプローチ・修正ゲームは methods/tgfu-tactical-approach に統合可能)
- [Antigravity→Claude Code] 統合提案: grasps-authentic-task-design を backward-design に統合 (GRASPSは methods/backward-design に統合可能)
- [Antigravity→Claude Code] 統合提案: essential-questions-wiggins-mctighe を backward-design に統合 (本質的な問いは methods/backward-design に統合可能)
- [Antigravity→Claude Code] 統合提案: problem-based-learning-pbl-tutorial を pbl に統合 (PBLチュートリアルは methods/pbl に統合可能)
- [Antigravity→Claude Code] 統合提案: project-internship-problem-solving を pbl に統合 (PBL型インターンシップは methods/pbl に統合可能)
- [Antigravity→Claude Code] 統合提案: open-closed-questioning-strategies を hatsumon に統合 (開いた発問・閉じた発問は methods/hatsumon に統合可能)
- [Antigravity→Claude Code] 統合提案: responsive-revoicing-questioning を hatsumon に統合 (リボイシングは methods/hatsumon に統合可能)
- [Antigravity→Claude Code] 統合提案: compulsory-education-school-nine-year-system を gimu-kyoiku-gakko に統合 (義務教育学校は既に system/gimu-kyoiku-gakko に登録あり)
- [Antigravity→Claude Code] 統合提案: public-night-middle-school-promotion を yakan-chugaku に統合 (夜間中学は既に system/yakan-chugaku に登録あり)
- [Antigravity→Claude Code] 統合提案: integrated-course-high-school-sangyo-shakai を sogo-gakka に統合 (総合学科は既に system/sogo-gakka に登録あり)
- [Antigravity→Claude Code] 統合提案: credit-system-high-school-grade-flexibility を tani-sei-koko に統合 (単位制高等学校は既に system/tani-sei-koko に登録あり)
- [Antigravity→Claude Code] 統合提案: part-time-and-correspondence-credit-flexibility を teijisei-kotogakko に統合 (定時制・通信制高校は既に system/teijisei-kotogakko 等に登録あり)
- [Antigravity→Claude Code] 統合提案: superintendent-of-education-appointment-term を kyoiku-cho に統合 (教育長は既に system/kyoiku-cho に登録あり)
- [Antigravity→Claude Code] 統合提案: general-education-council-mayoral-consultation を sogo-kyoiku-kaigi に統合 (総合教育会議は既に system/sogo-kyoiku-kaigi に登録あり)
- [Antigravity→Claude Code] 統合提案: specialized-training-college-three-courses を senshu-gakko に統合 (専修学校・各種学校は既に system/senshu-gakko に登録あり)
- [Antigravity→Claude Code] 統合提案: miscellaneous-school-legal-framework を senshu-gakko に統合 (専修学校・各種学校は既に system/senshu-gakko に登録あり)
- [Antigravity→Claude Code] 統合提案: special-teaching-license-recommendation-criteria を tokubetsu-menkyojo-hijokin-koshi に統合 (特別免許状は既に system/tokubetsu-menkyojo-hijokin-koshi に登録あり)
- [Antigravity→Claude Code] 統合提案: special-part-time-instructor-notification-scope を tokubetsu-menkyojo-hijokin-koshi に統合 (特別非常勤講師は既に system/tokubetsu-menkyojo-hijokin-koshi に登録あり)
- [Antigravity→Claude Code] 統合提案: japan-sport-council-mutual-aid-benefits を gakko-saigai-kyosai-kyufu に統合 (学校災害共済給付は既に system/gakko-saigai-kyosai-kyufu に登録あり)
- [Antigravity→Claude Code] 統合提案: compulsory-education-deferral-exemption-criteria を shugaku-yuyo-menjo に統合 (就学義務の猶予・免除は既に system/shugaku-yuyo-menjo に登録あり)
- [Antigravity→Claude Code] 統合提案: school-safety-plan-statutory-duty を gakko-anzen-suishin-keikaku に統合 (学校安全の計画は既に system/gakko-anzen-suishin-keikaku に登録あり)
- [Antigravity→Claude Code] 統合提案: school-entry-health-screening-procedures を special/shugakuji-kenko-shindan に統合 (就学時健康診断は既に special/shugakuji-kenko-shindan に登録あり)
- [Antigravity→Claude Code] 統合提案: school-education-law-article-35-suspension-order を guidance/shusseki-teishi に統合 (出席停止は既に guidance/shusseki-teishi に登録あり)
- [Antigravity→Claude Code] 統合提案: assistive-technology-special-needs を ict/assistive-technology-kyoiku に統合 (支援技術は既に ict/assistive-technology-kyoiku に登録あり)
- [Antigravity→Claude Code] 統合提案: new-kyoto-scale-psychological-development を evaluation/k-shiki-hattatsu-kensa に統合 (新版K式発達検査は既に evaluation/k-shiki-hattatsu-kensa に登録あり)
- [Antigravity→Claude Code] 統合提案: tanaka-binet-intelligence-scale-v-support を evaluation/tanaka-binet に統合 (田中ビネー検査は既に evaluation/tanaka-binet に登録あり)
- [Antigravity→Claude Code] 統合提案: homebound-bedside-education を special/houmon-kyoiku に統合 (訪問教育・ベッドサイド授業は既に special/houmon-kyoiku に登録あり)
- [Antigravity→Claude Code] 統合提案: school-postponement-exemption-history を system/shugaku-yuyo-menjo に統合 (就学猶予・免除は既に system/shugaku-yuyo-menjo に登録あり)
- [Antigravity→Claude Code] 統合提案: school-medical-care-system-nurse を special/iryoteki-care-ji に統合 (医療的ケア児・看護師配置は既に special/iryoteki-care-ji 等に登録あり)
- [Antigravity→Claude Code] 統合提案: suction-care-training-teachers-specified を special/iryoteki-care-ji に統合 (教員の特定行為は既に special/iryoteki-care-ji に統合可能)
- [Antigravity→Claude Code] 統合提案: special-class-establishment-standards を special/tokubetsu-shien-gakkyu に統合 (特別支援学級は既に special/tokubetsu-shien-gakkyu に登録あり)
- [Antigravity→Claude Code] 統合提案: high-school-special-needs-promotion を special/koko-tsukyu に統合 (高校の特別支援・通級は既に special/koko-tsukyu に登録あり)
- [Antigravity→Claude Code] 統合提案: parallel-attendance-daycare-kindergarten を special/soki-hakken-soki-ryoiku に統合 (早期療育・並行通園は既に special/soki-hakken-soki-ryoiku に統合可能)
- [Antigravity→Claude Code] 統合提案: un-crpd-japan-concluding-observations-2022 を special/shogaisha-kenri-joyaku に統合 (障害者権利条約・総括所見は既に special/shogaisha-kenri-joyaku に統合可能)
- [Antigravity→Claude Code] 統合提案: sensory-integration-therapy-equipment を special/kankaku-togo-ryoho に統合 (感覚統合療法は既に special/kankaku-togo-ryoho に登録あり)
- [Antigravity→Claude Code] 統合提案: voca-assistive-technology-communication を special/aac に統合 (VOCAは既に special/aac に統合可能)
- [Antigravity→Claude Code] 統合提案: captioning-notetaking-support を special/chokaku-shogai-kyoiku に統合 (聴覚障害支援は既に special/chokaku-shogai-kyoiku に統合可能)
- [Antigravity→Claude Code] 統合提案: co-op-approach-motor-coordination を special/dcd に統合 (DCDへの支援は既に special/dcd に統合可能)
- [Antigravity→Claude Code] 統合提案: dyscalculia-number-line-manipulatives を special/dyscalculia に統合 (算数障害への指導は既に special/dyscalculia に統合可能)
- [Antigravity→Claude Code] 統合提案: low-vision-loupe-monocular を special/low-vision-kakudai-kyokasho に統合 (ロービジョン支援機器は既に special/low-vision-kakudai-kyokasho に統合可能)

