// 共通型定義
import type { LucideIcon } from 'lucide-react';
import {
  FileDigit,
  CircleMinus,
  Link,
  Spade,
  VectorSquare,
  Cross,
  Grid,
  Blend,
  MapPin,
  ArrowRightLeft,
  Box,
  FlipHorizontal2,
  Shuffle,
  SkipForward,
  Hash,
  Waypoints,
  TextWrap,
  TextCursor,
  Eraser,
  Route,
  LayoutGrid,
} from 'lucide-react';

/** ツールのジャンル(トップページの区切り) */
export type ToolGenre = 'count' | 'convert' | 'view' | 'solve' | 'sequence';

/** ジャンルの表示順と見出し名 */
export const TOOL_GENRES: readonly { id: ToolGenre; name: string }[] = [
  { id: 'count', name: '数える・比べる' },
  { id: 'convert', name: '変換する' },
  { id: 'view', name: '並べて見る' },
  { id: 'solve', name: '解く・探す' },
  { id: 'sequence', name: '有名シーケンス' },
];

export interface ToolInfo {
  id: string;
  name: string;
  path: string;
  icon: LucideIcon;
  genre: ToolGenre;
}

// ジャンルごとに、ジャンル内の表示順で並べる
export const TOOLS: ToolInfo[] = [
  {
    id: 'char-counter',
    name: '文字カウンター',
    path: '/char-counter',
    genre: 'count',
    icon: FileDigit,
  },
  {
    id: 'difference-of-character-set',
    name: '差集合',
    path: '/difference-of-character-set',
    genre: 'count',
    icon: CircleMinus,
  },
  {
    id: 'babanuki',
    name: '文字ババ抜き',
    path: '/babanuki',
    genre: 'count',
    icon: Spade,
  },
  {
    id: 'word-venn',
    name: '単語ベン図',
    path: '/word-venn',
    genre: 'count',
    icon: Blend,
  },
  {
    id: 'char-shifter',
    name: '文字ずらし',
    path: '/char-shifter',
    genre: 'convert',
    icon: ArrowRightLeft,
  },
  {
    id: 'number-to-char',
    name: '数字→文字変換',
    path: '/number-to-char',
    genre: 'convert',
    icon: Hash,
  },
  {
    id: 'char-picker',
    name: 'n文字目抽出',
    path: '/char-picker',
    genre: 'convert',
    icon: TextCursor,
  },
  {
    id: 'tanuki-solver',
    name: 'たぬき暗号ソルバー',
    path: '/tanuki-solver',
    genre: 'convert',
    icon: Eraser,
  },
  {
    id: 'line-wrapper',
    name: '改行グリッド',
    path: '/line-wrapper',
    genre: 'view',
    icon: TextWrap,
  },
  {
    id: 'palindrome-checker',
    name: '回文チェッカー',
    path: '/palindrome-checker',
    genre: 'view',
    icon: FlipHorizontal2,
  },
  {
    id: 'kana-visualizer',
    name: '50音表ビジュアライザー',
    path: '/kana-visualizer',
    genre: 'view',
    icon: Grid,
  },
  {
    id: 'cube-visualizer',
    name: '立方体ビジュアライザー',
    path: '/cube-visualizer',
    genre: 'view',
    icon: Box,
  },
  {
    id: 'shiritori-solver',
    name: 'しりとりソルバー',
    path: '/shiritori-solver',
    genre: 'solve',
    icon: Link,
  },
  {
    id: 'palindrome-arranger',
    name: '回文並べ替え',
    path: '/palindrome-arranger',
    genre: 'solve',
    icon: Shuffle,
  },
  {
    id: 'skeleton-solver',
    name: 'スケルトンソルバー',
    path: '/skeleton-solver',
    genre: 'solve',
    icon: Cross,
  },
  {
    id: 'word-lattice-solver',
    name: '単語格子ソルバー',
    path: '/word-lattice-solver',
    genre: 'solve',
    icon: VectorSquare,
  },
  {
    id: 'amida-solver',
    name: 'あみだくじソルバー',
    path: '/amida-solver',
    genre: 'solve',
    icon: Waypoints,
  },
  {
    id: 'tiling-solver',
    name: 'タイリングソルバー',
    path: '/tiling-solver',
    genre: 'solve',
    icon: LayoutGrid,
  },
  {
    id: 'maze-helper',
    name: '迷路ヘルパー',
    path: '/maze-helper',
    genre: 'solve',
    icon: Route,
  },
  {
    id: 'sequence-skipper',
    name: 'シーケンスとばし',
    path: '/sequence-skipper',
    genre: 'sequence',
    icon: SkipForward,
  },
  {
    id: 'prefecture-regex',
    name: '都道府県正規表現マッチャー',
    path: '/prefecture-regex',
    genre: 'sequence',
    icon: MapPin,
  },
];
