import { RowColor } from '../../types/kanaVisualizer/kana';

// 行の色定義（最大3行）- より明るく視認性を向上
export const ROW_COLORS: RowColor[] = [
  { r: 255, g: 120, b: 120 }, // 1行目: 明るい赤
  { r: 120, g: 255, b: 120 }, // 2行目: 明るい緑
  { r: 120, g: 180, b: 255 }, // 3行目: 明るい青
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

  // RGB値が255を超える場合は255に制限
  return {
    r: Math.min(mixed.r, 255),
    g: Math.min(mixed.g, 255),
    b: Math.min(mixed.b, 255),
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
