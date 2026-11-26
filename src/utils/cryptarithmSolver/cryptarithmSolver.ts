import { splitChars } from '../tanukiSolver/tanukiSolver';
import { DIGIT_SYMBOLS, OPERATOR_SYMBOLS, toHalfWidth } from './arithmeticSymbols';
import type { Assignment, CryptarithmSolution, ParseError } from './types';

/** 表示する解の上限。これを超える解が見つかった時点で探索を打ち切る */
export const MAX_SOLUTIONS = 100;

/** 文字の種類の上限（数字は 0〜9 の10個） */
const MAX_LETTERS = 10;

const WHITESPACE = /^\s+$/u;

/**
 * 数を構成する1文字。0 以上は文字の番号、負の値は数値リテラル（-1 - 数字）
 * 例: 文字の番号 2 → 2、リテラル '7' → -8
 */
type Sym = number;

const literalSym = (digit: number): Sym => -1 - digit;
const isLetterSym = (sym: Sym): boolean => sym >= 0;
const literalDigit = (sym: Sym): number => -1 - sym;

/** 数（オペランド）。syms は上の桁から順に並ぶ */
interface Operand {
  kind: 'num';
  syms: Sym[];
}

/** 因数: 数、または括弧で囲まれた式 */
type Factor = Operand | { kind: 'group'; expr: Expr };

/** 項（因数の掛け算・割り算の並び）。最初の因数の op は '*' */
interface Term {
  sign: 1n | -1n;
  factors: { op: '*' | '/'; factor: Factor }[];
}

/** 式（項の足し算・引き算の並び） */
type Expr = Term[];

interface ParsedLine {
  /** 空白を除き、全角の記号・数字を半角に置き換えた行の文字（書記素単位） */
  chars: string[];
  /** '=' で区切られた辺（2つ以上） */
  sides: Expr[];
}

interface InternalParse {
  /** 不完全なため探索から外した行 */
  skipped: ParseError[];
  /** 行をまたぐ誤り */
  errors: ParseError[];
  letters: string[];
  lines: ParsedLine[];
}

/** 割り当ての判定。digits[文字の番号] = 数字 */
type CheckFn = (digits: Int8Array) => boolean;

interface Check {
  /** 判定に必要な文字の番号 */
  letters: number[];
  fn: CheckFn;
}

type Token = { kind: 'sym'; sym: string } | { kind: 'num'; chars: string[] };

/** 空白を除いた1行を、記号と数のトークンに分ける */
const tokenize = (chars: string[]): Token[] => {
  const tokens: Token[] = [];
  let buffer: string[] = [];
  for (const ch of chars) {
    if (OPERATOR_SYMBOLS.has(ch)) {
      if (buffer.length > 0) tokens.push({ kind: 'num', chars: buffer });
      buffer = [];
      tokens.push({ kind: 'sym', sym: ch });
    } else {
      buffer.push(ch);
    }
  }
  if (buffer.length > 0) tokens.push({ kind: 'num', chars: buffer });
  return tokens;
};

/** 数・「(」が来るべき位置に演算子が来たときのエラーメッセージ */
const misplacedOperatorMessage = (prev: string | null, op: string): string => {
  if (op === '-') return '負の数（単項マイナス）は使えません';
  if (prev === null) return op === '=' ? '左辺が空です' : `行頭に演算子「${op}」があります`;
  if (prev === '=')
    return op === '=' ? '空の辺があります' : `「=」の直後に演算子「${op}」があります`;
  if (prev === '(') return `「(」の直後に演算子「${op}」があります`;
  return `演算子「${prev}」「${op}」が連続しています`;
};

/**
 * 1行の文法を確認し、誤りのメッセージを返す（誤りがなければ空）
 * 行 = 式 ('=' 式)+、式 = 項 (('+'|'-') 項)*、項 = 因数 (('*'|'/') 因数)*、因数 = 数 | '(' 式 ')'
 */
