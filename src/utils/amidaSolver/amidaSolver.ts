import type { AmidaDirection, Rung, RungCheckResult } from './types';

/** 同じ縦線を共有する横線同士で、これより近い高さには追加できない（正規化座標） */
export const MIN_RUNG_GAP = 0.03;

/**
 * 横線を追加できるか判定する。
 * - left が範囲外なら不可
 * - 同じ縦線を共有する横線（left-1, left, left+1）が MIN_RUNG_GAP 未満の高さにあれば不可
 *   （同じ高さで縦線を共有すると辿る向きが定まらず、あみだくじとして矛盾するため）
 */
export function checkRung(
  lineCount: number,
  rungs: readonly Rung[],
  left: number,
  y: number,
  minGap: number = MIN_RUNG_GAP
): RungCheckResult {
  if (!Number.isInteger(left) || left < 0 || left > lineCount - 2 || y < 0 || y > 1) {
    return { ok: false, reason: 'out-of-range' };
  }
  const conflict = rungs.some((r) => rungsConflict(r, { left, y }, minGap));
  return conflict ? { ok: false, reason: 'too-close' } : { ok: true };
}

/** 2本の横線が同じ縦線を共有し、かつ MIN_RUNG_GAP 未満の高さにある（両立できない）か */
function rungsConflict(
  a: Pick<Rung, 'left' | 'y'>,
  b: Pick<Rung, 'left' | 'y'>,
  minGap: number = MIN_RUNG_GAP
): boolean {
  return Math.abs(a.left - b.left) <= 1 && Math.abs(a.y - b.y) < minGap;
}

/**
 * 上端の各縦線から下へ辿ったとき、下端のどの縦線に着くかを返す。
 * 戻り値 perm[start] = end
 */
export function traceDown(lineCount: number, rungs: readonly Rung[]): number[] {
  // position[i] = 現在 i 番目の縦線上にいる、上端での出発位置
  const position = Array.from({ length: lineCount }, (_, i) => i);
  const sorted = rungs
    .filter((r) => r.left >= 0 && r.left <= lineCount - 2)
    .slice()
    .sort((a, b) => a.y - b.y);
  for (const r of sorted) {
    const tmp = position[r.left];
    position[r.left] = position[r.left + 1];
    position[r.left + 1] = tmp;
  }
  const perm = new Array<number>(lineCount);
  position.forEach((start, end) => {
    perm[start] = end;
  });
  return perm;
}

/** 空き位置（入力中の空白、および入力されていない末尾の位置）を表す文字（半角スペース） */
export const PADDING_CHAR = ' ';

/**
 * 指定した側の文字列を、あみだくじに沿って反対側へ辿った並びを返す。
 * - direction='top': items[i] を上端 i 番目に置き、下端に到達した並びを返す
 * - direction='bottom': items[i] を下端 i 番目に置き、上端へ逆に辿った並びを返す
 * 縦線より文字が少ない位置（入力されていない位置）は半角スペース（PADDING_CHAR）として扱う。
 */
export function arrange(
  items: readonly string[],
  direction: AmidaDirection,
  lineCount: number,
  rungs: readonly Rung[]
): string[] {
  const perm = traceDown(lineCount, rungs);
  const result = new Array<string>(lineCount).fill(PADDING_CHAR);
  for (let start = 0; start < lineCount; start++) {
    const end = perm[start];
    if (direction === 'top') {
      result[end] = items[start] ?? PADDING_CHAR;
    } else {
      result[start] = items[end] ?? PADDING_CHAR;
    }
  }
  return result;
}

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

/** 文字列を書記素（見た目の1文字）単位に分割する */
function splitGraphemes(text: string): string[] {
  if (graphemeSegmenter) {
    return Array.from(graphemeSegmenter.segment(text), (s) => s.segment);
  }
  // Intl.Segmenter 非対応環境のみ: NFC 正規化済みの文字列をコードポイント単位で分割する
  // （分解形の濁点などは NFC で結合されるが、絵文字の結合列は分割される）
  return Array.from(text);
}

/**
 * 入力文字列を1文字ずつに分割する。
 * NFC 正規化したうえで書記素単位に分割するため、分解形の濁点・ZWJ 絵文字・
 * 異体字セレクタ付きの文字・国旗なども1文字として扱う。
 * 空白（半角・全角スペース、タブ等）は1文字につき空き位置1つとして PADDING_CHAR に置き換え、
 * 先頭・途中・末尾のいずれでも位置を占める（例: "あ い" → ["あ", " ", "い"]）。
 */
export function splitChars(text: string): string[] {
  return splitGraphemes(text.normalize('NFC')).map((c) => (/^\s+$/.test(c) ? PADDING_CHAR : c));
}

/**
 * items の start 番目から順に chars で置き換えた新しい配列を返す。
 * limit 番目以降に及ぶ分は捨てる。items が start に届かない場合は PADDING_CHAR で埋める。
 */
export function replaceChars(
  items: readonly string[],
  start: number,
  chars: readonly string[],
  limit: number
): string[] {
  const next = Array.from(
    { length: Math.max(items.length, start) },
    (_, i) => items[i] ?? PADDING_CHAR
  );
  chars.slice(0, Math.max(0, limit - start)).forEach((c, k) => {
    next[start + k] = c;
  });
  return next;
}

/** 文字の並びを入力欄用の文字列に戻す（末尾の空き位置は省略する） */
export function joinChars(items: readonly string[]): string {
  let end = items.length;
  while (end > 0 && items[end - 1] === PADDING_CHAR) end--;
  return items.slice(0, end).join('');
}
