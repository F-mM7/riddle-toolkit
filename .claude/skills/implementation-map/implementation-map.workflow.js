export const meta = {
  name: 'implementation-map',
  description: 'riddle-toolkit の機能追加・拡張をすぐ始められるよう、共通の仕組みと各ツールの実装を把握する',
  whenToUse: '機能追加・既存ツールの拡張・改修に着手する前。args.focus にツール id の配列を渡すとそのツールを深く読む',
  phases: [
    { title: 'Scout', detail: '構成・追加手順・慣習を把握し、ツールを最大7グループに分割' },
    { title: 'Inspect', detail: 'グループごとに実装を精読(focus 対象は深く、それ以外は浅く)' },
    { title: 'Synthesize', detail: '結果を統合し、追加手順と拡張点を再確認' },
  ],
}

const REPO = '/home/futa/riddle-toolkit'

// args.focus: ツール id(src/types/tools.ts の TOOLS[].id。例: "char-shifter")の配列。文字列1つも受け付ける
const rawFocus = args && args.focus !== undefined ? args.focus : []
const FOCUS = (Array.isArray(rawFocus) ? rawFocus : [rawFocus])
  .filter((x) => typeof x === 'string' && x.trim() !== '')
  .map((x) => x.trim())
const HAS_FOCUS = FOCUS.length > 0
if (HAS_FOCUS) log(`focus 指定: ${FOCUS.join(', ')}`)

const RULES = `## 受託者規則
- 作業開始前に /home/futa/.claude/SUBAGENT_RULES.md を Read し、読むだけでなく従うこと。受託者の種類はワークフロー内エージェント。該当節は「## 共通」と「## ワークフロー内エージェント」。
- 読めなかった場合は作業せず、その旨を結論として報告すること(rules_read に「読めなかった」と書き、他の配列項目は空にする)。
- 最終報告(スキーマの rules_read)に読了の有無と該当節を明記すること。最終報告は受託者規則「## 共通」の書式の要素(結論・編集の有無・未検証)をスキーマの各項目で担うこと。`

const COMMON = `## 権限
- 読み取り専用。ファイルの作成・編集・削除は禁止。git の書き込み系操作(commit/push/reset/stash 等)は禁止。git log / git status / git diff 等の読み取りは可。
- 開発サーバ起動・ビルド・テスト実行・ブラウザ操作は不要(静的情報で判断すること)。
## 情報の取得
- リポジトリの状態(ファイル内容・git 履歴)は変化しうるため、他エージェントや本依頼文から渡された情報(パス・行番号・ツール一覧を含む)を前提として使い回さず、必ず自分でその場で取得し直して確認すること。依頼文中のパスは前回調査時点の情報で、変わっている可能性がある。
- 断定には根拠(ファイルパス:行番号、実行したコマンド)を添えること。根拠のない推測は unverified に入れること。`

const BASE_SCHEMA_PROPS = {
  rules_read: { type: 'string', description: '受託者規則の読了の有無と該当節' },
  edited: { type: 'string', description: '編集の有無(本作業は「なし」のはず)' },
  unverified: { type: 'array', items: { type: 'string' } },
}
const BASE_REQUIRED = ['rules_read', 'edited', 'unverified']

const STR_ARRAY = { type: 'array', items: { type: 'string' } }

// 共通の仕組み(偵察と統合で使う)
const COMMON_KNOWLEDGE_PROPS = {
  stack: { type: 'string', description: '技術スタック(主要ライブラリとバージョン)と dev/build/lint/format/typecheck 等のコマンド(根拠: package.json の行番号等)' },
  add_tool_steps: {
    type: 'array',
    description: '新しいツールを追加する手順。登録(src/types/tools.ts)・ルート(src/App.tsx)・コンポーネント/ユーティリティのディレクトリ・CSS Modules・ジャンル・アイコン等',
    items: {
      type: 'object',
      properties: {
        step: { type: 'string', description: 'やること' },
        files: { type: 'array', items: { type: 'string' }, description: '実在するファイルパスと行番号(例: src/App.tsx:31)' },
        example: { type: 'string', description: '既存ツールでの実例(パス:行番号)' },
      },
      required: ['step', 'files', 'example'],
    },
  },
  conventions: { ...STR_ARRAY, description: 'コード上の慣習(命名・ファイル配置・状態管理・CSS Modules・共通部品・データファイルの使い方・コメント言語等)。各項目に根拠' },
  shared_modules: {
    type: 'array',
    description: '複数ツールで再利用できる共通ユーティリティ・共通コンポーネント・データ(src/data/ 等)',
    items: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        provides: { type: 'string', description: '提供する機能・データ' },
        used_by: { type: 'array', items: { type: 'string' }, description: '利用しているツール(根拠: grep 結果等)' },
      },
      required: ['path', 'provides', 'used_by'],
    },
  },
}