const validateLine = (chars: string[], tokens: Token[]): Set<string> => {
  const messages = new Set<string>();
  if (!chars.includes('=')) messages.add('「=」がありません');

  let prev: string | null = null; // 直前のトークン（数は 'num'）
  let expectOperand = true;
  let depth = 0;
  for (const token of tokens) {
    if (token.kind === 'num') {
      if (!expectOperand) messages.add('括弧と数の間に演算子がありません');
      if (token.chars.length >= 2 && token.chars[0] === '0') {
        messages.add(`先頭が0の数「${token.chars.join('')}」は使えません`);
      }
      prev = 'num';
      expectOperand = false;
      continue;
    }
    const { sym } = token;
    if (sym === '(') {
      if (!expectOperand) messages.add('括弧と数・括弧の間に演算子がありません');
      depth++;
      expectOperand = true;
    } else if (sym === ')') {
      if (expectOperand) {
        messages.add(
          prev === null
            ? '行頭に「)」があります'
            : prev === '('
              ? '空の括弧があります'
              : `「)」の直前に演算子「${prev}」があります`
        );
      }
      if (depth === 0) messages.add('対応する「(」がない「)」があります');
      else depth--;
      expectOperand = false;
    } else {
      if (expectOperand) messages.add(misplacedOperatorMessage(prev, sym));
      if (sym === '=' && depth > 0) messages.add('括弧の中に「=」があります');
      expectOperand = true;
    }
    prev = sym;
  }
  if (expectOperand && prev !== null) {
    messages.add(prev === '=' ? '右辺が空です' : `行末に「${prev}」があります`);
  }
  if (depth > 0) messages.add('閉じていない「(」があります');
  return messages;
};

/**
 * 文法が正しいことを確認済みのトークンを、辺の並びに組み立てる。
 * 括弧は掛け算・足し算の並びに展開できる範囲で平らにする（A-(B-C) → A-B+C、(A*B)*C → A*B*C）
 */
const buildSides = (tokens: Token[], letterIndex: Map<string, number>): Expr[] => {
  let pos = 0;

  const parseFactor = (): Factor => {
    const token = tokens[pos++];
    if (token.kind === 'num') {
      return {
        kind: 'num',
        syms: token.chars.map((ch) =>
          DIGIT_SYMBOLS.has(ch) ? literalSym(Number(ch)) : (letterIndex.get(ch) as number)
        ),
      };
    }
    // '(' 式 ')'
    const expr = parseExpr();
    pos++; // ')'
    return { kind: 'group', expr };
  };

  const parseTerm = (sign: 1n | -1n): Term => {
    const term: Term = { sign, factors: [] };
    let op: '*' | '/' = '*';
    for (;;) {
      const factor = parseFactor();
      // 1つの項だけの括弧は、掛け算の並びに展開する（割り算の後ろは、括弧内が因数1つのときだけ
      // A/(B) → A/B と展開し、因数が2つ以上なら 0 での割り算を保つため展開しない）
      if (factor.kind === 'group' && factor.expr.length === 1) {
        const inner = factor.expr[0];
        if (op === '*') {
          term.sign = (term.sign * inner.sign) as 1n | -1n;
          term.factors.push(...inner.factors);
        } else if (inner.factors.length === 1) {
          term.sign = (term.sign * inner.sign) as 1n | -1n;
          term.factors.push({ op: '/', factor: inner.factors[0].factor });
        } else {
          term.factors.push({ op, factor });
        }
      } else {
        term.factors.push({ op, factor });
      }
      const next = tokens[pos];
      if (next?.kind === 'sym' && (next.sym === '*' || next.sym === '/')) {
        op = next.sym;
        pos++;
      } else {
        return term;
      }
    }
  };

  const parseExpr = (): Expr => {
    const expr: Expr = [];
    let sign: 1n | -1n = 1n;
    for (;;) {
      const term = parseTerm(sign);
      // 括弧1つだけの項は、足し算・引き算の並びに展開する
      const only = term.factors[0];
      if (term.factors.length === 1 && only.factor.kind === 'group') {
        for (const inner of only.factor.expr) {
          expr.push({ sign: (term.sign * inner.sign) as 1n | -1n, factors: inner.factors });
        }
      } else {
        expr.push(term);
      }
      const next = tokens[pos];
      if (next?.kind === 'sym' && (next.sym === '+' || next.sym === '-')) {
        sign = next.sym === '-' ? -1n : 1n;
        pos++;
      } else {
        return expr;
      }
    }
  };

  const sides: Expr[] = [parseExpr()];
  while (pos < tokens.length) {
    pos++; // '='
    sides.push(parseExpr());
  }
  return sides;
};

