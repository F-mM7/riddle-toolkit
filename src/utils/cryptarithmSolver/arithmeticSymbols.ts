/** 算術記号として扱われる記号の1行分（画面の表の1行にもなる） */
export interface ArithmeticSymbolRow {
  /** 意味（表の「意味」列） */
  meaning: string;
  /** 半角の記号。fullWidth と同じ順に対応する */
  halfWidth: readonly string[];
  /** 半角と同じものとして扱う全角の記号 */
  fullWidth: readonly string[];
}

const DIGIT_CHARS = Array.from({ length: 10 }, (_, d) => String(d));

/** 演算子と括弧の行 */
const OPERATOR_ROWS: readonly ArithmeticSymbolRow[] = [
  { meaning: '足し算', halfWidth: ['+'], fullWidth: ['＋'] },
  { meaning: '引き算', halfWidth: ['-'], fullWidth: ['－'] },
  { meaning: '掛け算', halfWidth: ['*'], fullWidth: ['＊'] },
  // 中黒「・」は割り算として扱う（全角スラッシュ「／」は対象にしない）
  { meaning: '割り算', halfWidth: ['/'], fullWidth: ['・'] },
  { meaning: '等号', halfWidth: ['='], fullWidth: ['＝'] },
  { meaning: '括弧', halfWidth: ['(', ')'], fullWidth: ['（', '）'] },
];

/** 数字の行（数値リテラル） */
const DIGIT_ROW: ArithmeticSymbolRow = {
  meaning: '数字',
  halfWidth: DIGIT_CHARS,
  fullWidth: DIGIT_CHARS.map((d) => String.fromCharCode(0xff10 + Number(d))),
};

/**
 * 覆面算で文字（変数）として扱わない記号の対応表。表示順もこの順。
 * 覆面算の入力の解析、抜き出しの指定、画面の表のすべてがこれを使う。
 * ここにない文字（「／」「ー」「−」「×」「÷」など）は文字として扱う
 */
export const ARITHMETIC_SYMBOLS: readonly ArithmeticSymbolRow[] = [...OPERATOR_ROWS, DIGIT_ROW];

/** 半角の演算子と括弧 */
export const OPERATOR_SYMBOLS: ReadonlySet<string> = new Set(
  OPERATOR_ROWS.flatMap((row) => row.halfWidth)
);

/** 半角の数字 */
export const DIGIT_SYMBOLS: ReadonlySet<string> = new Set(DIGIT_ROW.halfWidth);

const FULL_WIDTH_TO_HALF_WIDTH: ReadonlyMap<string, string> = new Map(
  ARITHMETIC_SYMBOLS.flatMap((row) => row.fullWidth.map((ch, i) => [ch, row.halfWidth[i]] as const))
);

/**
 * 1文字（書記素またはコードポイント）が対応表の全角文字そのものなら半角に置き換え、それ以外はそのまま返す。
 * 結合文字などが付いた書記素は対応表の文字と一致しないので置き換えない
 */
export const toHalfWidth = (ch: string): string => FULL_WIDTH_TO_HALF_WIDTH.get(ch) ?? ch;

/** 表に出す記号の並び。3つ以上（数字）は「最初〜最後」、それ以外は空白区切り */
export const symbolsLabel = (chars: readonly string[]): string =>
  chars.length > 2 ? `${chars[0]}〜${chars[chars.length - 1]}` : chars.join(' ');
