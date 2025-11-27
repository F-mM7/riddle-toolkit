import { useState, useEffect, useRef } from "react";
import InputGrid from "./InputGrid";
import CubeViewer from "./CubeViewer";
import { GridData, FaceMapping } from "../../types/cube";
import { validateNet } from "../../utils/cubeVisualizer/netValidator";
import { mapNetToCube } from "../../utils/cubeVisualizer/cubeMapper";
import styles from "./CubeVisualizer.module.css";

// 初期化用のヘルパー関数
function createEmptyGrid(): GridData {
  return Array(5)
    .fill(null)
    .map((_, row) =>
      Array(5)
        .fill(null)
        .map((_, col) => ({
          row,
          col,
          char: "",
          rotation: 0,
        }))
    );
}

// サンプルデータ（ランダムな連続6マス）
function createSampleGrid(): GridData {
  const grid = createEmptyGrid();

  // ランダムに連続した6マスを選択
  const selectedCells: Array<{ row: number; col: number }> = [];
  const adjacentCells: Array<{ row: number; col: number }> = [];

  // 1. ランダムに最初の1マスを選ぶ
  const firstRow = Math.floor(Math.random() * 5);
  const firstCol = Math.floor(Math.random() * 5);
  selectedCells.push({ row: firstRow, col: firstCol });

  // 隣接マスを取得する関数
  const getAdjacentCells = (row: number, col: number): Array<{ row: number; col: number }> => {
    const adjacent: Array<{ row: number; col: number }> = [];
    // 上下左右の4方向
    const directions = [
      { dr: -1, dc: 0 }, // 上
      { dr: 1, dc: 0 },  // 下
      { dr: 0, dc: -1 }, // 左
      { dr: 0, dc: 1 },  // 右
    ];

    directions.forEach(({ dr, dc }) => {
      const newRow = row + dr;
      const newCol = col + dc;
      // グリッド範囲内かつ未選択のセルのみ追加
      if (
        newRow >= 0 && newRow < 5 &&
        newCol >= 0 && newCol < 5 &&
        !selectedCells.some(cell => cell.row === newRow && cell.col === newCol) &&
        !adjacentCells.some(cell => cell.row === newRow && cell.col === newCol)
      ) {
        adjacent.push({ row: newRow, col: newCol });
      }
    });

    return adjacent;
  };

  // 最初のマスの隣接マスを追加
  adjacentCells.push(...getAdjacentCells(firstRow, firstCol));

  // 2. 隣接リストから1マスを選び、そのマスの隣接マスを追加する処理を5回繰り返す
  for (let i = 0; i < 5; i++) {
    if (adjacentCells.length === 0) {
      // 隣接マスがなくなった場合は中断（通常は起こらないはず）
      break;
    }

    // ランダムに隣接マスを1つ選ぶ
    const randomIndex = Math.floor(Math.random() * adjacentCells.length);
    const selectedCell = adjacentCells[randomIndex];

    // 選択したマスを隣接リストから削除し、選択済みリストに追加
    adjacentCells.splice(randomIndex, 1);
    selectedCells.push(selectedCell);

    // 新しく選んだマスの隣接マスを隣接リストに追加
    const newAdjacentCells = getAdjacentCells(selectedCell.row, selectedCell.col);
    adjacentCells.push(...newAdjacentCells);
  }

  // 選択した6マスに文字を設定（A～F、ランダムな回転）
  selectedCells.forEach((cell, index) => {
    const chars = ['A', 'B', 'C', 'D', 'E', 'F'];
    const rotations = [0, 90, 180, 270];
    const randomRotation = rotations[Math.floor(Math.random() * rotations.length)];

    grid[cell.row][cell.col] = {
      row: cell.row,
      col: cell.col,
      char: chars[index],
      rotation: randomRotation,
    };
  });

  return grid;
}

export function CubeVisualizer() {
  // グリッドデータの初期化
  const [gridData, setGridData] = useState<GridData>(createEmptyGrid);

  const [isValid, setIsValid] = useState(false);
  const [faceMappings, setFaceMappings] = useState<FaceMapping[]>([]);

  // Sampleボタンの表示状態
  const [showSampleButton, setShowSampleButton] = useState(false);

  // Clearボタンの連続クリック数を追跡
  const clearCountRef = useRef(0);
  const lastClearTimeRef = useRef(0);
  const gridModifiedRef = useRef(false);

  // グリッドが変更されるたびに検証
  useEffect(() => {
    const result = validateNet(gridData);
    console.log("Validation result:", result);
    setIsValid(result.isValid);

    if (result.isValid && result.matchedPattern && result.filledCells && result.cellMapping) {
      const mappings = mapNetToCube(
        gridData,
        result.matchedPattern,
        result.filledCells,
        result.cellMapping,
        result.transformation
      );
      console.log("Face mappings:", mappings);
      setFaceMappings(mappings);
    } else {
      setFaceMappings([]);
    }
  }, [gridData]);

  // グリッド変更を監視
  const handleGridChange = (newGridData: GridData) => {
    gridModifiedRef.current = true;
    clearCountRef.current = 0; // グリッド変更時にカウントリセット
    setGridData(newGridData);
  };

  // Clearボタンの処理
  const handleClear = () => {
    const now = Date.now();
    const timeSinceLastClear = now - lastClearTimeRef.current;

    // 3秒以内のクリックのみカウント
    if (timeSinceLastClear > 3000) {
      clearCountRef.current = 0;
      gridModifiedRef.current = false;
    }

    lastClearTimeRef.current = now;

    // グリッドが変更されていない場合のみカウント
    if (!gridModifiedRef.current) {
      clearCountRef.current++;

      if (clearCountRef.current >= 5) {
        // 5回目でSampleボタンを表示
        setShowSampleButton(true);
        clearCountRef.current = 0;
        return;
      }
    }

    // 通常のクリア
    setGridData(createEmptyGrid());
    gridModifiedRef.current = false;
  };

  // Sampleボタンの処理
  const handleSample = () => {
    setGridData(createSampleGrid());
    gridModifiedRef.current = true;
    clearCountRef.current = 0;
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>展開図入力</h2>
          <InputGrid gridData={gridData} onGridChange={handleGridChange} />
          <div className={styles.controls}>
            <button onClick={handleClear} className={`${styles.button} ${styles.clearButton}`} tabIndex={-1}>
              Clear
            </button>
            {showSampleButton && (
              <button onClick={handleSample} className={`${styles.button} ${styles.sampleButton}`} tabIndex={-1}>
                Sample
              </button>
            )}
          </div>
        </div>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>3Dプレビュー</h2>
          {isValid ? (
            <CubeViewer faceMappings={faceMappings} />
          ) : (
            <div className={styles.errorMessage}>
              <p>有効な展開図を入力してください</p>
              <p className={styles.hint}>6個のセルに文字を入力し、立方体の展開図を作成してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
