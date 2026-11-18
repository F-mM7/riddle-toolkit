// たぬき暗号: 対象文字列から削除文字列を順に取り除く（1行に2語あれば置換する）

/**
 * 削除方法
 * - chunk（かたまり）: 削除文字列が連続して現れる箇所を削除する
 * - scatter（バラバラ）: 削除文字列に含まれる各文字をすべて削除する
 */
export type DeleteMode = 'chunk' | 'scatter';

/**
 * バラバラモードでの置換方法
 * - perChar（1文字ずつ対応）: 置換元の i 文字目を置換先の i 文字目に置換する
 * - whole（まるごと）: 置換元に含まれる各文字を置換先全体に置換する
 */
export type ScatterReplaceMode = 'perChar' | 'whole';

/** 削除文字列欄の1行を解釈した規則 */
export type TanukiRule =
  | {
      kind: 'delete';
      /** 削除する文字列 */
      pattern: string;
    }
  | {
      kind: 'replace';
      /** 置換元 */
      from: string;
      /** 置換先 */
      to: string;
      /** 3語目以降の無視した語 */
      ignored: string[];
    };

/** 削除の規則1つを適用した段階 */
export interface DeleteStep {
  kind: 'delete';
  /** 適用した削除文字列 */
  pattern: string;
  /** 適用後の文字列 */
  after: string;
  /** 削除した文字数 */
  removedCount: number;
}

/** 置換の規則1つを適用した段階 */
export interface ReplaceStep {
  kind: 'replace';
  /** 置換元 */
  from: string;
  /** 置換先 */
  to: string;
  /** 3語目以降の無視した語 */
  ignored: string[];
  /** 適用後の文字列（エラー時は適用前のまま） */
  after: string;
  /** 置換した箇所の数（かたまりは出現数、バラバラは文字数） */
  replacedCount: number;
  /** 適用できなかった理由（適用できた場合は null） */
  error: string | null;
}

/** 規則1つを適用した段階 */
export type TanukiStep = DeleteStep | ReplaceStep;

