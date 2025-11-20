import React, { useMemo } from 'react';
import { RowColor } from '../../types/kanaVisualizer/kana';
import {
  KANA_MAPPING,
  GRID_ROWS,
  GRID_COLS,
  VALID_POSITIONS,
} from '../../utils/kanaVisualizer/kanaMapping';
import { extractSeion } from '../../utils/kanaVisualizer/kanaUtils';
import { calculateMixedColor } from '../../utils/kanaVisualizer/colorUtils';
import KanaCell from './KanaCell';
import styles from './KanaTable.module.css';

interface KanaTableProps {
  lines: string[]; // 入力された各行のテキスト
}

const KanaTable: React.FC<KanaTableProps> = ({ lines }) => {
  // グリッドデータを計算（どのマスに何色を塗るか）
  const gridData = useMemo(() => {
    // 各マスの情報を格納する2次元配列
    const grid: Array<
      Array<{ character: string | null; color: RowColor | null }>
    > = Array(GRID_ROWS)
      .fill(null)
      .map(() =>
        Array(GRID_COLS)
          .fill(null)
          .map(() => ({ character: null, color: null }))
      );

    // 各かな文字がどの行に含まれているかを記録
    const kanaToRows: Map<string, number[]> = new Map();

    // 各行のテキストを処理
    lines.forEach((line, lineIndex) => {
      const seionChars = extractSeion(line);
      seionChars.forEach((char) => {
        if (!kanaToRows.has(char)) {
          kanaToRows.set(char, []);
        }
        const rows = kanaToRows.get(char)!;
        if (!rows.includes(lineIndex)) {
          rows.push(lineIndex);
        }
      });
    });

    // グリッドに文字と色を配置
    kanaToRows.forEach((rowIndices, char) => {
      const position = KANA_MAPPING[char];
      if (position) {
        const { row, col } = position;
        const color = calculateMixedColor(rowIndices);
        grid[row][col] = { character: char, color };
      }
    });

    return grid;
  }, [lines]);

  return (
    <div className={styles.container}>
      <div className={styles.table}>
        {gridData.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.row}>
            {row.map((cell, colIndex) => {
              // 文字が存在しない位置は空欄にする
              const isValidPosition = VALID_POSITIONS.has(
                `${rowIndex}-${colIndex}`
              );
              if (!isValidPosition) {
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={styles.emptyCell}
                  />
                );
              }
              return (
                <KanaCell
                  key={`${rowIndex}-${colIndex}`}
                  character={cell.character}
                  color={cell.color}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanaTable;
