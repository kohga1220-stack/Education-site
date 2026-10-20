
## 開発体制

サイトの設計・修正は Claude Code、用語の検索・追加は Antigravity が担当します。ルールは [AGENTS.md](AGENTS.md)、手順は [docs/WORKFLOW.md](docs/WORKFLOW.md) を参照してください。

```bash
npm run validate   # 用語データの検証
npm run ingest     # data-inbox/*.json を用語データへ取り込み
```
