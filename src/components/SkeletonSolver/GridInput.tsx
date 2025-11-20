import { useState, useEffect } from 'react';
import { type Grid } from '../../utils/skeletonSolver/types';
import styles from './GridInput.module.css';

interface GridInputProps {
  grid: Grid;
  onGridChange: (grid: Grid) => void;
  gridSize: number;
  onSizeChange: (size: number) => void;
}

export function GridInput({
  grid,
  onGridChange,
  gridSize,
  onSizeChange,
}: GridInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'fill' | 'erase'>('fill');

  const setCellValue = (row: number, col: number, value: boolean) => {
    const newGrid = grid.map((r, rIndex) =>
      r.map((cell, cIndex) => (rIndex === row && cIndex === col ? value : cell))
    );
    onGridChange(newGrid);
  };

  // 上下反転
  const handleFlipVertical = () => {
    const flipped = [...grid].reverse();
    onGridChange(flipped);
  };

  // 左右反転
  const handleFlipHorizontal = () => {
    const flipped = grid.map((row) => [...row].reverse());
    onGridChange(flipped);
  };

  // 右90度回転
  const handleRotateRight = () => {
    const size = grid.length;
    const rotated: Grid = Array.from({ length: size }, () =>
      Array(size).fill(false)
    );
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        rotated[col][size - 1 - row] = grid[row][col];
      }
    }
    onGridChange(rotated);
  };

  // 左90度回転
  const handleRotateLeft = () => {
    const size = grid.length;
    const rotated: Grid = Array.from({ length: size }, () =>
      Array(size).fill(false)
    );
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        rotated[size - 1 - col][row] = grid[row][col];
      }
    }
    onGridChange(rotated);
  };

  const handleMouseDown = (row: number, col: number) => {
    setIsDragging(true);
    const newMode = !grid[row][col] ? 'fill' : 'erase';
    setDragMode(newMode);
    setCellValue(row, col, newMode === 'fill');
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!isDragging) return;
    const shouldBeActive = dragMode === 'fill';
    if (grid[row][col] !== shouldBeActive) {
      setCellValue(row, col, shouldBeActive);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // グローバルなマウスアップイベントをリッスン
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>グリッド入力</h2>

      <div className={styles.sizeControl}>
        <label htmlFor="gridSize" className={styles.sizeLabel}>
          グリッドサイズ:
        </label>
        <input
          id="gridSize"
          type="number"
          min="3"
          max="20"
          value={gridSize}
          onChange={(e) =>
            onSizeChange(
              Math.max(3, Math.min(20, parseInt(e.target.value) || 10))
            )
          }
          className={styles.sizeInput}
        />
        <span className={styles.sizeDisplay}>
          {gridSize}×{gridSize}
        </span>
      </div>

      <div className={styles.grid}>
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.row}>
            {row.map((cell, colIndex) => (
              <button
                key={colIndex}
                className={`${styles.cell} ${cell ? styles.active : styles.inactive}`}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                type="button"
                aria-label={`セル ${rowIndex + 1}-${colIndex + 1}`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className={styles.transformButtons}>
        <button
          onClick={handleFlipVertical}
          className={styles.transformButton}
          type="button"
          title="上下反転"
        >
          ↕️
        </button>
        <button
          onClick={handleFlipHorizontal}
          className={styles.transformButton}
          type="button"
          title="左右反転"
        >
          ↔️
        </button>
        <button
          onClick={handleRotateLeft}
          className={styles.transformButton}
          type="button"
          title="左90度回転"
        >
          ↶
        </button>
        <button
          onClick={handleRotateRight}
          className={styles.transformButton}
          type="button"
          title="右90度回転"
        >
          ↷
        </button>
      </div>

      <p className={styles.hint}>
        クリックまたはドラッグでマスを切り替えられます
      </p>
    </div>
  );
}
