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
        <h2 className={styles.title}>グリッド解析</h2>
        <p className={styles.emptyMessage}>
          グリッドにマスを配置してください
        </p>
      </div>
    );
  }

  const wordsByLength = groupWordsByLength(words);

  // 各文字数ごとの必要数と入力数を比較
  const lengthComparison: Array<{
    length: number;
    required: number;
    provided: number;
    status: 'ok' | 'short' | 'over';
  }> = [];

  Object.entries(analysis.wordLengthCounts).forEach(([lengthStr, required]) => {
    const length = parseInt(lengthStr);
    const provided = wordsByLength[length]?.length || 0;
    let status: 'ok' | 'short' | 'over' = 'ok';
    if (provided < required) status = 'short';
    else if (provided > required) status = 'over';

    lengthComparison.push({ length, required, provided, status });
  });

  // 全体のステータス
  const allOk = lengthComparison.every((item) => item.status === 'ok');

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>グリッド解析</h2>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>必要な単語数</h3>
        <div className={styles.stat}>
          <span className={styles.label}>合計:</span>
          <span className={styles.value}>{analysis.totalWords}個</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>横方向:</span>
          <span className={styles.value}>{analysis.horizontalCount}個</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>縦方向:</span>
          <span className={styles.value}>{analysis.verticalCount}個</span>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>文字数分布</h3>
        {lengthComparison.map((item) => (
          <div key={item.length} className={styles.lengthRow}>
            <span className={styles.lengthLabel}>{item.length}文字:</span>
            <span className={styles.lengthValue}>
              {item.provided} / {item.required}個
            </span>
            <span className={`${styles.status} ${styles[item.status]}`}>
              {item.status === 'ok' && '✓'}
              {item.status === 'short' && '不足'}
              {item.status === 'over' && '過剰'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
