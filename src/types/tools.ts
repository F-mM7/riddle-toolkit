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
} from 'lucide-react';

/** ツールのジャンル(トップページの区切り) */
export type ToolGenre = 'count' | 'convert' | 'view' | 'solve';

/** ジャンルの表示順と見出し名 */
export const TOOL_GENRES: readonly { id: ToolGenre; name: string }[] = [
  { id: 'count', name: '数える・比べる' },
  { id: 'convert', name: '変換する' },
  { id: 'view', name: '並べて見る' },
  { id: 'solve', name: '解く・探す' },
];

export interface ToolInfo {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: LucideIcon;
  genre: ToolGenre;
}

// ジャンルごとに、ジャンル内の表示順で並べる
export const TOOLS: ToolInfo[] = [
  {
    id: 'char-counter',
    name: '文字カウンター',
    description: '文字列に含まれる文字をカウント',
    path: '/char-counter',
    genre: 'count',
    icon: FileDigit,
  },
  {
    id: 'difference-of-character-set',
    name: '差集合',
    description: '2つのテキストの差集合を出力',
    path: '/difference-of-character-set',
    genre: 'count',
    icon: CircleMinus,
  },
  {
    id: 'babanuki',
    name: '文字ババ抜き',
    description: '文字列でババ抜き',
    path: '/babanuki',
    genre: 'count',
    icon: Spade,
  },
  {
    id: 'word-venn',
    name: '単語ベン図',
    description: '単語をベン図で視覚化',
    path: '/word-venn',
    genre: 'count',
    icon: Blend,
  },
  {
    id: 'char-shifter',
    name: '文字ずらし',
    description: 'かな文字・アルファベットをシフト暗号で変換',
    path: '/char-shifter',
    genre: 'convert',
    icon: ArrowRightLeft,
  },
  {
    id: 'number-to-char',
    name: '数字→文字変換',
    description: '数字を50音順・いろは順・アルファベット順の文字に変換',
    path: '/number-to-char',
    genre: 'convert',
    icon: Hash,
  },
  {
    id: 'sequence-skipper',
    name: 'シーケンスとばし',
    description: '曜日や干支をいくつか飛ばしで表示',
    path: '/sequence-skipper',
    genre: 'convert',
    icon: SkipForward,
  },
  {
    id: 'palindrome-checker',
    name: '回文チェッカー',
    description: '文字列を行ごとに逆順表示',
    path: '/palindrome-checker',
    genre: 'view',
    icon: FlipHorizontal2,
  },
  {
    id: 'kana-visualizer',
    name: '50音表ビジュアライザー',
    description: '文字列の50音表対応箇所を視覚化',
    path: '/kana-visualizer',
    genre: 'view',
    icon: Grid,
  },
  {
    id: 'cube-visualizer',
    name: '立方体ビジュアライザー',
    description: '立方体の展開図を3Dで可視化',
    path: '/cube-visualizer',
    genre: 'view',
    icon: Box,
  },
  {
    id: 'shiritori-solver',
    name: 'しりとりソルバー',
    description: '単語でしりとり',
    path: '/shiritori-solver',
    genre: 'solve',
    icon: Link,
  },
  {
    id: 'palindrome-arranger',
    name: '回文並べ替え',
    description: '単語を並べ替えて回文を作る',
    path: '/palindrome-arranger',
    genre: 'solve',
    icon: Shuffle,
  },
  {
    id: 'skeleton-solver',
    name: 'スケルトンソルバー',
    description: 'スケルトンを解く',
    path: '/skeleton-solver',
    genre: 'solve',
    icon: Cross,
  },
  {
    id: 'word-lattice-solver',
    name: '単語格子ソルバー',
    description: '"単語格子"',
    path: '/word-lattice-solver',
    genre: 'solve',
    icon: VectorSquare,
  },
  {
    id: 'amida-solver',
    name: 'あみだくじソルバー',
    description: 'あみだくじに沿って文字を並び替え',
    path: '/amida-solver',
    genre: 'solve',
    icon: Waypoints,
  },
  {
    id: 'prefecture-regex',
    name: '都道府県正規表現マッチャー',
    description: '都道府県名・県庁所在地名を正規表現で検索',
    path: '/prefecture-regex',
    genre: 'solve',
    icon: MapPin,
  },
];
