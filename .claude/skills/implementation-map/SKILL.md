---
name: implementation-map
description: riddle-toolkit の現在の機能と実装(新規ツールの追加手順・コード上の慣習・共通モジュール・各ツールの構造と拡張点)をワークフローで把握する。機能追加・既存ツールの拡張・改修の依頼に着手する前、またはユーザーが「先に実装を把握して」と求めたときに使う。
---

# 実装の把握(implementation-map)

機能追加・拡張の依頼にすぐ着手できるよう、リポジトリの現在の実装をワークフローで調べ、会話の文脈として保持する。

## 手順

1. Workflow ツールを次の台本で起動する。
   - `scriptPath`: `/home/futa/riddle-toolkit/.claude/skills/implementation-map/implementation-map.workflow.js`
   - 調べたいツールが決まっている場合は、ツール登録上の id を `args` で渡す(例: `{ "focus": ["char-shifter"] }`)。指定したツールは深く読み、それ以外は浅く読む。指定がなければ全ツールを同じ深さで読む。
   - `args` は JSON の値として渡す(文字列化しない)。
2. 完了後、結果をユーザーへ要約して報告する。
   - 戻り値に `error`・`failed_groups`・`skipped_groups`・`unknown_focus`・`synthesis_failed` がある場合は、黙って省かず報告に含める。
   - `rules_read` に受託者規則の読了が明記されていないエージェントの結果は未検証として扱う。
   - 報告の書式は利用者のグローバル規則に従う。
3. 把握した内容(追加手順・慣習・共通モジュール・各ツールの拡張点)は会話の文脈として保持し、続く追加・拡張依頼にそのまま使う。調査結果をファイルに保存しない。
