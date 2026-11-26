// 名前の一覧の種類
export type ListKind = 'prefecture' | 'capital';

// 検索の対象（都道府県名・県庁所在地名・両方）
export type SearchTarget = ListKind | 'both';

// 検索モード（正規表現・部分一致）
export type SearchMode = 'regex' | 'partial';

// 検索対象の1項目（同じ読みでも一覧が違えば別の項目）
export interface NameEntry {
  name: string;
  list: ListKind;
}

// パターン入力の状態
export interface Pattern {
  id: string;
  value: string;
  isValid: boolean;
  error?: string;
}

// キャプチャグループの情報
export interface CaptureGroup {
  patternId: string;
  groupIndex: number;
  value: string;
}

// 1パターン分のマッチ
export interface PatternMatch {
  patternId: string;
  matched: string;
  list: ListKind;
  captures: string[];
}

// マッチ結果
export interface MatchResult {
  patterns: PatternMatch[];
}
