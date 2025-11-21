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
} from 'lucide-react';

export interface ToolInfo {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: LucideIcon;
}

export const TOOLS: ToolInfo[] = [
  {
    id: 'char-counter',
    name: '文字カウンター',
    description: '文字列に含まれる文字をカウント',
    path: '/char-counter',
    icon: FileDigit,
  },
  {
    id: 'difference-of-character-set',
    name: '差集合',
    description: '2つのテキストの差集合を出力',
    path: '/difference-of-character-set',
    icon: CircleMinus,
  },
  {
    id: 'shiritori-solver',
    name: 'しりとりソルバー',
    description: '単語でしりとり',
    path: '/shiritori-solver',
    icon: Link,
  },
  {
    id: 'word-venn',
    name: '単語ベン図',
    description: '単語をベン図で視覚化',
    path: '/word-venn',
    icon: Blend,
  },
  {
    id: 'babanuki',
    name: '文字ババ抜き',
    description: '文字列でババ抜き',
    path: '/babanuki',
    icon: Spade,
  },
  {
    id: 'word-lattice-solver',
    name: '単語格子ソルバー',
    description: '"単語格子"',
    path: '/word-lattice-solver',
    icon: VectorSquare,
  },
  {
    id: 'skeleton-solver',
    name: 'スケルトンソルバー',
    description: 'スケルトンを解く',
    path: '/skeleton-solver',
    icon: Cross,
  },
  {
    id: 'kana-visualizer',
    name: '50音表ビジュアライザー',
    description: '文字列の50音表対応箇所を視覚化',
    path: '/kana-visualizer',
    icon: Grid,
  },
];
