// シーケンスとばし: 結果1件分の情報
export interface SkippedItem {
  position: number;       // 列内での出現順（0始まり）
  sourceIndex: number;    // 元シーケンス内のインデックス（0始まり）
  display: string;
  reading?: string;
}
