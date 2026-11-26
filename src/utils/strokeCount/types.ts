/** 入力の1文字と、その画数 */
export interface StrokeCountChar {
  char: string;
  /** 画数データ（漢字: KANJIDIC2、カタカナ: 独自に定めたもの）に無い文字は null */
  strokeCount: number | null;
}

export interface StrokeCountResult {
  /**
   * 入力の各行の文字(空白は除く)。入力の改行の位置で行を分け、空の行も残す。
   * 先頭・末尾の空の行は除く(文字が1つも無ければ空の配列)
   */
  lines: StrokeCountChar[][];
  /** 画数データに無い文字の数 */
  missingCount: number;
}