/** 入力全体を解析する。文字の番号は入力に現れた順（探索に使う行だけを数える） */
const parseInternal = (input: string): InternalParse => {
  const skipped: ParseError[] = [];
  const errors: ParseError[] = [];
  const letterIndex = new Map<string, number>();
  const letters: string[] = [];
  const lines: ParsedLine[] = [];

  input.split(/\r\n|\r|\n/).forEach((rawLine, i) => {
    const lineNo = i + 1;
    // 書記素に分けてから1つずつ置き換えるので、置き換えで書記素の切れ目は変わらない
    const chars = splitChars(rawLine)
      .filter((ch) => !WHITESPACE.test(ch))
      .map(toHalfWidth);
    if (chars.length === 0) return;

    const tokens = tokenize(chars);
    const messages = validateLine(chars, tokens);
    if (messages.size > 0) {
      for (const message of messages) skipped.push({ line: lineNo, message });
      return;
    }

    // 文字の登録（11種類目が現れた行でエラー）
    for (const ch of chars) {
      if (OPERATOR_SYMBOLS.has(ch) || DIGIT_SYMBOLS.has(ch) || letterIndex.has(ch)) continue;
      letterIndex.set(ch, letters.length);
      letters.push(ch);
      if (letters.length === MAX_LETTERS + 1) {
        errors.push({
          line: lineNo,
          message: `文字の種類が${MAX_LETTERS}を超えています（最大${MAX_LETTERS}種類）`,
        });
      }
    }
    if (errors.length > 0) return;

    lines.push({ chars, sides: buildSides(tokens, letterIndex) });
  });

  return { skipped, errors, letters, lines };
};

// ---- 式の走査 ----

const forEachOperand = (expr: Expr, fn: (operand: Operand) => void): void => {
  for (const term of expr) {
    for (const { factor } of term.factors) {
      if (factor.kind === 'num') fn(factor);
      else forEachOperand(factor.expr, fn);
    }
  }
};

const hasDivision = (expr: Expr): boolean =>
  expr.some((term) =>
    term.factors.some(
      ({ op, factor }) => op === '/' || (factor.kind === 'group' && hasDivision(factor.expr))
    )
  );

/** 数の足し算・引き算だけでできた式か */
const isLinear = (expr: Expr): boolean =>
  expr.every((term) => term.factors.length === 1 && term.factors[0].factor.kind === 'num');

/** 式に含まれる文字（数の下 k 桁に限る場合は k を指定） */
const exprLetters = (expr: Expr, k = Infinity): Set<number> => {
  const result = new Set<number>();
  forEachOperand(expr, ({ syms }) => {
    for (let i = Math.max(0, syms.length - k); i < syms.length; i++) {
      if (isLetterSym(syms[i])) result.add(syms[i]);
    }
  });
  return result;
};

const maxOperandLength = (exprs: Expr[]): number => {
  let max = 0;
  for (const expr of exprs) forEachOperand(expr, ({ syms }) => (max = Math.max(max, syms.length)));
  return max;
};

// ---- 評価 ----

const symValue = (sym: Sym, digits: Int8Array): number =>
  isLetterSym(sym) ? digits[sym] : literalDigit(sym);

/** 数の下 k 桁（k 省略時は全桁）の値 */
const operandBig = (operand: Operand, digits: Int8Array, k = Infinity): bigint => {
  const { syms } = operand;
  const start = Math.max(0, syms.length - k);
  // 15桁までは Number で正確に計算できる
  if (syms.length - start <= 15) {
    let v = 0;
    for (let i = start; i < syms.length; i++) v = v * 10 + symValue(syms[i], digits);
    return BigInt(v);
  }
  let v = 0n;
  for (let i = start; i < syms.length; i++) v = v * 10n + BigInt(symValue(syms[i], digits));
  return v;
};

/** 式を有理数 [分子, 分母]（分母 > 0）として評価する。0 で割ったら null */
const evalExpr = (expr: Expr, digits: Int8Array): [bigint, bigint] | null => {
  let num = 0n;
  let den = 1n;
  for (const term of expr) {
    let n: bigint = term.sign;
    let d = 1n;
    for (const { op, factor } of term.factors) {
      let vn: bigint;
      let vd = 1n;
      if (factor.kind === 'num') {
        vn = operandBig(factor, digits);
      } else {
        const v = evalExpr(factor.expr, digits);
        if (v === null) return null;
        [vn, vd] = v;
      }
      if (op === '*') {
        n *= vn;
        d *= vd;
      } else {
        if (vn === 0n) return null;
        n *= vd;
        d *= vn;
      }
    }
    if (d < 0n) {
      n = -n;
      d = -d;
    }
    num = num * d + n * den;
    den *= d;
  }
  return [num, den];
};

