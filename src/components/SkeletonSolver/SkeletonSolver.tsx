import { useState, useMemo } from 'react';
import { type Grid, type Solution } from '../../utils/skeletonSolver/types';
import { GridInput } from './GridInput';
import { WordListInput } from './WordListInput';
import { GridAnalysis } from './GridAnalysis';
import { SolutionDisplay } from './SolutionDisplay';
import { analyzeGrid } from '../../utils/skeletonSolver/gridAnalyzer';
import { solveSkeleton } from '../../utils/skeletonSolver/solver';
import { checkWordsValid } from '../../utils/skeletonSolver/validation';
import styles from './SkeletonSolver.module.css';

// nxnの空のグリッドを生成
const createEmptyGrid = (size: number): Grid => {
  return Array.from({ length: size }, () => Array(size).fill(false));
};

// 単語リストをパース
const parseWordList = (text: string): string[] => {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
};

// サンプルデータ
const SAMPLE_GRID: Grid = [
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, true, false, false, false],
  [false, false, false, false, false, false, true, false, false, false],
  [false, false, true, false, true, false, true, false, false, false],
  [false, false, true, false, true, true, true, true, false, false],
  [false, false, true, false, true, false, false, true, false, false],
  [false, false, true, true, true, true, false, true, false, false],
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false],
];

const SAMPLE_WORDS = `ライオン
ブランコ
コーラ
イノシシ
シシマイ
ハブラシ`;

// サンプルデータ2
const SAMPLE_GRID_2: Grid = [
  [false, false, false, false, false, false, false, false, false, false],
  [true, false, false, false, false, false, false, false, false, false],
  [true, false, false, false, false, false, false, false, false, false],
  [true, true, true, true, false, false, false, false, false, false],
  [false, false, false, true, false, false, false, false, false, false],
  [false, false, false, true, true, true, true, false, false, false],
  [false, false, false, false, false, false, true, false, false, false],
  [false, false, false, false, false, false, true, true, true, true],
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false],
];

const SAMPLE_WORDS_2 = `きばつ
かりぬし
しらが
がんせき
てぢか
つかいて`;

export function SkeletonSolver() {
  const [gridSize, setGridSize] = useState<number>(10);
  const [grid, setGrid] = useState<Grid>(createEmptyGrid(10));
  const [wordListText, setWordListText] = useState<string>('');
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [solvedGrid, setSolvedGrid] = useState<Grid | null>(null);
  const [solvedAnalysis, setSolvedAnalysis] = useState<ReturnType<
    typeof analyzeGrid
  > | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [solutionError, setSolutionError] = useState<string>('');
  const [clearCount, setClearCount] = useState<number>(0);
  const [showSamples, setShowSamples] = useState<boolean>(false);

  // 単語リストをパース
  const words = useMemo(() => parseWordList(wordListText), [wordListText]);

  // グリッド解析
  const analysis = useMemo(() => analyzeGrid(grid), [grid]);

  // 単語が条件を満たしているかチェック
  const isWordsValid = useMemo(
    () => checkWordsValid(analysis, words),
    [analysis, words]
  );

  // グリッド変更時の処理
  const handleGridChange = (newGrid: Grid) => {
    setGrid(newGrid);
    setClearCount(0); // カウントをリセット
  };

  // 単語リスト変更時の処理
  const handleWordListChange = (text: string) => {
    setWordListText(text);
    setClearCount(0); // カウントをリセット
  };

  // サイズ変更
  const handleSizeChange = (newSize: number) => {
    setGridSize(newSize);
    setGrid(createEmptyGrid(newSize));
    setSolutions([]);
    setSolutionError('');
    setClearCount(0); // カウントをリセット
  };

  // クリア機能
  const handleClear = () => {
    setGrid(createEmptyGrid(gridSize));
    setWordListText('');
    setSolutions([]);
    setSolutionError('');

    // クリア回数をカウント
    const newCount = clearCount + 1;
    setClearCount(newCount);

    // 5回連続でクリアするとsampleボタンを表示
    if (newCount >= 5) {
      setShowSamples(true);
    }
  };

  // サンプル読み込み
  const handleLoadSample = () => {
    const sampleSize = SAMPLE_GRID.length;
    setGridSize(sampleSize);
    setGrid(SAMPLE_GRID);
    setWordListText(SAMPLE_WORDS);
    setSolutions([]);
    setSolutionError('');
  };

  // サンプル2読み込み
  const handleLoadSample2 = () => {
    const sampleSize = SAMPLE_GRID_2.length;
    setGridSize(sampleSize);
    setGrid(SAMPLE_GRID_2);
    setWordListText(SAMPLE_WORDS_2);
    setSolutions([]);
    setSolutionError('');
  };

  // 解く
  const handleSolve = () => {
    setSolutionError('');
    setSolutions([]);
    setSolvedGrid(null);
    setSolvedAnalysis(null);

    // バリデーション
    if (analysis.totalWords === 0) {
      setSolutionError('グリッドにマスを配置してください');
      return;
    }

    if (words.length === 0) {
      setSolutionError('単語リストを入力してください');
      return;
    }

    setIsSolving(true);

    // 解を計算する時点のグリッドと解析結果を保存
    const currentGrid = grid.map((row) => [...row]);
    const currentAnalysis = analysis;

    // 少し遅延させてローディング表示を見せる
    setTimeout(() => {
      try {
        const foundSolutions = solveSkeleton(currentAnalysis, words, 100);

        if (foundSolutions.length === 0) {
          setSolutionError('解が見つかりませんでした');
        } else {
          setSolutions(foundSolutions);
          setSolvedGrid(currentGrid);
          setSolvedAnalysis(currentAnalysis);
        }
      } catch (error) {
        setSolutionError('エラーが発生しました');
        console.error(error);
      } finally {
        setIsSolving(false);
      }
    }, 100);
  };

  return (
    <div className={styles.container}>
      <div className={styles.actions}>
        {showSamples && (
          <>
            <button
              onClick={handleLoadSample}
              className={styles.buttonSecondary}
              type="button"
            >
              sample1
            </button>
            <button
              onClick={handleLoadSample2}
              className={styles.buttonSecondary}
              type="button"
            >
              sample2
            </button>
          </>
        )}
        <button
          onClick={handleClear}
          className={styles.buttonSecondary}
          type="button"
        >
          clear
        </button>
        <button
          onClick={handleSolve}
          className={styles.buttonPrimary}
          type="button"
          disabled={isSolving || !isWordsValid}
        >
          {isSolving ? 'solving...' : 'solve'}
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.panel}>
          <GridInput
            grid={grid}
            onGridChange={handleGridChange}
            gridSize={gridSize}
            onSizeChange={handleSizeChange}
          />
        </div>

        <div className={styles.panel}>
          <WordListInput
            value={wordListText}
            onChange={handleWordListChange}
            wordCount={words.length}
          />
          <GridAnalysis analysis={analysis} words={words} />
        </div>

        <div className={styles.panel}>
          <SolutionDisplay
            solutions={solutions}
            grid={solvedGrid}
            analysis={solvedAnalysis}
            isSolving={isSolving}
            errorMessage={solutionError}
          />
        </div>
      </div>
    </div>
  );
}