phase('Scout')
const scout = await agent(`# 依頼: riddle-toolkit の共通の仕組みの把握とツールのグループ分割
## 目的
ユーザーがこれから機能追加・既存ツールの拡張を依頼する。依頼後すぐに着手できるよう、新しいツールの追加手順・コード上の慣習・共通モジュールを把握し、後続エージェントがツールごとに実装を精読できるよう全ツールをグループに分割する。
## 範囲と対象外
- 範囲: ${REPO} 全体(node_modules・dist・.git は除く)。package.json、README 等の文書、ツール登録(前回調査時点では src/types/tools.ts)、ルーティング(同 src/App.tsx)、src/components/<Tool>/、src/utils/<tool>/、src/data/、src/types/、Home・Layout 等の共通コンポーネント、直近の git log(30件程度)。
- 対象外: 個々のツールの詳細な精読(後続が行う)。不具合探し。改善提案。
${COMMON}
${RULES}
## やること
1. 技術スタックとコマンドを把握する。
2. 新しいツールを1つ追加するのに必要な手順を、実在するファイルと行番号付きで列挙する(登録・ジャンル・アイコン・ルート・ディレクトリ・CSS Modules・ユーティリティ分離など)。直近にツールを追加したコミットがあれば git show で実例を確かめる。
3. コード上の慣習と、複数ツールで再利用できる共通モジュール・データを挙げる(利用ツールは grep で確かめる)。
4. ツール登録に載っている全ツールを列挙し、id(登録上の id)と主要ファイルパスを挙げる。登録とルート・ディレクトリの食い違いがあれば notes に書く。
5. 全ツールを最大7グループに分ける。${HAS_FOCUS
    ? `focus 指定のツール ${JSON.stringify(FOCUS)} は、それぞれ単独グループ(depth: "deep")にする(focus が7件を超える場合は関連の強いものだけ同じグループにまとめる)。それ以外のツールは残りの枠で関連の強いものをまとめて depth: "shallow" にする。focus 指定の id が登録に見当たらない場合は unknown_focus に入れる。`
    : '関連の強いツールはまとめ、直近で活発に開発されているツールは単独グループにする。全グループ depth: "deep" とする。'}
## 完了条件
全ツールがいずれかのグループに入り、各グループに主要ファイルパスが付き、追加手順の各段に実在するファイルと行番号が付いていること。`, {
  label: 'scout',
  phase: 'Scout',
  schema: {
    type: 'object',
    properties: {
      ...BASE_SCHEMA_PROPS,
      ...COMMON_KNOWLEDGE_PROPS,
      unknown_focus: { ...STR_ARRAY, description: '登録に見当たらなかった focus 指定の id(なければ空)' },
      groups: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            depth: { type: 'string', enum: ['deep', 'shallow'] },
            tools: { type: 'array', items: { type: 'string' }, description: 'ツール id' },
            files: { type: 'array', items: { type: 'string' } },
            notes: { type: 'string' },
          },
          required: ['name', 'depth', 'tools', 'files'],
        },
      },
    },
    required: [...BASE_REQUIRED, 'stack', 'add_tool_steps', 'conventions', 'shared_modules', 'unknown_focus', 'groups'],
  },
})

if (!scout) {
  return { error: 'scout が失敗した(エージェントが結果を返さなかった)', scout }
}
if (!Array.isArray(scout.groups) || scout.groups.length === 0) {
  return { error: 'scout のグループが0件(受託者規則の読了失敗の可能性)', scout_rules_read: scout.rules_read, scout }
}
let groups = scout.groups
if (groups.length > 7) {
  log(`scout が ${groups.length} グループを返したため、先頭7グループのみ精読する。精読しないグループ: ${groups.slice(7).map((g) => g.name).join(', ')}`)
}
const skippedGroups = groups.slice(7).map((g) => g.name)
groups = groups.slice(0, 7)
log(`グループ数: ${groups.length}(deep ${groups.filter((g) => g.depth === 'deep').length} / shallow ${groups.filter((g) => g.depth !== 'deep').length})`)
if (scout.unknown_focus && scout.unknown_focus.length) log(`登録に見当たらない focus: ${scout.unknown_focus.join(', ')}`)

