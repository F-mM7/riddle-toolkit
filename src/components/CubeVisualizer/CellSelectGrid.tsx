import { useState, useEffect } from 'react';
import { GridData } from '../../types/cube';
import styles from './CellSelectGrid.module.css';

interface CellSelectGridProps {
  gridData: GridData;
  onSelectChange: (row: number, col: number, selected: boolean) => void;
}

/**
 * 展開図で使用するセルを選択するグリッド
 * 押したセルの状態で塗り/消しモードを決め、ドラッグでなぞったセルにも適用する
 */
export default function CellSelectGrid({ gridData, onSelectChange }: CellSelectGridProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'fill' | 'erase'>('fill');

  const handleMouseDown = (row: number, col: number) => {
    setIsDragging(true);
    const newMode = !gridData[row][col].selected ? 'fill' : 'erase';
    setDragMode(newMode);
    onSelectChange(row, col, newMode === 'fill');
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!isDragging) return;
    const shouldBeSelected = dragMode === 'fill';
    if (gridData[row][col].selected !== shouldBeSelected) {
      onSelectChange(row, col, shouldBeSelected);
    }
  };

  // グローバルなマウスアップイベントをリッスン
  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className={styles.grid}>
      {gridData.map((rowData, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          {rowData.map((cellData, colIndex) => (
            <button
              key={colIndex}
              className={`${styles.cell} ${cellData.selected ? styles.active : styles.inactive}`}
              onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
              onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              type="button"
              tabIndex={-1}
              aria-label={`セル ${rowIndex + 1}-${colIndex + 1}`}
              aria-pressed={cellData.selected}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
