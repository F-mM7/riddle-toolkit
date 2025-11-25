import { useState, useMemo } from 'react';
import type { SearchMode, Pattern } from '../../utils/prefectureRegex/types';
import { prefectures, capitals } from '../../data/regions';
import { findMatches } from '../../utils/prefectureRegex/matcher';
import { ModeSelector } from './ModeSelector';
import { PatternInput } from './PatternInput';
import { ResultDisplay } from './ResultDisplay';
import styles from './PrefectureRegex.module.css';

export function PrefectureRegex() {
  const [mode, setMode] = useState<SearchMode>('prefecture');
  const [patterns, setPatterns] = useState<Pattern[]>([
    { id: '1', value: '', isValid: true },
  ]);

  // 選択されたデータを取得
  const data = mode === 'prefecture' ? prefectures : capitals;

  // マッチング結果を計算（useMemo）
  const results = useMemo(() => {
    // すべてのパターンが有効で空でない場合のみマッチング実行
    if (patterns.every(p => p.isValid && p.value !== '')) {
      return findMatches(patterns, data);
    }
    return [];
  }, [patterns, data]);

  return (
    <div className={styles.container}>
      <ModeSelector mode={mode} onModeChange={setMode} />
      <PatternInput patterns={patterns} onPatternsChange={setPatterns} />
      <ResultDisplay results={results} patterns={patterns} />
    </div>
  );
}
