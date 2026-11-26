// 共通型定義
import type { LucideIcon } from 'lucide-react';
import {
  FileDigit,
  CircleMinus,
  Link,
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
  ListOrdered,
  CalendarDays,
  Calculator,
  Brush,
} from 'lucide-react';

/** ツールのジャンル(トップページの区切り) */
export type ToolGenre = 'view' | 'convert' | 'solve' | 'sequence';

/** ジャンルの表示順と見出し名 */
export const TOOL_GENRES: readonly { id: ToolGenre; name: string }[] = [
  { id: 'view', name: 'Visualizer' },
  { id: 'convert', name: '変換する' },
  { id: 'solve', name: 'ソルバー' },
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
    id: 'kana-visualizer',
    name: '50音表',
    path: '/kana-visualizer',
    genre: 'view',
    icon: Grid,
  },
  {
    id: 'char-counter',
    name: '文字カウンター',
    path: '/char-counter',
    genre: 'view',
    icon: FileDigit,
  },
  {
    id: 'difference-of-character-set',
    name: '差集合',
    path: '/difference-of-character-set',
    genre: 'view',
    icon: CircleMinus,
  },
  {
    id: 'word-venn',
    name: '単語ベン図',
    path: '/word-venn',
    genre: 'view',
    icon: Blend,
  },
  {
    id: 'line-wrapper',
    name: '改行',
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
    id: 'cube-visualizer',
    name: '3D立方体',
    path: '/cube-visualizer',
    genre: 'view',
    icon: Box,
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
    id: 'stroke-count',
    name: '画数',
    path: '/stroke-count',
    genre: 'convert',
    icon: Brush,
  },
  {
    id: 'shiritori-solver',
    name: 'しりとり',
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
    name: 'スケルトン',
    path: '/skeleton-solver',
    genre: 'solve',
    icon: Cross,
  },
  {
    id: 'word-lattice-solver',
    name: '単語格子',
    path: '/word-lattice-solver',
    genre: 'solve',
    icon: VectorSquare,
  },
  {
    id: 'amida-solver',
    name: 'あみだくじ',
    path: '/amida-solver',
    genre: 'solve',
    icon: Waypoints,
  },
  {
    id: 'tiling-solver',
    name: 'タイリング',
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
    id: 'cryptarithm-solver',
    name: '覆面算',
    path: '/cryptarithm-solver',
    genre: 'solve',
    icon: Calculator,
  },
  {
    id: 'famous-sequences',
    name: '有名シーケンス一覧',
    path: '/famous-sequences',
    genre: 'sequence',
    icon: ListOrdered,
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
    name: '都道府県',
    path: '/prefecture-regex',
    genre: 'sequence',
    icon: MapPin,
  },
  {
    id: 'national-holidays',
    name: '国民の休日一覧',
    path: '/national-holidays',
    genre: 'sequence',
    icon: CalendarDays,
  },
];
