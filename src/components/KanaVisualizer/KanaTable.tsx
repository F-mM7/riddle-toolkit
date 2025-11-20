import React, { useMemo } from 'react';
import { RowColor } from '../../types/kanaVisualizer/kana';
import {
  KANA_MAPPING,
  GRID_ROWS,
  GRID_COLS,
  VALID_POSITIONS,
  POSITION_TO_KANA,
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
      Array<{
        character: string | null;
        color: RowColor | null;
        isInput: boolean;
      }>
    > = Array(GRID_ROWS)
      .fill(null)
      .map(() =>
        Array(GRID_COLS)
          .fill(null)
          .map(() => ({ character: null, color: null, isInput: false }))
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

    // すべての清音文字をグリッドに配置
    Object.entries(KANA_MAPPING).forEach(([char, { row, col }]) => {
      const rowIndices = kanaToRows.get(char);
      if (rowIndices && rowIndices.length > 0) {
        // 入力された文字は色付き
        const color = calculateMixedColor(rowIndices);
        grid[row][col] = { character: char, color, isInput: true };
      } else {
        // 入力されていない文字は色なし（暗めに表示）
        grid[row][col] = { character: char, color: null, isInput: false };
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
              // 文字が存在しない位置は空欄にする（や行・わ行の一部）
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
                  isInput={cell.isInput}
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
