import { RowColor } from '../../types/kanaVisualizer/kana';

// 行の色定義（最大3行）
// RGB値の範囲: 下限48、上限216
export const ROW_COLORS: RowColor[] = [
  { r: 216, g: 48, b: 48 }, // 1行目: 赤
  { r: 48, g: 216, b: 48 }, // 2行目: 緑
  { r: 48, g: 48, b: 216 }, // 3行目: 青
];

/**
 * 行番号から色を取得
 */
export function getRowColor(rowIndex: number): RowColor {
  if (rowIndex < 0 || rowIndex >= ROW_COLORS.length) {
    return { r: 0, g: 0, b: 0 }; // デフォルトは黒
  }
  return ROW_COLORS[rowIndex];
}

/**
 * 複数の色をRGB値で加算して混合
 */
export function mixColors(colors: RowColor[]): RowColor {
  if (colors.length === 0) {
    return { r: 0, g: 0, b: 0 };
  }

  const mixed = colors.reduce(
    (acc, color) => ({
      r: acc.r + color.r,
      g: acc.g + color.g,
      b: acc.b + color.b,
    }),
    { r: 0, g: 0, b: 0 }
  );

  // RGB値が216を超える場合は216に制限
  return {
    r: Math.min(mixed.r, 216),
    g: Math.min(mixed.g, 216),
    b: Math.min(mixed.b, 216),
  };
}

/**
 * RowColorをCSS用のrgb文字列に変換
 */
export function colorToRgb(color: RowColor): string {
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

/**
 * 行番号の配列から混合色を計算
 */
export function calculateMixedColor(rowIndices: number[]): RowColor {
  const colors = rowIndices.map((index) => getRowColor(index));
  return mixColors(colors);
}
