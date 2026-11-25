/** 集合1つ分の色。fill は図の塗り(領域ごとに乗算で混ぜる)で、入力欄の色分けにも使う */
export interface SetColor {
  fill: string;
}

/**
 * 単語の順(ビット順)に対応する色。
 * 重なった領域は所属する集合の fill を乗算で混ぜた色で塗るため、
 * 混ぜても暗くなりすぎないよう明るめの色にしている。
 */
export const SET_COLORS: readonly SetColor[] = [
  { fill: '#FF6B6B' }, // 赤(単語1)
  { fill: '#7CF06B' }, // 緑(単語2)
  { fill: '#6B86F5' }, // 青(単語3)
  { fill: '#FFE45C' }, // 黄(単語4)
  { fill: '#E08CF5' }, // 紫(単語5)
];

type Rgb = [number, number, number];

/**
 * 重なりの濃さを和らげる係数。k 個の集合が重なる領域は、乗算した色(0〜1)を
 * 1 / (1 + SOFTEN * (k - 1)) 乗して明るくする(純粋な乗算だと3つ以上の重なりが黒に近づき見分けにくい)。
 */
const SOFTEN = 0.4;

function parseHex(hex: string): Rgb {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!match) {
    throw new Error(`色の形式が不正です: "${hex}"`);
  }
  const value = parseInt(match[1], 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

function toHex(rgb: Rgb): string {
  return `#${rgb
    .map((v) =>
      Math.round(Math.min(255, Math.max(0, v)))
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`;
}

/**
 * 所属パターン mask(集合 i を含めばビット i)の領域を塗る色。
 * 所属する集合の色を乗算で混ぜ(絵の具を重ねたように、重なるほど濃くなる)、SOFTEN で濃さを和らげる。
 */
export function regionColor(colors: readonly SetColor[], mask: number): string {
  if (mask <= 0) {
    throw new Error(`領域の所属パターンが不正です: ${mask}`);
  }
  let product: Rgb = [1, 1, 1];
  let count = 0;
  for (let i = 0; 1 << i <= mask; i++) {
    if ((mask & (1 << i)) === 0) continue;
    const color = colors[i];
    if (!color) {
      throw new Error(`集合 ${i} の色が定義されていません`);
    }
    const c = parseHex(color.fill);
    product = [(product[0] * c[0]) / 255, (product[1] * c[1]) / 255, (product[2] * c[2]) / 255];
    count++;
  }
  const exponent = 1 / (1 + SOFTEN * (count - 1));
  return toHex([
    255 * product[0] ** exponent,
    255 * product[1] ** exponent,
    255 * product[2] ** exponent,
  ]);
}
