import type { NameEntry } from '../../utils/prefectureRegex/types';
import { MatchedName } from './MatchedName';
import styles from './ResultDisplay.module.css';

interface PartialResultDisplayProps {
  query: string;
  results: NameEntry[];
  showList: boolean;
}

export function PartialResultDisplay({ query, results, showList }: PartialResultDisplayProps) {
  if (query === '') {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>検索結果</h3>
        <p className={styles.placeholder}>検索する文字を入力してください</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>検索結果</h3>
        <p className={styles.noResults}>含む名前は見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>検索結果 ({results.length}件)</h3>

      <div className={styles.resultList}>
        {results.map((entry) => (
          <div key={`${entry.list}-${entry.name}`} className={styles.resultCard}>
            <MatchedName name={entry.name} list={entry.list} showList={showList} />
          </div>
        ))}
      </div>
    </div>
  );
}