/** 割り算を含まない式を、各数の下 k 桁だけで評価する（10^k を法とした値の判定用） */
const evalExprLow = (expr: Expr, digits: Int8Array, k: number): bigint => {
  let sum = 0n;
  for (const term of expr) {
    let n: bigint = term.sign;
    for (const { factor } of term.factors) {
      n *=
        factor.kind === 'num' ? operandBig(factor, digits, k) : evalExprLow(factor.expr, digits, k);
    }
    sum += n;
  }
  return sum;
};

const abs = (v: bigint): bigint => (v < 0n ? -v : v);

const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);

/**
 * 1次式 Σ coef[文字]×数字 + constant が 0（mod 未指定）または mod の倍数かを判定する関数。
 * Number で正確に計算できない大きさなら null
 */
const linearCheck = (
  coefs: Map<number, bigint>,
  constant: bigint,
  mod?: bigint
): CheckFn | null => {
  const entries = [...coefs].map(([i, c]): [number, bigint] => [i, mod ? c % mod : c]);
  const c0 = mod ? constant % mod : constant;
  let bound = abs(c0);
  for (const [, c] of entries) bound += abs(c) * 9n;
  if (bound > MAX_SAFE) return null;
  const idx = entries.filter(([, c]) => c !== 0n).map(([i]) => i);
  const cs = entries.filter(([, c]) => c !== 0n).map(([, c]) => Number(c));
  const k = Number(c0);
  const m = mod ? Number(mod) : 0;
  return (digits) => {
    let sum = k;
    for (let j = 0; j < idx.length; j++) sum += cs[j] * digits[idx[j]];
    return m ? sum % m === 0 : sum === 0;
  };
};

/** 1次の等式 left = right を Σ coef×文字 + constant = 0 の形にする */
const linearForm = (left: Expr, right: Expr): { coefs: Map<number, bigint>; constant: bigint } => {
  const coefs = new Map<number, bigint>();
  let constant = 0n;
  const add = (expr: Expr, sideSign: bigint) => {
    for (const term of expr) {
      const { syms } = term.factors[0].factor as Operand;
      let weight = 1n;
      for (let i = syms.length - 1; i >= 0; i--) {
        const c = sideSign * term.sign * weight;
        if (isLetterSym(syms[i])) coefs.set(syms[i], (coefs.get(syms[i]) ?? 0n) + c);
        else constant += c * BigInt(literalDigit(syms[i]));
        weight *= 10n;
      }
    }
  };
  add(left, 1n);
  add(right, -1n);
  return { coefs, constant };
};

/** 等式 left = right の判定（完全な判定と、下の桁から枝刈りする判定）を作る */
const buildChecks = (left: Expr, right: Expr): Check[] => {
  const checks: Check[] = [];
  const allLetters = new Set([...exprLetters(left), ...exprLetters(right)]);
  const linear = isLinear(left) && isLinear(right);
  const form = linear ? linearForm(left, right) : null;

  // 下 k 桁での判定（足し算・引き算・掛け算だけなら、各数を 10^k で割った余りに置き換えても
  // 両辺は 10^k を法として等しいはず。割り算を含む等式では成り立たないので行わない）
  if (!hasDivision(left) && !hasDivision(right)) {
    const maxLen = maxOperandLength([left, right]);
    let prevSize = -1;
    for (let k = 1; k < maxLen; k++) {
      const low = new Set([...exprLetters(left, k), ...exprLetters(right, k)]);
      if (low.size === allLetters.size) break;
      if (low.size === prevSize) continue;
      prevSize = low.size;
      const mod = 10n ** BigInt(k);
      const fn =
        (form && linearCheck(form.coefs, form.constant, mod)) ??
        ((digits: Int8Array) =>
          (evalExprLow(left, digits, k) - evalExprLow(right, digits, k)) % mod === 0n);
      checks.push({ letters: [...low], fn });
    }
  }

  // 完全な判定（有理数として正確に比較）
  const full =
    (form && linearCheck(form.coefs, form.constant)) ??
    ((digits: Int8Array) => {
      const a = evalExpr(left, digits);
      const b = evalExpr(right, digits);
      if (a === null || b === null) return false;
      return a[0] * b[1] === b[0] * a[1];
    });
  checks.push({ letters: [...allLetters], fn: full });
  return checks;
};

