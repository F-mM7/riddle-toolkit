import React from 'react';
import styles from './WordLatticeSolver.module.css';

interface GridVisualizationProps {
  solution: string[][]; // (rows+1) × (cols+1) の格子点配置
  solutionIndex: number; // 解の番号（表示用）
}

export const GridVisualization: React.FC<GridVisualizationProps> = ({
  solution,
  solutionIndex,
}) => {
  const cols = solution[0]?.length || 0;

  return (
    <div className={styles.gridVisualization}>
      <h3 className={styles.gridTitle}>解 {solutionIndex}</h3>
      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${cols}, 40px)`,
        }}
      >
        {solution.map((row, i) =>
          row.map((char, j) => (
            <div key={`${i}-${j}`} className={styles.gridCell}>
              {char}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
