import type {
  Grid,
  Solution,
  GridAnalysis,
} from '../../utils/skeletonSolver/types';
import { SolutionGrid } from './SolutionGrid';
import styles from './SolutionDisplay.module.css';

interface SolutionDisplayProps {
  solutions: Solution[];
  grid: Grid | null;
  analysis: GridAnalysis | null;
  isSolving: boolean;
  errorMessage: string;
}

export function SolutionDisplay({
  solutions,
  grid,
  analysis,
  isSolving,
  errorMessage,
}: SolutionDisplayProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>解</h2>
        {!isSolving && !errorMessage && solutions.length > 0 && (
          <span className={styles.count}>{solutions.length}個</span>
        )}
      </div>

      {isSolving && (
        <div className={styles.message}>
          <p>解析中...</p>
        </div>
      )}

      {!isSolving && errorMessage && (
        <div className={styles.errorMessage}>
          <p>{errorMessage}</p>
        </div>
      )}

      {!isSolving && !errorMessage && solutions.length === 0 && (
        <div className={styles.message}>
          <p>「解く」ボタンを押すと解が表示されます</p>
        </div>
      )}

      {!isSolving && !errorMessage && solutions.length > 0 && grid && analysis && solutions.map((solution, index) => (
        <div key={index} className={styles.solutionContent}>
          <SolutionGrid
            grid={grid}
            solution={solution}
            slots={analysis.slots}
          />
          {solution.constraints && solution.constraints.length > 0 && (
            <div className={styles.constraints}>
              <div className={styles.constraintsTitle}>
                未入力の単語への制約:
              </div>
              <div className={styles.constraintsList}>
                {solution.constraints.map((constraint, idx) => (
                  <div key={idx} className={styles.constraintItem}>
                    {constraint}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
