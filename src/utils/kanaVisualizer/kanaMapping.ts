import { KanaMapping } from '../../types/kanaVisualizer/kana';

// 50音表（清音のみ）のマッピング定義
// 仕様書通り、右から左へ：ん、わ行、ら行、や行、ま行、は行、な行、た行、さ行、か行、あ行
export const KANA_MAPPING: KanaMapping = {
  // あ行（右端から0列目）
  あ: { row: 0, col: 10 },
  い: { row: 1, col: 10 },
  う: { row: 2, col: 10 },
  え: { row: 3, col: 10 },
  お: { row: 4, col: 10 },

  // か行（1列目）
  か: { row: 0, col: 9 },
  き: { row: 1, col: 9 },
  く: { row: 2, col: 9 },
  け: { row: 3, col: 9 },
  こ: { row: 4, col: 9 },

  // さ行（2列目）
  さ: { row: 0, col: 8 },
  し: { row: 1, col: 8 },
  す: { row: 2, col: 8 },
  せ: { row: 3, col: 8 },
  そ: { row: 4, col: 8 },

  // た行（3列目）
  た: { row: 0, col: 7 },
  ち: { row: 1, col: 7 },
  つ: { row: 2, col: 7 },
  て: { row: 3, col: 7 },
  と: { row: 4, col: 7 },

  // な行（4列目）
  な: { row: 0, col: 6 },
  に: { row: 1, col: 6 },
  ぬ: { row: 2, col: 6 },
  ね: { row: 3, col: 6 },
  の: { row: 4, col: 6 },

  // は行（5列目）
  は: { row: 0, col: 5 },
  ひ: { row: 1, col: 5 },
  ふ: { row: 2, col: 5 },
  へ: { row: 3, col: 5 },
  ほ: { row: 4, col: 5 },

  // ま行（6列目）
  ま: { row: 0, col: 4 },
  み: { row: 1, col: 4 },
  む: { row: 2, col: 4 },
  め: { row: 3, col: 4 },
  も: { row: 4, col: 4 },

  // や行（7列目）
  や: { row: 0, col: 3 },
  ゆ: { row: 2, col: 3 },
  よ: { row: 4, col: 3 },

  // ら行（8列目）
  ら: { row: 0, col: 2 },
  り: { row: 1, col: 2 },
  る: { row: 2, col: 2 },
  れ: { row: 3, col: 2 },
  ろ: { row: 4, col: 2 },

  // わ行（9列目）
  わ: { row: 0, col: 1 },
  を: { row: 4, col: 1 },

  // ん（10列目）
  ん: { row: 0, col: 0 },
};

// グリッドの行数と列数
export const GRID_ROWS = 5;
export const GRID_COLS = 11;

// 50音表で文字が存在する位置のセット
export const VALID_POSITIONS = new Set<string>();
Object.values(KANA_MAPPING).forEach(({ row, col }) => {
  VALID_POSITIONS.add(`${row}-${col}`);
});
