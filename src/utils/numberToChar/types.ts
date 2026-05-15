// 数字→文字変換の入力トークン
// number: パース成功した数値（範囲外の場合もそのまま保持）
// raw: 元の入力文字列
// isInvalid: 数値としてパースできなかった場合 true
export interface NumberToken {
  number: number | null;
  raw: string;
  isInvalid: boolean;
}

// 順序ごとの変換結果
// null は範囲外（その順序の文字数を超えている、または 0 以下）を意味する
export interface ConvertedChar {
  token: NumberToken;
  gojuon: string | null;
  iroha: string | null;
  alphabet: string | null;
}
