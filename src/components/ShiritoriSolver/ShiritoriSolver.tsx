import { useState } from 'react';
import {
  solveShiritori,
  SAMPLE_WORDS,
} from '../../utils/shiritoriSolver/solver';
import styles from './ShiritoriSolver.module.css';

export function ShiritoriSolver() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<{
    solutions: { words: string[] }[];
    error?: string;
  } | null>(null);

  const handleSolve = () => {
    const words = inputText
      .split('\n')
      .map((w) => w.trim())
      .filter((w) => w !== '');
    const solveResult = solveShiritori(words);
    setResult(solveResult);
  };

  const handleSample = () => {
    setInputText(SAMPLE_WORDS.join('\n'));
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
  };

  return (
    <div className={styles.container}>
      {/* 入力エリア */}
      <div className={styles.inputSection}>
        <h2 className={styles.label}>単語リスト（1行に1単語）</h2>
        <textarea
          className={styles.textarea}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="単語を1行に1つずつ入力してください..."
          rows={24}
        />
        <div className={styles.buttonGroup}>
          <button className={styles.button} onClick={handleSolve}>
            Solve
          </button>
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={handleSample}
          >
            Sample
          </button>
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
            単語を入力して「解く」ボタンを押してください
          </p>
        ) : result.error ? (
          <p className={styles.error}>{result.error}</p>
        ) : result.solutions.length === 0 ? (
          <p className={styles.noSolution}>
            解が見つかりませんでした（全ての単語を使うしりとりは不可能です）
          </p>
        ) : (
          <>
            <p className={styles.solutionCount}>
              {result.solutions.length}件の解が見つかりました
            </p>
            <div className={styles.solutions}>
              {result.solutions.map((solution, idx) => (
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
        )}
      </div>
    </div>
  );
}