const TOOL_PROPS_DEEP = {
  id: { type: 'string' },
  name: { type: 'string', description: '表示名' },
  purpose: { type: 'string', description: '目的と、現在できること' },
  capabilities: { ...STR_ARRAY, description: 'できること(機能)の一覧。各項目に根拠' },
  files: {
    type: 'array',
    items: {
      type: 'object',
      properties: { path: { type: 'string' }, role: { type: 'string' } },
      required: ['path', 'role'],
    },
    description: '主要ファイルとその役割',
  },
  state_and_data_flow: { type: 'string', description: '状態(useState 等)の持ち方と、入力→処理(utils)→表示のデータの流れ。根拠付き' },
  extension_points: { ...STR_ARRAY, description: '拡張するときに手を入れる箇所(パス:行番号と、そこで何を変えるか)' },
  dependencies: { ...STR_ARRAY, description: '依存している共通モジュール・データ・外部ライブラリ' },
  known_limits: { ...STR_ARRAY, description: '既知の制約・不具合(根拠付き。主目的ではないので簡潔に)' },
}
const TOOL_REQUIRED = Object.keys(TOOL_PROPS_DEEP)

const INSPECT_SCHEMA = {
  type: 'object',
  properties: {
    ...BASE_SCHEMA_PROPS,
    group: { type: 'string' },
    depth: { type: 'string', enum: ['deep', 'shallow'] },
    tools: { type: 'array', items: { type: 'object', properties: TOOL_PROPS_DEEP, required: TOOL_REQUIRED } },
  },
  required: [...BASE_REQUIRED, 'group', 'depth', 'tools'],
}

const DEEP_TODO = `各ツールについて、エントリのコンポーネントから import を辿り、関連する全ファイル(コンポーネント・utils・CSS Modules・データ・型)を読むこと。スキーマの全項目を根拠付きで埋める。特に extension_points は、典型的な拡張(入力形式の追加・オプションの追加・表示の追加など、そのツールで起こりうるもの)ごとに、手を入れる関数・コンポーネント・行番号を具体的に挙げる。直近の変更(git log -- <パス>)も確認し、拡張の流儀の参考にする。`
const SHALLOW_TODO = `各ツールについて、エントリのコンポーネントと主要な utils の冒頭・export を読む程度にとどめる(全ファイルの精読は不要)。purpose・capabilities・files・dependencies を根拠付きで埋め、state_and_data_flow は1〜2文、extension_points は主要な1〜3箇所、known_limits は目についたものだけでよい(なければ空配列)。`

phase('Inspect')
const inspected = await pipeline(groups, (g) => agent(`# 依頼: 「${g.name}」の実装の把握(${g.depth === 'deep' ? '精読' : '概要把握'})
## 目的
ユーザーがこれから機能追加・既存ツールの拡張を依頼する。依頼後すぐに着手できるよう、このグループのツールの機能・構造・データの流れ・拡張点を把握する。不具合探しは主目的ではない。
## 範囲と対象外
- 範囲: 次のツール(id): ${JSON.stringify(g.tools)}。起点ファイル: ${JSON.stringify(g.files)}(起点にすぎないので、import を辿って関連ファイルも確認すること)。
- 参考(自分で取得し直して確認すること): 偵察役の補足: ${JSON.stringify(g.notes || 'なし')}。偵察役が挙げた共通モジュール: ${JSON.stringify((scout.shared_modules || []).map((m) => m.path))}。
- 対象外: 他グループのツール。改善提案・設計案の作成。テスト・ビルドの実行。
${COMMON}
${RULES}
## やること
${g.depth === 'deep' ? DEEP_TODO : SHALLOW_TODO}
depth には "${g.depth === 'deep' ? 'deep' : 'shallow'}" を入れること。
## 完了条件
範囲内の全ツールについて、スキーマの全項目が${g.depth === 'deep' ? '根拠付きで' : '上記の粒度で'}埋まっていること。`, {
  label: `inspect:${g.name}`,
  phase: 'Inspect',
  schema: INSPECT_SCHEMA,
}))

