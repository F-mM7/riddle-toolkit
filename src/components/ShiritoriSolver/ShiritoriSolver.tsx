import { useState } from 'react';
import {
  solveShiritori,
  solveShiritoriWithOneExclusion,
  SAMPLE_WORDS,
  type SolveResult,
  type SolveWithExclusionResult,
} from '../../utils/shiritoriSolver/solver';
import styles from './ShiritoriSolver.module.css';

type ResultState =
  | { mode: 'solve'; data: SolveResult }
  | { mode: 'exclusion'; data: SolveWithExclusionResult };

export function ShiritoriSolver() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<ResultState | null>(null);
  const [clearCount, setClearCount] = useState<number>(0);
  const [showSample, setShowSample] = useState<boolean>(false);

  const getWords = () =>
    inputText
      .split('\n')
      .map((w) => w.trim())
      .filter((w) => w !== '');

  const handleSolve = () => {
    const solveResult = solveShiritori(getWords());
    setResult({ mode: 'solve', data: solveResult });
    setClearCount(0);
  };

  const handleExclusionSolve = () => {
    const exclusionResult = solveShiritoriWithOneExclusion(getWords());
    setResult({ mode: 'exclusion', data: exclusionResult });
    setClearCount(0);
  };

  const handleSample = () => {
    setInputText(SAMPLE_WORDS.join('\n'));
    setClearCount(0);
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);

    const newCount = clearCount + 1;
    setClearCount(newCount);

    if (newCount >= 5) {
      setShowSample(true);
    }
  };

  return (
    <div className={styles.container}>
      {/* 入力エリア */}
      <div className={styles.inputSection}>
        <h2 className={styles.label}>単語リスト</h2>
        <textarea
          className={styles.textarea}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="1行に1単語..."
          rows={24}
        />
        <div className={styles.buttonGroup}>
          <button className={styles.button} onClick={handleSolve}>
            Solve
          </button>
          <button className={styles.button} onClick={handleExclusionSolve}>
            1つ除外
          </button>
          {showSample && (
            <button
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={handleSample}
            >
              Sample
            </button>
          )}
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>

      {/* 結果表示エリア */}
      <div className={styles.resultSection}>
        <h2 className={styles.label}>結果</h2>
        {result === null ? (
          <p className={styles.placeholder}>
            単語を入力してSolveを押してください
          </p>
        ) : result.data.error ? (
          <p className={styles.error}>{result.data.error}</p>
        ) : result.mode === 'solve' ? (
          result.data.solutions.length === 0 ? (
            <p className={styles.noSolution}>解が見つかりませんでした</p>
          ) : (
            <>
              <p className={styles.solutionCount}>
                {result.data.solutions.length}件の解が見つかりました
              </p>
              <div className={styles.solutions}>
                {result.data.solutions.map((solution, idx) => (
                  <div key={idx} className={styles.solutionItem}>
                    <h3 className={styles.solutionTitle}>解 {idx + 1}</h3>
                    <ol className={styles.wordList}>
                      {solution.words.map((word, wordIdx) => (
                        <li key={wordIdx}>{word}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </>
          )
        ) : result.data.results.length === 0 ? (
          <p className={styles.noSolution}>
            1つ除外で連結するパターンが見つかりませんでした
          </p>
        ) : (
          <>
            <p className={styles.solutionCount}>
              {result.data.results.length}件のパターンが見つかりました
            </p>
            <div className={styles.solutions}>
              {result.data.results.map((r) => (
                <div key={r.excludedIndex} className={styles.solutionItem}>
                  <h3 className={styles.solutionTitle}>
                    <span className={styles.excludedWord}>
                      {r.excludedWord}
                    </span>{' '}
                    を除外
                  </h3>
                  <ol className={styles.wordList}>
                    {r.solution.words.map((word, wordIdx) => (
                      <li key={wordIdx}>{word}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
