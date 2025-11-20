import { KanaMapping } from '../../types/kanaVisualizer/kana';

/**
 * 50音表（清音のみ）のマッピング定義
 *
 * 【重要】一般的な50音表の配置について：
 * - 50音表は伝統的に「右から左へ」読む
 * - 画面上の左端に「ん」、右端に「あ行」が配置される
 * - 縦方向（行）: 上から下へ「あ段、い段、う段、え段、お段」
 *
 * 【列番号の割り当て（col）】
 *   col=0: ん（画面上の左端）
 *   col=1: わ行（左から2列目）
 *   col=2: ら行（左から3列目）
 *   col=3: や行（左から4列目）
 *   col=4: ま行（左から5列目）
 *   col=5: は行（左から6列目）
 *   col=6: な行（左から7列目）
 *   col=7: た行（左から8列目）
 *   col=8: さ行（左から9列目）
 *   col=9: か行（左から10列目）
 *   col=10: あ行（画面上の右端）
 *
 * 【行番号の割り当て（row）】
 *   row=0: あ段（最上段）
 *   row=1: い段
 *   row=2: う段
 *   row=3: え段
 *   row=4: お段（最下段）
 *
 * 【画面上での配置（右から左へ読む）】
 *   左 ← ← ← ← ← ← ← ← ← ← ← 右
 *   ん わ ら や ま は な た さ か あ
 *      を ろ よ も ほ の と そ こ お
 *         る ゆ む ふ ぬ つ す く う
 *         れ    め へ ね て せ け え
 *         り    み ひ に ち し き い
 */
export const KANA_MAPPING: KanaMapping = {
  // あ行（col=10, 画面上の右端）
  あ: { row: 0, col: 10 },
  い: { row: 1, col: 10 },
  う: { row: 2, col: 10 },
  え: { row: 3, col: 10 },
  お: { row: 4, col: 10 },

  // か行（col=9, 右から2列目）
  か: { row: 0, col: 9 },
  き: { row: 1, col: 9 },
  く: { row: 2, col: 9 },
  け: { row: 3, col: 9 },
  こ: { row: 4, col: 9 },

  // さ行（col=8, 右から3列目）
  さ: { row: 0, col: 8 },
  し: { row: 1, col: 8 },
  す: { row: 2, col: 8 },
  せ: { row: 3, col: 8 },
  そ: { row: 4, col: 8 },

  // た行（col=7, 右から4列目）
  た: { row: 0, col: 7 },
  ち: { row: 1, col: 7 },
  つ: { row: 2, col: 7 },
  て: { row: 3, col: 7 },
  と: { row: 4, col: 7 },

  // な行（col=6, 右から5列目）
  な: { row: 0, col: 6 },
  に: { row: 1, col: 6 },
  ぬ: { row: 2, col: 6 },
  ね: { row: 3, col: 6 },
  の: { row: 4, col: 6 },

  // は行（col=5, 右から6列目）
  は: { row: 0, col: 5 },
  ひ: { row: 1, col: 5 },
  ふ: { row: 2, col: 5 },
  へ: { row: 3, col: 5 },
  ほ: { row: 4, col: 5 },

  // ま行（col=4, 右から7列目）
  ま: { row: 0, col: 4 },
  み: { row: 1, col: 4 },
  む: { row: 2, col: 4 },
  め: { row: 3, col: 4 },
  も: { row: 4, col: 4 },

  // や行（col=3, 右から8列目）※い段・え段は空欄
  や: { row: 0, col: 3 },
  ゆ: { row: 2, col: 3 },
  よ: { row: 4, col: 3 },

  // ら行（col=2, 右から9列目）
  ら: { row: 0, col: 2 },
  り: { row: 1, col: 2 },
  る: { row: 2, col: 2 },
  れ: { row: 3, col: 2 },
  ろ: { row: 4, col: 2 },

  // わ行（col=1, 右から10列目）※あ段とお段のみ
  わ: { row: 0, col: 1 },
  を: { row: 4, col: 1 },

  // ん（col=0, 画面上の左端）※あ段のみ
  ん: { row: 0, col: 0 },
};

// グリッドの行数と列数
export const GRID_ROWS = 5; // あ段〜お段
export const GRID_COLS = 11; // あ行〜ん

// 50音表で文字が存在する位置のセット（や行のい・え段、わ行のい・う・え段は空欄）
export const VALID_POSITIONS = new Set<string>();
Object.values(KANA_MAPPING).forEach(({ row, col }) => {
  VALID_POSITIONS.add(`${row}-${col}`);
});

// 位置から文字を逆引きするためのマップ
export const POSITION_TO_KANA: Record<string, string> = {};
Object.entries(KANA_MAPPING).forEach(([char, { row, col }]) => {
  POSITION_TO_KANA[`${row}-${col}`] = char;
});
