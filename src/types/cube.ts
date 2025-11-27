// セルデータ
export interface CellData {
  row: number; // 行位置 (0-4)
  col: number; // 列位置 (0-4)
  char: string; // 入力文字（空文字列なら空セル）
  rotation: number; // 回転角度 (0, 90, 180, 270)
}

// グリッドデータ
export type GridData = CellData[][];

// 立方体の面
export type CubeFace = "front" | "back" | "left" | "right" | "top" | "bottom";

// 展開図パターンの面情報
export interface NetPatternFace {
  cell: [number, number]; // セルの相対座標
  rotation: number; // 3D化する際に追加で回転させる角度（0, 90, 180, 270）
  // ユーザー入力の回転角度に、この値を加算してCube3Dに渡す
}

// 展開図パターン（相対座標）
export interface NetPattern {
  name: string;
  faces: [
    NetPatternFace, // [0] right  (+X)
    NetPatternFace, // [1] left   (-X)
    NetPatternFace, // [2] top    (+Y)
    NetPatternFace, // [3] bottom (-Y)
    NetPatternFace, // [4] front  (+Z)
    NetPatternFace, // [5] back   (-Z)
  ];
  // 注: cellsプロパティは手入力を簡略化するため削除。
  // パターンマッチング時に faces から自動生成する。
}

// 面へのマッピング結果
export interface FaceMapping {
  face: CubeFace;
  char: string;
  rotation: number; // 最終的な回転角度（ユーザー入力 + パターンのrotation）
}

// 検証結果
export interface ValidationResult {
  isValid: boolean;
  matchedPattern?: NetPattern;
  filledCells?: [number, number][]; // マッチした実際のセル座標
  cellMapping?: number[]; // パターンのセルインデックス→実際のセルインデックスのマッピング
  transformation?: string; // マッチした変換の種類（"original", "rotate90"など）
}
