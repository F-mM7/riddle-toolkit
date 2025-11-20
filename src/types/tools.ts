// 共通型定義

export interface ToolInfo {
  id: string;
  name: string;
  description: string;
  path: string;
}

export const TOOLS: ToolInfo[] = [
  {
    id: 'char-counter',
    name: '文字カウンター',
    description: '文字列の統計情報をリアルタイムで分析・表示',
    path: '/char-counter',
  },
  {
    id: 'difference-of-character-set',
    name: '文字集合の差',
    description: '2つのテキスト入力を比較し、文字セットの差を計算',
    path: '/difference-of-character-set',
  },
  {
    id: 'shiritori-solver',
    name: 'しりとりソルバー',
    description: '入力された単語リストから、しりとりの全解を見つける',
    path: '/shiritori-solver',
  },
  {
    id: 'word-venn',
    name: '言葉のベン図',
    description: '3つの単語に含まれる文字の重複関係をベン図として視覚化',
    path: '/word-venn',
  },
  {
    id: 'babanuki',
    name: 'ババ抜き解析',
    description: '入力文字列からペアになった文字と未ペア文字を検出',
    path: '/babanuki',
  },
  {
    id: 'word-lattice-solver',
    name: '単語格子ソルバー',
    description: '格子点に文字を配置して全てのセルの単語を構成',
    path: '/word-lattice-solver',
  },
];
