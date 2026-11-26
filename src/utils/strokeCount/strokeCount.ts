import { STROKE_COUNT_GROUPS } from '../../data/kanjiStrokeCounts';
import { KATAKANA_STROKE_COUNT_GROUPS } from '../../data/katakanaStrokeCounts';
import { StrokeCountChar, StrokeCountResult } from './types';

/**
 * 字 → 画数 の検索用の表(データの読み込み時に1度だけ組み立てる。データの各字は1コードポイント)。
 * 漢字(KANJIDIC2)とカタカナ(独自に定めたもの)のデータに重なる字は無い
 */
const STROKE_COUNT_MAP: ReadonlyMap<string, number> = new Map(
  [...STROKE_COUNT_GROUPS, ...KATAKANA_STROKE_COUNT_GROUPS].flatMap(([count, chars]) =>
    Array.from(chars, (char) => [char, count] as const)
  )
);

/** 改行(LF・CRLF・CR。CRLF は2コードポイントで1書記素) */
const LINE_BREAK = /^(?:\r\n|\r|\n)$/u;

/** 空白など、画数を調べる対象から外す文字(改行は LINE_BREAK で先に行の区切りとして扱う) */
const WHITESPACE = /^\s+$/u;

/** 異体字セレクタ(VS1〜VS16: U+FE00–U+FE0F、VS17〜VS256: U+E0100–U+E01EF) */
const VARIATION_SELECTORS = /[\uFE00-\uFE0F\u{E0100}-\u{E01EF}]/gu;

// Intl.Segmenter の最小限の型（tsconfig の lib が ES2020 のため自前で宣言する）
interface GraphemeSegmenter {
  segment(input: string): Iterable<{ segment: string }>;
}
type GraphemeSegmenterCtor = new (
  locales?: string,
  options?: { granularity: 'grapheme' }
) => GraphemeSegmenter;

const SegmenterCtor = (Intl as unknown as { Segmenter?: GraphemeSegmenterCtor }).Segmenter;
const graphemeSegmenter = SegmenterCtor
  ? new SegmenterCtor(undefined, { granularity: 'grapheme' })
  : null;

/**
 * 文字列を書記素（見た目の1文字）単位に分割する。
 * 入力した字のまま表示し、CJK 互換漢字（NFC で別の字に置き換わり、KANJIDIC2 の画数も異なるものがある）を
 * そのまま引けるよう、分割の前に NFC 正規化はしない（濁点・半濁点を結合文字で書いたカタカナは、
 * 書記素単位で分割したうえで getStrokeCount の NFC 正規化で引く）
 */
function splitGraphemes(text: string): string[] {
  if (graphemeSegmenter) {
    return Array.from(graphemeSegmenter.segment(text), (s) => s.segment);
  }
  // Intl.Segmenter 非対応環境のみ: コードポイント単位で分割する(CRLF の改行は1つにまとめる)
  return text.match(/\r\n|./gsu) ?? [];
}

/**
 * 見た目の1文字（書記素）の画数を返す(画数データ（漢字: KANJIDIC2、カタカナ: 独自に定めたもの）に無い文字は null)。
 * そのままで引けない場合は、異体字セレクタを外した基底の字、NFC 正規化した字の順に引く
 */
export function getStrokeCount(char: string): number | null {
  return (
    STROKE_COUNT_MAP.get(char) ??
    STROKE_COUNT_MAP.get(char.replace(VARIATION_SELECTORS, '')) ??
    STROKE_COUNT_MAP.get(char.normalize('NFC')) ??
    null
  );
}

/**
 * 文字列の各文字の画数を改行の位置で行に分けて求め、画数データに無い文字の数とあわせて返す。
 * 行の中の空白は除く。空の行は残すが、先頭・末尾の空の行は除く
 */
export function countStrokes(text: string): StrokeCountResult {
  const lines: StrokeCountChar[][] = [[]];
  for (const char of splitGraphemes(text)) {
    if (LINE_BREAK.test(char)) {
      lines.push([]);
    } else if (!WHITESPACE.test(char)) {
      lines[lines.length - 1].push({ char, strokeCount: getStrokeCount(char) });
    }
  }

  const first = lines.findIndex((line) => line.length > 0);
  const trimmed =
    first === -1
      ? []
      : lines.slice(
          first,
          lines.length - [...lines].reverse().findIndex((line) => line.length > 0)
        );

  const missingCount = trimmed.flat().filter(({ strokeCount }) => strokeCount === null).length;

  return { lines: trimmed, missingCount };
}
