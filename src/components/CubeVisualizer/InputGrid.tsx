import { GridData } from '../../types/cube';
import GridCell from './GridCell';
import styles from './InputGrid.module.css';

interface InputGridProps {
  gridData: GridData;
  onCellChange: (row: number, col: number, char: string) => void;
  onCellRotate: (row: number, col: number, direction: 'left' | 'right') => void;
}

/**
 * 文字入力と回転のグリッド（選択セルのみ入力欄を持つ）
 */
export default function InputGrid({ gridData, onCellChange, onCellRotate }: InputGridProps) {
  return (
    <div className={styles.inputGrid}>
      <div className={styles.grid}>
        {gridData.map((rowData, rowIndex) => (
          <div key={rowIndex} className={styles.gridRow}>
            {rowData.map((cellData, colIndex) => (
              <GridCell
                key={`${rowIndex}-${colIndex}`}
                cellData={cellData}
                onChange={onCellChange}
                onRotate={onCellRotate}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
