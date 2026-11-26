import { useState, useMemo } from 'react';
import type { SearchMode, SearchTarget, Pattern } from '../../utils/prefectureRegex/types';
import { prefectures, capitals } from '../../data/regions';
import { findMatches } from '../../utils/prefectureRegex/matcher';
import { findPartialMatches } from '../../utils/prefectureRegex/partialMatcher';
import { buildEntries } from '../../utils/prefectureRegex/entries';
import { ModeSelector } from './ModeSelector';
import { PatternInput } from './PatternInput';
import { ResultDisplay } from './ResultDisplay';
import { PartialInput } from './PartialInput';
import { PartialResultDisplay } from './PartialResultDisplay';
import styles from './PrefectureRegex.module.css';

const SEARCH_MODE_OPTIONS = [
  { value: 'regex', label: '正規表現' },
  { value: 'partial', label: '部分一致' },
] as const satisfies readonly { value: SearchMode; label: string }[];

const TARGET_OPTIONS = [
  { value: 'prefecture', label: '都道府県名' },
  { value: 'capital', label: '県庁所在地名' },
  { value: 'both', label: '両方' },
] as const satisfies readonly { value: SearchTarget; label: string }[];

export function PrefectureRegex() {
  const [searchMode, setSearchMode] = useState<SearchMode>('regex');
  const [target, setTarget] = useState<SearchTarget>('prefecture');
  const [patterns, setPatterns] = useState<Pattern[]>([{ id: '1', value: '', isValid: true }]);
  const [query, setQuery] = useState('');

  // 選択された対象の項目一覧
  const entries = useMemo(() => buildEntries(target, prefectures, capitals), [target]);
  const showList = target === 'both';

  // 正規表現のマッチング結果
  const regexResults = useMemo(() => {
    if (searchMode !== 'regex') {
      return [];
    }
    // すべてのパターンが有効で空でない場合のみマッチング実行
    if (patterns.every((p) => p.isValid && p.value !== '')) {
      return findMatches(patterns, entries);
    }
    return [];
  }, [searchMode, patterns, entries]);

  // 部分一致の検索結果
  const partialResults = useMemo(
    () => (searchMode === 'partial' ? findPartialMatches(query, entries) : []),
    [searchMode, query, entries]
  );

  return (
    <div className={styles.container}>
      <div className={styles.selectors}>
        <ModeSelector
          label="検索モード"
          options={SEARCH_MODE_OPTIONS}
          value={searchMode}
          onChange={setSearchMode}
        />
        <ModeSelector label="対象" options={TARGET_OPTIONS} value={target} onChange={setTarget} />
      </div>
      {searchMode === 'regex' ? (
        <>
          <PatternInput patterns={patterns} onPatternsChange={setPatterns} />
          <ResultDisplay results={regexResults} patterns={patterns} showList={showList} />
        </>
      ) : (
        <>
          <PartialInput query={query} onQueryChange={setQuery} />
          <PartialResultDisplay query={query} results={partialResults} showList={showList} />
        </>
      )}
    </div>
  );
}
