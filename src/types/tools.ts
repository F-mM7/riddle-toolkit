// 共通型定義
import type { LucideIcon } from 'lucide-react';
import {
  FileDigit,
  CircleMinus,
  Link,
  Boxes,
  Spade,
  VectorSquare,
  Cross,
  Grid,
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
    description: '文字列の統計情報をリアルタイムで分析・表示',
    path: '/char-counter',
    icon: FileDigit,
  },
  {
    id: 'difference-of-character-set',
    name: '差集合',
    description: '2つのテキスト入力を比較し、文字セットの差を計算',
    path: '/difference-of-character-set',
    icon: CircleMinus,
  },
  {
    id: 'shiritori-solver',
    name: 'しりとりソルバー',
    description: '入力された単語リストから、しりとりの全解を見つける',
    path: '/shiritori-solver',
    icon: Link,
  },
  {
    id: 'word-venn',
    name: '単語ベン図',
    description: '3つの単語に含まれる文字の重複関係をベン図として視覚化',
    path: '/word-venn',
    icon: Boxes,
  },
  {
    id: 'babanuki',
    name: '文字ババ抜き',
    description: '入力文字列からペアになった文字と未ペア文字を検出',
    path: '/babanuki',
    icon: Spade,
  },
  {
    id: 'word-lattice-solver',
    name: '単語格子ソルバー',
    description: '格子点に文字を配置して全てのセルの単語を構成',
    path: '/word-lattice-solver',
    icon: VectorSquare,
  },
  {
    id: 'skeleton-solver',
    name: 'スケルトンソルバー',
    description: 'クロスワードパズルの一種であるスケルトンパズルを自動解決',
    path: '/skeleton-solver',
    icon: Cross,
  },
  {
    id: 'kana-visualizer',
    name: '50音表ビジュアライザー',
    description: 'ひらがな（清音）を入力すると50音表の対応箇所を色で視覚化',
    path: '/kana-visualizer',
    icon: Grid,
  },
];
