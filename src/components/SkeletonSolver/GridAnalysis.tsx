import type {
  GridAnalysis as GridAnalysisType,
  WordsByLength,
} from '../../utils/skeletonSolver/types';
import styles from './GridAnalysis.module.css';

interface GridAnalysisProps {
  analysis: GridAnalysisType | null;
  words: string[];
}

// 単語リストを文字数でグループ化
function groupWordsByLength(words: string[]): WordsByLength {
  const grouped: WordsByLength = {};
  words.forEach((word) => {
    const len = word.length;
    if (!grouped[len]) grouped[len] = [];
    grouped[len].push(word);
  });
  return grouped;
}

export function GridAnalysis({ analysis, words }: GridAnalysisProps) {
  if (!analysis || analysis.totalWords === 0) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>入力状況</h2>
        <p className={styles.emptyMessage}>
          グリッドにマスを配置してください
        </p>
      </div>
    );
  }

  const wordsByLength = groupWordsByLength(words);

  // すべての文字数を取得（必要数と入力数の両方から）
  const allLengths = new Set<number>();
  Object.keys(analysis.wordLengthCounts).forEach((len) =>
    allLengths.add(parseInt(len))
  );
  Object.keys(wordsByLength).forEach((len) => allLengths.add(parseInt(len)));
  const lengths = Array.from(allLengths).sort((a, b) => a - b);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>入力状況</h2>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th></th>
              {lengths.map((len) => (
                <th key={len}>{len}文字</th>
              ))}
              <th>計</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.rowHeader}>横</td>
              {lengths.map((len) => (
                <td key={len}>{analysis.horizontalLengthCounts[len] || 0}</td>
              ))}
              <td className={styles.totalCell}>{analysis.horizontalCount}</td>
            </tr>
            <tr>
              <td className={styles.rowHeader}>縦</td>
              {lengths.map((len) => (
                <td key={len}>{analysis.verticalLengthCounts[len] || 0}</td>
              ))}
              <td className={styles.totalCell}>{analysis.verticalCount}</td>
            </tr>
            <tr className={styles.separatorRow}>
              <td colSpan={lengths.length + 2} className={styles.separator}>
                <div className={styles.separatorLine}></div>
              </td>
            </tr>
            <tr className={styles.totalRow}>
              <td className={styles.rowHeader}>計</td>
              {lengths.map((len) => (
                <td key={len}>{analysis.wordLengthCounts[len] || 0}</td>
              ))}
              <td className={styles.totalCell}>{analysis.totalWords}</td>
            </tr>
            <tr>
              <td className={styles.rowHeader}>入力</td>
              {lengths.map((len) => {
                const required = analysis.wordLengthCounts[len] || 0;
                const provided = wordsByLength[len]?.length || 0;
                const diff = provided - required;
                return (
                  <td key={len}>
                    {provided}
                    {diff !== 0 && (
                      <span
                        className={
                          diff > 0 ? styles.overStatus : styles.shortStatus
                        }
                      >
                        ({diff > 0 ? '+' : ''}
                        {diff})
                      </span>
                    )}
                  </td>
                );
              })}
              <td className={styles.totalCell}>{words.length}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
