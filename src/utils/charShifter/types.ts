// モード
export type ShiftMode = 'individual' | 'batch' | 'compare';

// 順序タイプ
export type OrderType = 'gojuon' | 'iroha47' | 'iroha48' | 'alphabet' | 'custom';

// 文字種別
export type CharacterType =
  | 'seion' // 清音
  | 'dakuon' // 濁音
  | 'handakuon' // 半濁音
  | 'kogaki'; // 小字

// ずらし後の文字の候補
export interface ShiftCandidate {
  shifted: string; // ずらし後の文字
  isFullMatch: boolean; // 濁音等が完全一致したか
  baseChar?: string; // 清音で表示する場合の基底文字
  originalIndex?: number; // 元の文字の順序インデックス（1始まり）
  shiftedIndex?: number; // ずらし後の文字の順序インデックス（1始まり）
}

// ずらし結果の文字情報
export interface ShiftedChar {
  original: string; // 元の文字
  shiftAmount: number; // ずらし数
  // ずらし後の候補（通常は1つ。オリジナルシーケンスで位置が決まらない文字は出現位置ごとに複数）
  candidates: ShiftCandidate[];
}

// 入力状態
export interface InputState {
  kanaText: string; // 入力されたかな文字列
  shifts: number[]; // ずらし数の配列
  mode: ShiftMode; // 個別/一括モード
}

// 2文字間の距離情報（比較モード）
// オリジナルシーケンスで位置が決まらない文字を含む場合、位置・距離は候補を複数持つ
export interface CharDistance {
  char1?: string; // 単語1の文字
  char2?: string; // 単語2の文字
  indices1?: number[]; // 単語1の文字の順序インデックス（1始まり、昇順）
  indices2?: number[]; // 単語2の文字の順序インデックス（1始まり、昇順）
  distances?: DistanceCandidate[]; // 考えられる距離（順方向の昇順、重複なし）
  isValid: boolean; // 両文字が順序表に存在し比較可能か
}

// 距離の候補
export interface DistanceCandidate {
  forward: number; // 順方向（単語1→単語2）の距離
  backward: number; // 逆方向（単語2→単語1）の距離
}
