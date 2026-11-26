/**
 * 入力の誤り。line は入力の1始まりの行番号。
 * 0 は特定の行に結びつかない誤り（画面で Worker 自体の失敗に使う）
 */
export interface ParseError {
  line: number;
  message: string;
}

/** 文字1つへの数字の割り当て */
export interface Assignment {
  letter: string;
  digit: number;
}

export interface CryptarithmSolution {
  /** 探索に使った各行を、文字を数字に置き換え空白を除いた文字列（例 '9567+1085=10652'） */
  equations: string[];
  /** 文字の割り当て（digit の昇順） */
  assignments: Assignment[];
}

export type WorkerRequest = { type: 'solve'; input: string; maxSolutions: number };

export type WorkerResponse =
  /** 不完全なため探索から外した行。探索を始める前に必ず1回送る（空配列でも） */
  | { type: 'skipped'; errors: ParseError[] }
  | { type: 'solution'; solution: CryptarithmSolution }
  /** hasEquations: 探索に使える行が1つ以上あったか */
  | { type: 'done'; count: number; truncated: boolean; hasEquations: boolean }
  /** 行をまたぐ誤り（文字の種類が多すぎる） */
  | { type: 'error'; errors: ParseError[] };