/** ソルバーの結果 */
export interface TanukiResult {
  /** 正規化後の対象文字列（改行を除いたもの） */
  initial: string;
  /** 規則ごとの過程（入力順） */
  steps: TanukiStep[];
  /** 最終結果 */
  final: string;
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

/** 文字列を NFC 正規化したうえで書記素（見た目の1文字）単位に分割する */
export function splitChars(text: string): string[] {
  const normalized = text.normalize('NFC');
  if (graphemeSegmenter) {
    return Array.from(graphemeSegmenter.segment(normalized), (s) => s.segment);
  }
  // Intl.Segmenter 非対応環境のみ: コードポイント単位で分割する
  return Array.from(normalized);
}

/** 対象文字列の改行を取り除く（複数行の入力は1続きの文字列として扱う） */
export function normalizeTarget(text: string): string {
  return text.normalize('NFC').replace(/\r\n|\r|\n/g, '');
}

/** 1行の中の語の区切り（半角/全角カンマ、半角/全角スペース、タブ） */
const WORD_SEPARATOR = /[,，\s\u3000]+/;

/**
 * 削除文字列の入力を行ごとに規則へ変換する（空行は無視する）
 * 区切りで分けて1語なら削除、2語以上なら先頭2語で置換（3語目以降は無視）とする
 */
export function parsePatterns(input: string): TanukiRule[] {
  const rules: TanukiRule[] = [];
  for (const line of input.split(/\r\n|\r|\n/)) {
    const words = line
      .normalize('NFC')
      .split(WORD_SEPARATOR)
      .filter((word) => word !== '');
    if (words.length === 0) continue;
    if (words.length === 1) {
      rules.push({ kind: 'delete', pattern: words[0] });
    } else {
      rules.push({ kind: 'replace', from: words[0], to: words[1], ignored: words.slice(2) });
    }
  }
  return rules;
}

/** chars の i 文字目から pattern が連続して現れるか */
function matchesAt(chars: readonly string[], pattern: readonly string[], i: number): boolean {
  if (i + pattern.length > chars.length) return false;
  for (let j = 0; j < pattern.length; j++) {
    if (chars[i + j] !== pattern[j]) return false;
  }
  return true;
}

/** かたまり: pattern の出現箇所を左から重ならないようにすべて削除する */
export function deleteChunk(chars: readonly string[], pattern: readonly string[]): string[] {
  if (pattern.length === 0) return [...chars];
  const result: string[] = [];
  let i = 0;
  while (i < chars.length) {
    if (matchesAt(chars, pattern, i)) {
      i += pattern.length;
    } else {
      result.push(chars[i]);
      i++;
    }
  }
  return result;
}

/** バラバラ: pattern に含まれる各文字を chars からすべて削除する */
export function deleteScatter(chars: readonly string[], pattern: readonly string[]): string[] {
  const targets = new Set(pattern);
  return chars.filter((c) => !targets.has(c));
}

/** 置換1回分の結果 */
export type ReplaceOutcome =
  | { ok: true; chars: string[]; count: number }
  | { ok: false; error: string };

/** かたまり: from の出現箇所を左から重ならないようにすべて to に置換する */
export function replaceChunk(
  chars: readonly string[],
  from: readonly string[],
  to: readonly string[]
): ReplaceOutcome {
  if (from.length === 0) return { ok: true, chars: [...chars], count: 0 };
  const result: string[] = [];
  let count = 0;
  let i = 0;
  while (i < chars.length) {
    if (matchesAt(chars, from, i)) {
      result.push(...to);
      count++;
      i += from.length;
    } else {
      result.push(chars[i]);
      i++;
    }
  }
  return { ok: true, chars: result, count };
}

/** 各文字の置換先の対応表で chars を同時に置換する（置換後の文字は再置換しない） */
function replaceByMap(
  chars: readonly string[],
  map: ReadonlyMap<string, readonly string[]>
): ReplaceOutcome {
  const result: string[] = [];
  let count = 0;
  for (const c of chars) {
    const replacement = map.get(c);
    if (replacement) {
      result.push(...replacement);
      count++;
    } else {
      result.push(c);
    }
  }
  return { ok: true, chars: result, count };
}

/** バラバラ（1文字ずつ対応）: from の i 文字目を to の i 文字目に置換する */
export function replaceScatterPerChar(
  chars: readonly string[],
  from: readonly string[],
  to: readonly string[]
): ReplaceOutcome {
  if (from.length !== to.length) {
    return {
      ok: false,
      error: `文字数が違います（置換元${from.length}文字、置換先${to.length}文字）`,
    };
  }
  const map = new Map<string, string[]>();
  for (let i = 0; i < from.length; i++) {
    const existing = map.get(from[i]);
    if (existing && existing[0] !== to[i]) {
      return {
        ok: false,
        error: `「${from[i]}」の置換先が「${existing[0]}」と「${to[i]}」で食い違っています`,
      };
    }
    map.set(from[i], [to[i]]);
  }
  return replaceByMap(chars, map);
}

/** バラバラ（まるごと）: from に含まれる各文字を to 全体に置換する */
export function replaceScatterWhole(
  chars: readonly string[],
  from: readonly string[],
  to: readonly string[]
): ReplaceOutcome {
  const map = new Map<string, readonly string[]>();
  for (const c of from) map.set(c, to);
  return replaceByMap(chars, map);
}

/** 対象文字列に規則を上から順に適用し、各段階の過程を返す */
export function solveTanuki(
  target: string,
  rules: readonly TanukiRule[],
  mode: DeleteMode,
  scatterReplaceMode: ScatterReplaceMode
): TanukiResult {
  const initial = normalizeTarget(target);
  const deleteFn = mode === 'chunk' ? deleteChunk : deleteScatter;
  const replaceFn =
    mode === 'chunk'
      ? replaceChunk
      : scatterReplaceMode === 'perChar'
        ? replaceScatterPerChar
        : replaceScatterWhole;

  let current = splitChars(initial);
  const steps: TanukiStep[] = [];
  for (const rule of rules) {
    if (rule.kind === 'delete') {
      const next = deleteFn(current, splitChars(rule.pattern));
      steps.push({
        kind: 'delete',
        pattern: rule.pattern,
        after: next.join(''),
        removedCount: current.length - next.length,
      });
      current = next;
      continue;
    }

    const outcome = replaceFn(current, splitChars(rule.from), splitChars(rule.to));
    const base = { kind: 'replace', from: rule.from, to: rule.to, ignored: rule.ignored } as const;
    if (outcome.ok) {
      steps.push({
        ...base,
        after: outcome.chars.join(''),
        replacedCount: outcome.count,
        error: null,
      });
      current = outcome.chars;
    } else {
      // 適用できない行は飛ばし、次の行は前の結果のまま続ける
      steps.push({ ...base, after: current.join(''), replacedCount: 0, error: outcome.error });
    }
  }

  return { initial, steps, final: current.join('') };
}
