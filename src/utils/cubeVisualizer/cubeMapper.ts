import { GridData, NetPattern, FaceMapping } from "../../types/cube";

// 面のインデックスから面の名前へのマッピング
const FACE_NAMES = ["right", "left", "top", "bottom", "front", "back"] as const;

/**
 * 変換の種類から追加の回転角度を計算
 */
function getTransformationRotation(transformation?: string): number {
  if (!transformation) return 0;

  // 展開図の2D回転による文字の回転角度
  if (transformation.includes("rotate90")) return 90;
  if (transformation.includes("rotate180")) return 180;
  if (transformation.includes("rotate270")) return 270;

  return 0;
}

/**
 * 展開図から立方体面へのマッピング
 * - pattern.faces配列を使用（配列のインデックスが面の種類を表す）
 * - 最終回転角度 = ユーザー入力 + パターンのrotation + 変換による回転
 */
export function mapNetToCube(
  gridData: GridData,
  pattern: NetPattern,
  filledCells: [number, number][],
  cellMapping: number[],
  transformation?: string
): FaceMapping[] {
  const faceMappings: FaceMapping[] = [];
  const transformRotation = getTransformationRotation(transformation);

  // pattern.faces配列を順に処理
  // [0]=right, [1]=left, [2]=top, [3]=bottom, [4]=front, [5]=back
  for (let i = 0; i < pattern.faces.length; i++) {
    const actualCellIndex = cellMapping[i];

    if (actualCellIndex >= 0 && actualCellIndex < filledCells.length) {
      const [row, col] = filledCells[actualCellIndex];
      const cellData = gridData[row][col];
      const faceName = FACE_NAMES[i];
      const patternFace = pattern.faces[i];

      if (cellData.char) {
        // 最終回転角度 = ユーザー入力 + パターンのrotation + 変換による回転
        const finalRotation = (cellData.rotation + patternFace.rotation + transformRotation + 360) % 360;

        faceMappings.push({
          face: faceName,
          char: cellData.char,
          rotation: finalRotation,
        });
      }
    }
  }

  return faceMappings;
}