const ok = inspected.filter(Boolean)
const failed = groups.filter((g, i) => !inspected[i]).map((g) => ({ name: g.name, tools: g.tools }))
if (failed.length) log(`精読に失敗したグループ: ${failed.map((f) => f.name).join(', ')}`)
if (ok.length === 0) {
  return { error: '全グループの精読に失敗した', failed, skipped_groups: skippedGroups, scout }
}

phase('Synthesize')
const synthesis = await agent(`# 依頼: 実装把握の統合と、追加手順・拡張点の再確認
## 目的
各グループの調査結果を統合し、機能追加・拡張の依頼にすぐ着手できる「実装の地図」を作る。統合の過程で、重要な主張(特に新規ツールの追加手順・各ツールの extension_points・known_limits)を自分でファイルを開いて再確認し、誤り(存在しないパス・ずれた行番号・誤った説明)を直すか除く。
## 範囲と対象外
- 範囲: 下記の調査結果に含まれる主張の再確認と統合。
- 対象外: 新たなツールの調査、改善案・設計案の作成。
${COMMON}
${RULES}
## 入力(他エージェントの調査結果。前提として鵜呑みにせず、重要項目は自分で再確認すること)
focus 指定: ${JSON.stringify(FOCUS)}
偵察結果: ${JSON.stringify({ stack: scout.stack, add_tool_steps: scout.add_tool_steps, conventions: scout.conventions, shared_modules: scout.shared_modules, unknown_focus: scout.unknown_focus, unverified: scout.unverified })}
精読結果: ${JSON.stringify(ok)}
精読に失敗したグループ: ${JSON.stringify(failed)}
精読しなかったグループ(7グループ上限超過): ${JSON.stringify(skippedGroups)}
## やること
1. 共通の仕組み(stack・add_tool_steps・conventions・shared_modules)を、精読結果も踏まえて確定させる。add_tool_steps の各ファイル・行番号は必ず自分で開いて確かめる。
2. 全ツールを1つずつ整理する。深く読んだツール(depth: deep)は精読結果の各項目を再確認して残し、浅く読んだツールは浅いまま残す(新たに深く調べない)。精読に失敗した・精読しなかったグループのツールは coverage を "missing" とし、他の項目は空にする。
3. 再確認で誤りと分かった主張は rejected_claims に、確かめきれなかった主張は unverified に入れる。
## 完了条件
偵察結果の全ツールが tools に1つずつ入り、add_tool_steps と focus 指定ツールの extension_points が再確認済みであること。`, {
  label: 'synthesize',
  phase: 'Synthesize',
  schema: {
    type: 'object',
    properties: {
      ...BASE_SCHEMA_PROPS,
      overview: { type: 'string', description: 'アプリ全体の概要(2〜4文)' },
      ...COMMON_KNOWLEDGE_PROPS,
      tools: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            ...TOOL_PROPS_DEEP,
            coverage: { type: 'string', enum: ['deep', 'shallow', 'missing'] },
          },
          required: [...TOOL_REQUIRED, 'coverage'],
        },
      },
      rejected_claims: { ...STR_ARRAY, description: '再確認で誤りと分かった主張と、その根拠' },
    },
    required: [...BASE_REQUIRED, 'overview', 'stack', 'add_tool_steps', 'conventions', 'shared_modules', 'tools', 'rejected_claims'],
  },
})

if (!synthesis) log('統合エージェントが結果を返さなかった。偵察・精読結果のみを返す')

return {
  focus: FOCUS,
  unknown_focus: scout.unknown_focus || [],
  rules_read: {
    scout: scout.rules_read,
    inspect: ok.map((r) => ({ group: r.group, rules_read: r.rules_read, edited: r.edited })),
    synthesize: synthesis ? synthesis.rules_read : null,
  },
  failed_groups: failed,
  skipped_groups: skippedGroups,
  synthesis_failed: !synthesis,
  synthesis,
  // 統合が失敗した場合に備えて生の結果も返す
  raw: synthesis ? null : { scout, inspected: ok },
}
