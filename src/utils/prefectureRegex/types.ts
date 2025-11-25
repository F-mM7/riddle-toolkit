// 検索モード
export type SearchMode = 'prefecture' | 'capital';

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

// マッチ結果
export interface MatchResult {
  patterns: {
    patternId: string;
    matched: string;
    captures: string[];
  }[];
}
