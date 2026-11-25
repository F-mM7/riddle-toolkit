import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { LAYOUTS, MAX_SETS } from '../../utils/wordVenn/layouts';
import { SET_COLORS } from '../../utils/wordVenn/colors';
import { calculateRegions } from '../../utils/wordVenn/vennLogic';
import VennDiagram from './VennDiagram';
import styles from './WordVenn.module.css';

/** 図が扱う集合の最小数(単語が1〜2個でも3集合の図を出す) */
const MIN_SETS = 3;

/** クリアの連打とみなす押下間隔(ミリ秒) */
const CLEAR_TAP_INTERVAL_MS = 600;

/** 試験入力を入れるクリアの連打回数 */
const CLEAR_TAP_COUNT = 3;

/**
 * 試験入力: 全領域に1文字ずつ入る単語の組。
 * 1〜(2^MAX_SETS - 1) の数 k を32進の1文字(1〜9, a〜v)で表し、
 * 単語 i は k の MAX_SETS 桁2進表現で上から i 桁目が1の文字を昇順に並べたもの。
 */
const TEST_WORDS = Array.from({ length: MAX_SETS }, (_, i) => {
  const bit = 1 << (MAX_SETS - 1 - i);
  let word = '';
  for (let k = 1; k < 1 << MAX_SETS; k++) {
    if (k & bit) word += k.toString(32);
  }
  return word;
});

/** 末尾の空欄を落とす(途中の空欄は詰めない) */
function trimTrailingEmpty(words: string[]): string[] {
  let end = words.length;
  while (end > 0 && words[end - 1] === '') {
    end--;
  }
  return words.slice(0, end);
}

export function WordVenn() {
  const [words, setWords] = useState<string[]>([]);
  const [selectedLayoutId, setSelectedLayoutId] = useState<string | null>(null);

  // 入力のある最後の欄までの個数
  const filledCount = words.length;
  // n 個入力されたら n+1 欄目を表示する(最低3欄、上限 MAX_SETS)
  const fieldCount = Math.min(MAX_SETS, Math.max(MIN_SETS, filledCount + 1));
  const isAtLimit = fieldCount === MAX_SETS;

  // 図の集合数と配置
  const setCount = Math.max(MIN_SETS, filledCount);
  const layouts = LAYOUTS[setCount];
  const layout = layouts.find((l) => l.id === selectedLayoutId) ?? layouts[0];

  const paddedWords = Array.from({ length: setCount }, (_, i) => words[i] ?? '');
  const regions = calculateRegions(paddedWords);

  const handleChange = (index: number, value: string) => {
    setWords((prev) => {
      const next = Array.from(
        { length: Math.max(prev.length, index + 1) },
        (_, i) => prev[i] ?? ''
      );
      next[index] = value;
      return trimTrailingEmpty(next);
    });
  };

  // 直近のクリア押下時刻(連打検出用)
  const clearTapTimesRef = useRef<number[]>([]);

  const handleClear = () => {
    const now = Date.now();
    const prevTimes = clearTapTimesRef.current;
    const last = prevTimes[prevTimes.length - 1];
    const times =
      last !== undefined && now - last <= CLEAR_TAP_INTERVAL_MS ? [...prevTimes, now] : [now];

    if (times.length >= CLEAR_TAP_COUNT) {
      clearTapTimesRef.current = [];
      setWords(TEST_WORDS);
      return;
    }
    clearTapTimesRef.current = times;
    setWords([]);
  };

  return (
    <div className={styles.container}>
      {/* 入力エリア */}
      <div className={styles.inputSection}>
        <h2 className={styles.label}>入力</h2>
        <div className={styles.inputGroup}>
          {Array.from({ length: fieldCount }, (_, i) => (
            <div
              key={i}
              className={styles.inputRow}
              style={{ '--set-color': SET_COLORS[i].fill } as CSSProperties}
            >
              <label className={styles.inputLabel} htmlFor={`word-venn-${i}`}>
                単語{i + 1}
              </label>
              <input
                id={`word-venn-${i}`}
                type="text"
                className={styles.input}
                value={words[i] ?? ''}
                onChange={(e) => handleChange(i, e.target.value)}
              />
            </div>
          ))}
          {isAtLimit && <p className={styles.note}>最大 {MAX_SETS} 個までです</p>}
        </div>
        <button type="button" className={styles.button} onClick={handleClear}>
          クリア
        </button>
      </div>

      {/* ベン図表示エリア */}
      <div className={styles.diagramSection}>
        <h2 className={styles.label}>ベン図</h2>
        {layouts.length >= 2 && (
          <div className={styles.segment} role="group" aria-label="配置">
            {layouts.map((l) => (
              <button
                key={l.id}
                type="button"
                className={`${styles.segmentButton} ${l.id === layout.id ? styles.segmentActive : ''}`}
                aria-pressed={l.id === layout.id}
                onClick={() => setSelectedLayoutId(l.id)}
              >
                {l.name}
              </button>
            ))}
          </div>
        )}
        <VennDiagram layout={layout} regions={regions} colors={SET_COLORS} />
      </div>
    </div>
  );
}
