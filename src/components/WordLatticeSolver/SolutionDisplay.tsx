import React, { useMemo } from 'react';
import { validateWords } from '../../utils/wordLatticeSolver/validation';
import { solveGrid } from '../../utils/wordLatticeSolver/gridSolver';
import { GridVisualization } from './GridVisualization';
import styles from './WordLatticeSolver.module.css';

interface SolutionDisplayProps {
  words: string[][];
}

export const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ words }) => {
  // 入力検証
  const validation = useMemo(() => validateWords(words), [words]);

  // 解の計算（検証が成功した場合）
  const solutions = useMemo(() => {
    if (!validation.isValid) {
      return [];
    }
    return solveGrid(words);
  }, [validation.isValid, words]);

  return (
    <div className={styles.solutionSection}>
      <h2>解</h2>

      {/* 検証エラーの表示 */}
      {!validation.isValid && (
        <div className={styles.errorBox}>
          <h3 className={styles.errorTitle}>入力エラー</h3>
          <ul className={styles.errorList}>
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 検証が成功した場合 */}
      {validation.isValid && (
        <>
          {/* 解が存在しない場合 */}
          {solutions.length === 0 && (
            <div className={styles.warningBox}>
              <p>解が見つかりませんでした。別の単語を試してください。</p>
            </div>
          )}

          {/* 解が存在する場合 */}
          {solutions.length > 0 && (
            <div>
              <p className={styles.successMessage}>
                {solutions.length >= 10
                  ? '10個以上の解が存在します（最初の10個を表示）'
                  : `${solutions.length}個の解が見つかりました`}
              </p>
              <div className={styles.solutionGrid}>
                {solutions.map((solution, index) => (
                  <GridVisualization
                    key={index}
                    solution={solution}
                    solutionIndex={index + 1}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
