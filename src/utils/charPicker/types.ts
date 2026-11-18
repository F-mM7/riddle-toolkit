// n文字目抽出の入力トークン
// number: パース成功した数値（範囲外の場合もそのまま保持）
// raw: 元の入力文字列
// isInvalid: 数値としてパースできなかった場合 true
export interface IndexToken {
  number: number | null;
  raw: string;
  isInvalid: boolean;
}

// 抽出結果の状態
// ok: 範囲内で文字を取り出せた
// outOfRange: 数値だが 0 以下、または文字数を超えている
// invalid: 数値として解釈できなかった
export type PickStatus = 'ok' | 'outOfRange' | 'invalid';

// 1 トークン分の抽出結果
// char は status が 'ok' のときのみ文字、それ以外は null
export interface PickedChar {
  token: IndexToken;
  status: PickStatus;
  char: string | null;
}
