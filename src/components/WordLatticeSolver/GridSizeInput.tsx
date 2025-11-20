import React from 'react';
import styles from './WordLatticeSolver.module.css';

interface GridSizeInputProps {
  rows: number;
  cols: number;
  onRowsChange: (rows: number) => void;
  onColsChange: (cols: number) => void;
}

export const GridSizeInput: React.FC<GridSizeInputProps> = ({
  rows,
  cols,
  onRowsChange,
  onColsChange,
}) => {
  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 1 && value <= 5) {
      onRowsChange(value);
    }
  };

  const handleColsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 1 && value <= 5) {
      onColsChange(value);
    }
  };

  return (
    <div className={styles.gridSizeInput}>
      <h2>格子サイズ</h2>
      <div className={styles.inputGroup}>
        <label>
          行数:
          <input
            type="number"
            min="1"
            max="5"
            value={rows}
            onChange={handleRowsChange}
            className={styles.numberInput}
          />
        </label>
        <label>
          列数:
          <input
            type="number"
            min="1"
            max="5"
            value={cols}
            onChange={handleColsChange}
            className={styles.numberInput}
          />
        </label>
      </div>
    </div>
  );
};
