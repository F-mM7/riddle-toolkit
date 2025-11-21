import { useState, useEffect } from 'react';
import { GridSizeInput } from './GridSizeInput';
import { WordInput } from './WordInput';
import { SolutionDisplay } from './SolutionDisplay';
import styles from './WordLatticeSolver.module.css';

export function WordLatticeSolver() {
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [words, setWords] = useState<string[][]>(
    Array(2)
      .fill(null)
      .map(() => Array(2).fill(''))
  );

  // 行数・列数が変更されたら、words配列をリサイズ
  useEffect(() => {
    setWords((prevWords) => {
      const newWords = Array(rows)
        .fill(null)
        .map((_, i) =>
          Array(cols)
            .fill(null)
            .map((_, j) => {
              // 既存の入力を可能な限り保持
              if (i < prevWords.length && j < prevWords[i].length) {
                return prevWords[i][j];
              }
              return '';
            })
        );
      return newWords;
    });
  }, [rows, cols]);

  return (
    <div className={styles.container}>
      <GridSizeInput
        rows={rows}
        cols={cols}
        onRowsChange={setRows}
        onColsChange={setCols}
      />

      <WordInput
        rows={rows}
        cols={cols}
        words={words}
        onWordsChange={setWords}
      />

      <SolutionDisplay words={words} />
    </div>
  );
}
