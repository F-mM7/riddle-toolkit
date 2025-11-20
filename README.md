# Riddle Toolkit

文字解析・パズルソルバーツール集

## 概要

6つの文字解析・パズル解決ツールを集約したWebアプリケーションです。

## 収録ツール

### 1. char-counter
文字解析・統計表示ツール。テキストの統計情報をリアルタイムで分析・表示します。

### 2. difference-of-character-set
文字集合の差分計算ツール。2つのテキスト入力を比較し、文字セットの差分をリアルタイムで計算します。

### 3. shiritori-solver
しりとりソルバー。入力された単語リストから、しりとりの全解を見つけるツールです。

### 4. word-venn
3単語ベン図可視化ツール。3つの単語に含まれる文字の重複関係をベン図として視覚化します。

### 5. babanuki
ババ抜き解析ツール。入力文字列からペアになった文字と未ペア文字を検出します。

### 6. word-lattice-solver
単語格子ソルバー。格子点に文字を配置して全てのセルの単語を構成します。

## 技術スタック

- React 19.1
- TypeScript
- Vite
- React Router
- CSS Modules

## 開発

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# Lintチェック
npm run lint

# 型チェック
npm run typecheck
```

## デプロイ

GitHub Pagesにデプロイするには、`gh-pages`パッケージをインストールして以下を実行します。

```bash
# gh-pagesパッケージのインストール
npm install --save-dev gh-pages

# package.jsonにdeployスクリプトを追加
# "deploy": "npm run build && gh-pages -d dist"

# デプロイ実行
npm run deploy
```

## 公開URL

https://f-mm7.github.io/riddle-toolkit/

## ライセンス

開発者: F-mm7
