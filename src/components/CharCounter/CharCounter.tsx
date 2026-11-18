import { useState, useMemo } from 'react';
import { TextInput } from './TextInput';
import { StatsDisplay } from './StatsDisplay';
import {
  analyzeText,
  sortCharacterCounts,
  type SortOrder,
} from '../../utils/charCounter/textAnalyzer';
import styles from './CharCounter.module.css';

export function CharCounter() {
  const [text, setText] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('appearance');
  const stats = useMemo(() => analyzeText(text), [text]);
  const sortedCounts = useMemo(
    () => sortCharacterCounts(stats.characterCounts, sortOrder),
    [stats, sortOrder]
  );

  return (
    <div className={styles.container}>
      <TextInput value={text} onChange={setText} />
      <StatsDisplay
        stats={{ ...stats, characterCounts: sortedCounts }}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />
    </div>
  );
}
