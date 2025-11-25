// モード
export type ShiftMode = 'individual' | 'batch';

// 順序タイプ
export type OrderType = 'gojuon' | 'iroha47' | 'iroha48' | 'alphabet';

// 文字種別
export type CharacterType =
  | 'seion'        // 清音
  | 'dakuon'       // 濁音
  | 'handakuon'    // 半濁音
  | 'kogaki';      // 小字

// ずらし結果の文字情報
export interface ShiftedChar {
  original: string;           // 元の文字
  shifted: string;            // ずらし後の文字
  isFullMatch: boolean;       // 濁音等が完全一致したか
  baseChar?: string;          // 清音で表示する場合の基底文字
  originalIndex?: number;     // 元の文字の順序インデックス（1始まり）
  shiftedIndex?: number;      // ずらし後の文字の順序インデックス（1始まり）
  shiftAmount: number;        // ずらし数
}

// 入力状態
export interface InputState {
  kanaText: string;           // 入力されたかな文字列
  shifts: number[];           // ずらし数の配列
  mode: ShiftMode;            // 個別/一括モード
}