/** 判定が早く行えるよう、文字の割り当て順を決める */
const decideOrder = (letterCount: number, checks: Check[]): number[] => {
  const assigned = new Set<number>();
  const order: number[] = [];
  const push = (i: number) => {
    assigned.add(i);
    order.push(i);
  };
  while (order.length < letterCount) {
    // 未割り当ての文字が最も少ない判定を先に完成させる
    let best: number[] | null = null;
    for (const check of checks) {
      const missing = check.letters.filter((i) => !assigned.has(i));
      if (missing.length > 0 && (best === null || missing.length < best.length)) best = missing;
    }
    if (best === null) {
      for (let i = 0; i < letterCount; i++) if (!assigned.has(i)) push(i);
    } else {
      [...best].sort((a, b) => a - b).forEach(push);
    }
  }
  return order;
};

/**
 * 覆面算を解く。不完全な行は探索から外し、残りの行だけで探索する。
 * 外した行は onSkipped で知らせる（探索を始める前に1回だけ呼ぶ）。解を見つけるたびに onSolution を呼ぶ。
 * maxSolutions + 1 件目の解を見つけた時点で探索を止め、truncated = true を返す（その解は渡さない）
 */
export function solveCryptarithm(
  input: string,
  maxSolutions: number,
  onSolution: (s: CryptarithmSolution) => void,
  onSkipped?: (skipped: ParseError[]) => void
): { count: number; truncated: boolean; hasEquations: boolean } | { errors: ParseError[] } {
  const { skipped, errors, letters, lines } = parseInternal(input);
  onSkipped?.(skipped);
  if (errors.length > 0) return { errors };
  if (lines.length === 0) return { count: 0, truncated: false, hasEquations: false };

  const n = letters.length;

  // 2文字以上の数の先頭の文字には 0 を割り当てない
  const nonZero = new Array<boolean>(n).fill(false);
  const checks: Check[] = [];
  for (const { sides } of lines) {
    for (const side of sides) {
      forEachOperand(side, ({ syms }) => {
        if (syms.length >= 2 && isLetterSym(syms[0])) nonZero[syms[0]] = true;
      });
    }
    // '=' で連鎖した辺はすべて最初の辺と等しい
    for (let i = 1; i < sides.length; i++) checks.push(...buildChecks(sides[0], sides[i]));
  }

  const order = decideOrder(n, checks);
  const position = new Array<number>(n);
  order.forEach((letter, pos) => (position[letter] = pos));

  // checksAt[d]: d 文字を割り当て終えた時点で判定できるもの
  const checksAt: CheckFn[][] = Array.from({ length: n + 1 }, () => []);
  for (const check of checks) {
    const depth = check.letters.reduce((max, i) => Math.max(max, position[i] + 1), 0);
    checksAt[depth].push(check.fn);
  }

  const digits = new Int8Array(n);
  const passes = (depth: number): boolean => checksAt[depth].every((fn) => fn(digits));

  const letterIndex = new Map(letters.map((ch, i) => [ch, i]));
  const makeSolution = (): CryptarithmSolution => {
    const equations = lines.map(({ chars }) =>
      chars
        .map((ch) => {
          const i = letterIndex.get(ch);
          return i === undefined ? ch : String(digits[i]);
        })
        .join('')
    );
    const assignments: Assignment[] = letters
      .map((letter, i) => ({ letter, digit: digits[i] }))
      .sort((a, b) => a.digit - b.digit);
    return { equations, assignments };
  };

  let count = 0;
  let truncated = false;

  /** 探索を止めるとき true を返す */
  const search = (depth: number, used: number): boolean => {
    if (depth === n) {
      if (count >= maxSolutions) {
        truncated = true;
        return true;
      }
      count++;
      onSolution(makeSolution());
      return false;
    }
    const letter = order[depth];
    for (let d = nonZero[letter] ? 1 : 0; d <= 9; d++) {
      const bit = 1 << d;
      if (used & bit) continue;
      digits[letter] = d;
      if (passes(depth + 1) && search(depth + 1, used | bit)) return true;
    }
    return false;
  };

  if (passes(0)) search(0, 0);
  return { count, truncated, hasEquations: true };
}
