import { useEffect, useState } from 'react';
import { ARITHMETIC_SYMBOLS, symbolsLabel } from '../../utils/cryptarithmSolver/arithmeticSymbols';
import { MAX_SOLUTIONS } from '../../utils/cryptarithmSolver/cryptarithmSolver';
import { extractLetters } from '../../utils/cryptarithmSolver/extractLetters';
import type {
  CryptarithmSolution,
  ParseError,
  WorkerRequest,
  WorkerResponse,
} from '../../utils/cryptarithmSolver/types';
import styles from './CryptarithmSolver.module.css';

// 入力が止まってから探索を始めるまでの待ち時間(ms)
const DEBOUNCE_MS = 300;

// サンプルの覆面算
const SAMPLE_INPUT = 'SEND+MORE=MONEY';

// 割り当て欄に並べる数字(左列 0〜4、右列 5〜9)
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// 探索の状態
type SolveStatus =
  | { kind: 'idle' } // 空入力で何も探していない
  | { kind: 'solving' } // 探索中(デバウンス待ちを含む)
  | { kind: 'done'; count: number; truncated: boolean; hasEquations: boolean }
  | { kind: 'error'; errors: ParseError[] };

export function CryptarithmSolver() {
  const [inputText, setInputText] = useState('');
  // 抜き出し指定(数字の並び)。探索には使わない
  const [extractPattern, setExtractPattern] = useState('');
  const [solutions, setSolutions] = useState<CryptarithmSolution[]>([]);
  const [status, setStatus] = useState<SolveStatus>({ kind: 'idle' });
  // 不完全なため探索から外した行
  const [skipped, setSkipped] = useState<ParseError[]>([]);
  const [clearCount, setClearCount] = useState<number>(0);
  const [showSample, setShowSample] = useState<boolean>(false);

  // 入力が変わったら、前の結果を消して状態を切り替える
  const updateInput = (text: string) => {
    setInputText(text);
    setSolutions([]);
    setSkipped([]);
    setStatus(text.trim() === '' ? { kind: 'idle' } : { kind: 'solving' });
  };

  // 入力が変わったらデバウンスして Worker で探索する
  useEffect(() => {
    if (inputText.trim() === '') return;

    let worker: Worker | null = null;
    // 入力が変わった後に古い Worker のメッセージを反映しないための印
    let cancelled = false;
    const timer = setTimeout(() => {
      worker = new Worker(
        new URL('../../utils/cryptarithmSolver/solver.worker.ts', import.meta.url),
        {
          type: 'module',
        }
      );

      const currentWorker = worker;
      currentWorker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        if (cancelled) return;
        const message = event.data;
        switch (message.type) {
          case 'skipped':
            setSkipped(message.errors);
            break;
          case 'solution':
            // 解が見つかるたびにカードを追加する
            setSolutions((prev) => [...prev, message.solution]);
            break;
          case 'done':
            setStatus({
              kind: 'done',
              count: message.count,
              truncated: message.truncated,
              hasEquations: message.hasEquations,
            });
            currentWorker.terminate();
            break;
          case 'error':
            setStatus({ kind: 'error', errors: message.errors });
            currentWorker.terminate();
            break;
        }
      };

      currentWorker.onerror = (event) => {
        if (cancelled) return;
        console.error(event);
        setStatus({
          kind: 'error',
          errors: [{ line: 0, message: '計算中にエラーが発生しました' }],
        });
        currentWorker.terminate();
      };

      const request: WorkerRequest = {
        type: 'solve',
        input: inputText,
        maxSolutions: MAX_SOLUTIONS,
      };
      currentWorker.postMessage(request);
    }, DEBOUNCE_MS);

    // 入力が変わったとき・アンマウント時に前の探索を止める
    return () => {
      cancelled = true;
      clearTimeout(timer);
      worker?.terminate();
    };
  }, [inputText]);

  const handleSample = () => {
    updateInput(SAMPLE_INPUT);
    setClearCount(0);
  };

  const handleClear = () => {
    updateInput('');
    setExtractPattern('');

    const newCount = clearCount + 1;
    setClearCount(newCount);

    // 5回連続でクリアすると Sample ボタンを表示
    if (newCount >= 5) {
      setShowSample(true);
    }
  };

  // 結果欄の状態表示
  const renderStatus = () => {
    switch (status.kind) {
      case 'idle':
        return <p className={styles.placeholder}>覆面算を入力してください</p>;
      case 'solving':
        return <p className={styles.statusText}>探索中…({solutions.length}件)</p>;
      case 'done':
        // 有効な行が無いときは、空入力と同じく結果を何も出さない
        if (!status.hasEquations) return null;
        if (status.count === 0) {
          return <p className={styles.noSolution}>解なし</p>;
        }
        return (
          <p className={styles.statusText}>
            {status.truncated
              ? `${MAX_SOLUTIONS}件で打ち切り(解が多すぎるため、以降は探していません)`
              : `${status.count}件の解が見つかりました`}
          </p>
        );
      case 'error':
        return (
          <ul className={styles.errorList}>
            {status.errors.map((error, idx) => (
              <li key={idx} className={styles.error}>
                {error.line > 0 ? `${error.line}行目: ` : ''}
                {error.message}
              </li>
            ))}
          </ul>
        );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputSection}>
        <h2 className={styles.label}>覆面算</h2>
        <label className={styles.extractField}>
          <span className={styles.extractLabel}>抜き出し</span>
          <input
            type="text"
            className={styles.extractInput}
            value={extractPattern}
            onChange={(e) => setExtractPattern(e.target.value)}
            placeholder="例: 123"
            inputMode="numeric"
            spellCheck={false}
          />
        </label>
        <textarea
          className={styles.textarea}
          value={inputText}
          onChange={(e) => updateInput(e.target.value)}
          placeholder={'1行に1つの等式...\n例: SEND+MORE=MONEY'}
          rows={12}
          spellCheck={false}
        />
        <h3 className={styles.symbolsTitle}>算術記号として扱われる記号</h3>
        <table className={styles.symbolsTable}>
          <thead>
            <tr>
              <th>意味</th>
              <th>半角</th>
              <th>全角</th>
            </tr>
          </thead>
          <tbody>
            {ARITHMETIC_SYMBOLS.map((row) => (
              <tr key={row.meaning}>
                <td>{row.meaning}</td>
                <td className={styles.symbol}>{symbolsLabel(row.halfWidth)}</td>
                <td className={styles.symbol}>{symbolsLabel(row.fullWidth)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.buttonGroup}>
          {showSample && (
            <button
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={handleSample}
              type="button"
            >
              Sample
            </button>
          )}
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={handleClear}
            type="button"
          >
            Clear
          </button>
        </div>
      </div>

      <div className={styles.resultSection}>
        <h2 className={styles.label}>解</h2>
        {renderStatus()}
        {skipped.length > 0 && (
          <p className={styles.skippedNote}>
            不完全な行は無視しています:{' '}
            {skipped.map((error) => `${error.line}行目(${error.message})`).join('、')}
          </p>
        )}
        {solutions.length > 0 && (
          <div className={styles.solutions}>
            {solutions.map((solution, idx) => {
              const extracted = extractLetters(extractPattern, solution.assignments);
              return (
                <div key={idx} className={styles.solutionCard}>
                  <h3 className={styles.solutionTitle}>解 {idx + 1}</h3>
                  {extracted !== null && <div className={styles.extracted}>{extracted}</div>}
                  <div className={styles.equations}>
                    {solution.equations.map((equation, eqIdx) => (
                      <div key={eqIdx} className={styles.equation}>
                        {equation}
                      </div>
                    ))}
                  </div>
                  <ul className={styles.assignments}>
                    {DIGITS.map((digit) => {
                      const letter = solution.assignments.find((a) => a.digit === digit)?.letter;
                      return (
                        <li key={digit} className={styles.assignment}>
                          {digit} ={' '}
                          {letter !== undefined ? (
                            letter
                          ) : (
                            <span className={styles.unusedDigit}>-</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
